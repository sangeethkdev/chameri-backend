const express = require("express");
const router = express.Router();
const {
  getKiwanoMain,
  updateKiwanoHeroSection,
  updateKiwanoLuxuryVillasSection,
  updateKiwanoFeatureSection,
  updateKiwanoTour360Section,
  updateKiwanoGallerySection,
  updateKiwanoAmenitiesSection,
  updateKiwanoOtherProjectSection,
  updateKiwanoHighlightsSection,
} = require("../controllers/kiwanoMainController");
const { protect } = require("../middleware/auth");
const { uploadKiwanoVideo, uploadKiwanoImage, uploadKiwanoMedia } = require("../middleware/upload");

const uploadKiwanoHighlights = uploadKiwanoMedia.fields([
  { name: "video", maxCount: 1 },
  { name: "images", maxCount: 4 },
]);

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/kiwano/main
// @access Public
router.get("/main", getKiwanoMain);

// @route  PUT /api/kiwano/main/hero
// @access Private/Admin
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  uploadKiwanoVideo.fields([{ name: "video", maxCount: 1 }]),
  updateKiwanoHeroSection
);

// @route  PUT /api/kiwano/main/luxury-villas
// @access Private/Admin
router.put(
  "/main/luxury-villas",
  protect,
  requireAdmin,
  updateKiwanoLuxuryVillasSection
);

// @route  PUT /api/kiwano/main/feature-section
// @access Private/Admin
router.put(
  "/main/feature-section",
  protect,
  requireAdmin,
  uploadKiwanoImage.fields([{ name: "featureImages" }]),
  updateKiwanoFeatureSection
);

// @route  PUT /api/kiwano/main/tour360-section
// @access Private/Admin
// Media already lives on Cloudinary by the time this runs — the frontend
// uploads it directly (see /api/uploads/signature) and sends the resulting
// URL here as plain JSON, so no upload middleware is needed.
router.put(
  "/main/tour360-section",
  protect,
  requireAdmin,
  updateKiwanoTour360Section
);

// @route  PUT /api/kiwano/main/gallery-section
// @access Private/Admin
// Images already live on Cloudinary by the time this runs — the frontend
// uploads them directly (see /api/uploads/signature) and sends the
// resulting URLs here as plain JSON, so no upload middleware is needed.
router.put(
  "/main/gallery-section",
  protect,
  requireAdmin,
  updateKiwanoGallerySection
);

// @route  PUT /api/kiwano/main/amenities-section
// @access Private/Admin
router.put(
  "/main/amenities-section",
  protect,
  requireAdmin,
  updateKiwanoAmenitiesSection
);

// @route  PUT /api/kiwano/main/other-project-section
// @access Private/Admin
router.put(
  "/main/other-project-section",
  protect,
  requireAdmin,
  uploadKiwanoImage.fields([{ name: "image", maxCount: 1 }]),
  updateKiwanoOtherProjectSection
);

// @route  PUT /api/kiwano/main/highlights-section
// @access Private/Admin
router.put(
  "/main/highlights-section",
  protect,
  requireAdmin,
  uploadKiwanoHighlights,
  updateKiwanoHighlightsSection
);

module.exports = router;
