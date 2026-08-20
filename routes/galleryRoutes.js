const express = require("express");
const router = express.Router();
const {
  getGalleryMain,
  updateGalleryHeroSection,
  updateGalleryImages,
  updateGalleryEvents,
} = require("../controllers/galleryMainController");
const { protect } = require("../middleware/auth");

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/gallery/main
// @access Public
router.get("/main", getGalleryMain);

// @route  PUT /api/gallery/main/hero
// @access Private/Admin
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  updateGalleryHeroSection
);

// @route  PUT /api/gallery/main/images
// @access Private/Admin
router.put(
  "/main/images",
  protect,
  requireAdmin,
  updateGalleryImages
);

// @route  PUT /api/gallery/main/events
// @access Private/Admin
router.put(
  "/main/events",
  protect,
  requireAdmin,
  updateGalleryEvents
);

module.exports = router;
