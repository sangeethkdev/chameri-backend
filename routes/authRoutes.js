const express = require("express");
const router = express.Router();
const {
  checkRole,
  login,
  getMe,
  updatePassword,
  updateProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// NOTE: Registration is disabled — only admins can create users via /api/admin/users

// ── Public ────────────────────────────────────────────────────────────────────
router.post("/check-role", checkRole);   // used by login page to show/hide forgot link
router.post("/login", login);

// ── Forgot-password OTP flow (admin-only enforced in controller) ──────────────
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// ── Private ───────────────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.put("/update-password", protect, updatePassword);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
