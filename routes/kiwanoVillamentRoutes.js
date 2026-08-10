const express = require("express");
const router = express.Router();
const {
  getKiwanoVillamentMain,
  updateKiwanoVillamentHeroSection,
  updateKiwanoVillamentLuxuryVillasSection,
  updateKiwanoVillamentFeatureSection,
  updateKiwanoVillamentTour360Section,
  updateKiwanoVillamentGallerySection,
  updateKiwanoVillamentAmenitiesSection,
  updateKiwanoVillamentOtherProjectSection,
  updateKiwanoVillamentHighlightsSection,
} = require("../controllers/kiwanoVillamentMainController");
const { protect } = require("../middleware/auth");
const { uploadKiwanoVillamentVideo, uploadKiwanoVillamentImage, uploadKiwanoVillamentMedia } = require("../middleware/upload");

const uploadKiwanoVillamentHighlights = uploadKiwanoVillamentMedia.fields([
  { name: "video", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/kiwano-villament/main
// @access Public
router.get("/main", getKiwanoVillamentMain);

// @route  PUT /api/kiwano-villament/main/hero
// @access Private/Admin
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  uploadKiwanoVillamentVideo.fields([{ name: "video", maxCount: 1 }]),
  updateKiwanoVillamentHeroSection
);

// @route  PUT /api/kiwano-villament/main/luxury-villas
// @access Private/Admin
router.put(
  "/main/luxury-villas",
  protect,
  requireAdmin,
  updateKiwanoVillamentLuxuryVillasSection
);

// @route  PUT /api/kiwano-villament/main/feature-section
// @access Private/Admin
router.put(
  "/main/feature-section",
  protect,
  requireAdmin,
  uploadKiwanoVillamentImage.fields([{ name: "featureImages" }]),
  updateKiwanoVillamentFeatureSection
);

// @route  PUT /api/kiwano-villament/main/tour360-section
// @access Private/Admin
// Media already lives on Cloudinary by the time this runs — the frontend
// uploads it directly (see /api/uploads/signature) and sends the resulting
// URL here as plain JSON, so no upload middleware is needed.
router.put(
  "/main/tour360-section",
  protect,
  requireAdmin,
  updateKiwanoVillamentTour360Section
);

// @route  PUT /api/kiwano-villament/main/gallery-section
// @access Private/Admin
// Images already live on Cloudinary by the time this runs — the frontend
// uploads them directly (see /api/uploads/signature) and sends the
// resulting URLs here as plain JSON, so no upload middleware is needed.
router.put(
  "/main/gallery-section",
  protect,
  requireAdmin,
  updateKiwanoVillamentGallerySection
);

// @route  PUT /api/kiwano-villament/main/amenities-section
// @access Private/Admin
router.put(
  "/main/amenities-section",
  protect,
  requireAdmin,
  updateKiwanoVillamentAmenitiesSection
);

// @route  PUT /api/kiwano-villament/main/other-project-section
// @access Private/Admin
router.put(
  "/main/other-project-section",
  protect,
  requireAdmin,
  uploadKiwanoVillamentImage.fields([{ name: "image", maxCount: 1 }]),
  updateKiwanoVillamentOtherProjectSection
);

// @route  PUT /api/kiwano-villament/main/highlights-section
// @access Private/Admin
router.put(
  "/main/highlights-section",
  protect,
  requireAdmin,
  uploadKiwanoVillamentHighlights,
  updateKiwanoVillamentHighlightsSection
);

module.exports = router;
