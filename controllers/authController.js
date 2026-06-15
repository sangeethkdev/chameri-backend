const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const Settings = require("../models/Settings");
const { cloudinary } = require("../config/cloudinary");
const { sendOtpEmail } = require("../config/mailer");

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });

// ─── Check Role (public — used by login page to show/hide forgot link) ────────
// @route  POST /api/auth/check-role
// @access Public
const checkRole = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.json({ isAdmin: false });

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("role");
  if (!admin) return res.json({ isAdmin: false });

  const isAdmin = admin.role === "admin";
  res.json({ isAdmin });
});

// ─── Login ────────────────────────────────────────────────────────────────────
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  res.json({
    success: true,
    token: generateToken(admin._id),
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar },
  });
});

// ─── Get Me ───────────────────────────────────────────────────────────────────
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ─── Update Password ──────────────────────────────────────────────────────────
// @route  PUT /api/auth/update-password
// @access Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id);
  if (!(await admin.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }
  admin.password = newPassword;
  admin.plainPassword = newPassword;
  await admin.save();
  res.json({ success: true, message: "Password updated" });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
// @route  PUT /api/auth/update-profile
// @access Private
const updateProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (req.body.name) admin.name = req.body.name;

  if (req.file) {
    if (admin.avatar) {
      const publicId = admin.avatar.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }
    admin.avatar = req.file.path;
  }

  await admin.save();

  res.json({
    success: true,
    message: "Profile updated",
    admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar },
  });
});

// ─── Forgot Password — Step 1 ─────────────────────────────────────────────────
// @route  POST /api/auth/forgot-password
// @access Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, recoveryEmail } = req.body;

  // 1. Find the admin account (identified by their login email from the login page)
  const admin = await Admin.findOne({ email: email?.toLowerCase().trim() });

  if (!admin) {
    res.status(400);
    throw new Error("No admin account found with this email.");
  }

  // Only admin can use forgot-password
  if (admin.role !== "admin") {
    res.status(403);
    throw new Error("Forgot password is only available for admin accounts.");
  }

  // 3. Get the stored recovery email from Settings
  const storedRecovery = await Settings.get("recovery_email");
  if (!storedRecovery) {
    res.status(400);
    throw new Error("No recovery email has been configured. Please contact the system administrator.");
  }

  // 4. ── KEY CHECK ── The entered recovery email MUST match the stored one exactly
  if (!recoveryEmail || recoveryEmail.toLowerCase().trim() !== storedRecovery.toLowerCase().trim()) {
    res.status(400);
    throw new Error("Incorrect recovery email. Only the recovery email configured in User Management is accepted.");
  }

  // 5. Generate 6-digit OTP (expires in 10 min)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  admin.otpCode = otp;
  admin.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  admin.resetToken = null;
  admin.resetTokenExpires = null;
  await admin.save();

  // 6. Send OTP to the recovery email (the one admin configured — NOT the login email)
  await sendOtpEmail(storedRecovery, otp, admin.name);

  res.json({
    success: true,
    message: "OTP sent to the recovery email. Check your inbox.",
    // Only return a masked hint, never expose the full email
    recoveryHint: storedRecovery.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
  });
});

// ─── Verify OTP — Step 2 ──────────────────────────────────────────────────────
// @route  POST /api/auth/verify-otp
// @access Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const admin = await Admin.findOne({ email: email?.toLowerCase().trim() });

  if (!admin || !admin.otpCode) {
    res.status(400);
    throw new Error("Invalid or expired OTP. Please request a new one.");
  }

  if (admin.otpExpires < new Date()) {
    res.status(400);
    throw new Error("OTP has expired. Please request a new one.");
  }

  if (admin.otpCode !== otp.trim()) {
    res.status(400);
    throw new Error("Incorrect OTP. Please try again.");
  }

  // Issue a short-lived reset token (15 min)
  const resetToken = crypto.randomBytes(32).toString("hex");
  admin.otpCode = null;
  admin.otpExpires = null;
  admin.resetToken = resetToken;
  admin.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
  await admin.save();

  res.json({ success: true, resetToken });
});

// ─── Reset Password — Step 3 ──────────────────────────────────────────────────
// @route  POST /api/auth/reset-password
// @access Public
const resetPassword = asyncHandler(async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters.");
  }

  const admin = await Admin.findOne({ email: email?.toLowerCase().trim() });

  if (
    !admin ||
    !admin.resetToken ||
    admin.resetToken !== resetToken ||
    admin.resetTokenExpires < new Date()
  ) {
    res.status(400);
    throw new Error("Reset session expired or invalid. Please start over.");
  }

  admin.password = newPassword;
  admin.plainPassword = newPassword;
  admin.resetToken = null;
  admin.resetTokenExpires = null;
  await admin.save();

  res.json({ success: true, message: "Password reset successfully. You can now log in." });
});

module.exports = { checkRole, login, getMe, updatePassword, updateProfile, forgotPassword, verifyOtp, resetPassword };
