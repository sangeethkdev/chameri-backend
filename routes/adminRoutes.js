const express = require("express");
const router = express.Router();
const { protect, superAdmin } = require("../middleware/auth");
const {
  getUsers, createUser, deleteUser,
  updateUserRole, resetUserPassword,
  getRecoveryEmail, setRecoveryEmail,
} = require("../controllers/adminController");

// ── Middleware: must be logged in + must be admin/superadmin ─────────────────
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Access denied — admin role required");
};

router.use(protect);       // JWT check
router.use(requireAdmin);  // Role check

// ── User Management ──────────────────────────────────────────────────────────
router.get("/users", getUsers);
router.post("/users", createUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);

// ── Admin: Reset user password ───────────────────────────────────────────────
router.put("/users/:id/reset-password", resetUserPassword);

// ── Recovery Email ───────────────────────────────────────────────────────────
router.get("/recovery-email", getRecoveryEmail);
router.put("/recovery-email", setRecoveryEmail);

module.exports = router;
