const express = require("express");
const router = express.Router();
const {
  getAboutMain,
  updateAboutMain,
  updateHeroSection,
  updateStorySection,
  updateFounderSection,
  updateLogosSection,
  updateVisionMissionSection,
  updateSpecialSection,
  updateBoardSection,
  updateTestimonialSection,
} = require("../controllers/aboutMainController");
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
// @desc    Update entire About Main section (legacy/fallback)
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

// --- Per-section routes ---

// @route   PUT /api/about/main/hero
router.put("/main/hero", protect, requireAdmin, updateHeroSection);

// @route   PUT /api/about/main/story
router.put("/main/story", protect, requireAdmin, updateStorySection);

// @route   PUT /api/about/main/founder
router.put(
  "/main/founder",
  protect,
  requireAdmin,
  uploadAboutImage.fields([{ name: "founderImage", maxCount: 1 }]),
  updateFounderSection
);

// @route   PUT /api/about/main/logos
router.put(
  "/main/logos",
  protect,
  requireAdmin,
  uploadAboutImage.fields([{ name: "workLogos", maxCount: 10 }]),
  updateLogosSection
);

// @route   PUT /api/about/main/vision-mission
router.put(
  "/main/vision-mission",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "visionImage", maxCount: 1 },
    { name: "missionImage", maxCount: 1 },
  ]),
  updateVisionMissionSection
);

// @route   PUT /api/about/main/special-section
router.put(
  "/main/special-section",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "firstImage",  maxCount: 1 },
    { name: "secondImage", maxCount: 1 },
    { name: "thirdImage",  maxCount: 1 },
    { name: "fourthImage", maxCount: 1 },
    { name: "fifthImage",  maxCount: 1 },
  ]),
  updateSpecialSection
);

// @route   PUT /api/about/main/board-section
router.put(
  "/main/board-section",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "firstImage",  maxCount: 1 },
    { name: "secondImage", maxCount: 1 },
    { name: "thirdImage",  maxCount: 1 },
    { name: "fourthImage", maxCount: 1 },
  ]),
  updateBoardSection
);

// @route   PUT /api/about/main/testimonial-section
router.put(
  "/main/testimonial-section",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "testimonialImages", maxCount: 20 },
    { name: "testimonialCardImages", maxCount: 20 },
  ]),
  updateTestimonialSection
);

module.exports = router;
