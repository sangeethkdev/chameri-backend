const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    plainPassword: { type: String, default: "" }, // stored for superadmin visibility only
    role: { type: String, enum: ["admin", "editor", "viewer"], default: "editor" },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    // ── Forgot-password OTP ──────────────────────────────────────────────────
    otpCode:            { type: String, default: null },
    otpExpires:         { type: Date,   default: null },
    resetToken:         { type: String, default: null },
    resetTokenExpires:  { type: Date,   default: null },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);
