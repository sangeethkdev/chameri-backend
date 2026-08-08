const express = require("express");
const router = express.Router();
const { getContactMain, updateContactHeroSection } = require("../controllers/contactMainController");
const { protect } = require("../middleware/auth");

// Guard: admin or editor may edit content
const requireAdmin = (req, res, next) => {
  if (req.admin && (req.admin.role === "admin" || req.admin.role === "editor")) {
    return next();
  }
  res.status(403);
  throw new Error("Access denied — insufficient permissions");
};

// @route  GET /api/contact-main/main
// @access Public
router.get("/main", getContactMain);

// @route  PUT /api/contact-main/main/hero
// @access Private/Admin
router.put("/main/hero", protect, requireAdmin, updateContactHeroSection);

module.exports = router;
