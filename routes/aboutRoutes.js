const express = require("express");
const router = express.Router();
const { getAboutMain, updateAboutMain } = require("../controllers/aboutMainController");
const { protect } = require("../middleware/auth");
const { uploadAboutImage } = require("../middleware/upload");

// Middleware to ensure user is logged in and is an admin
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route   GET /api/about/main
// @desc    Get the About Main section data
// @access  Public (so the frontend website can access it too)
router.get("/main", getAboutMain);

// @route   PUT /api/about/main
// @desc    Update the About Main section data
// @access  Private/Admin
router.put(
  "/main",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "founderImage", maxCount: 1 },
    { name: "workLogos", maxCount: 10 },
  ]),
  updateAboutMain
);

module.exports = router;
