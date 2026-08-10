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
// @access  Private/Admin
// The founder image is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) and sent here as plain JSON, so no upload
// middleware is needed.
router.put("/main/founder", protect, requireAdmin, updateFounderSection);

// @route   PUT /api/about/main/logos
// @access  Private/Admin
// Logos are uploaded directly to Cloudinary from the browser and sent here
// as the final list of URLs, so no upload middleware is needed.
router.put("/main/logos", protect, requireAdmin, updateLogosSection);

// @route   PUT /api/about/main/vision-mission
// @access  Private/Admin
// Images are uploaded directly to Cloudinary from the browser and sent here
// as plain JSON URLs, so no upload middleware is needed.
router.put("/main/vision-mission", protect, requireAdmin, updateVisionMissionSection);

// @route   PUT /api/about/main/special-section
// @access  Private/Admin
// Images are uploaded directly to Cloudinary from the browser and sent here
// as plain JSON URLs, so no upload middleware is needed.
router.put("/main/special-section", protect, requireAdmin, updateSpecialSection);

// @route   PUT /api/about/main/board-section
// @access  Private/Admin
// Images are uploaded directly to Cloudinary from the browser and sent here
// as plain JSON URLs, so no upload middleware is needed.
router.put("/main/board-section", protect, requireAdmin, updateBoardSection);

// @route   PUT /api/about/main/testimonial-section
// @access  Private/Admin
// Each card's image/cardImage is resolved to a final Cloudinary URL in the
// browser before this request is sent, so no upload middleware is needed.
router.put("/main/testimonial-section", protect, requireAdmin, updateTestimonialSection);

module.exports = router;
