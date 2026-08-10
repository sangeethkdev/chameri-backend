const express = require("express");
const router = express.Router();
const {
  getServiceMain,
  updateServiceHeroSection,
  updateServiceCardsSection,
  updateServiceTestimonialSection,
} = require("../controllers/serviceMainController");
const { protect } = require("../middleware/auth");

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/services/main
// @access Public
router.get("/main", getServiceMain);

// @route  PUT /api/services/main/hero
// @access Private/Admin
// Body is plain JSON — the video is uploaded to Cloudinary client-side first
// (see uploadToCloudinary), so no multer/multipart handling is needed here.
router.put("/main/hero", protect, requireAdmin, updateServiceHeroSection);

// @route  PUT /api/services/main/cards-section
// @access Private/Admin
// Body is plain JSON — card images are uploaded to Cloudinary client-side first.
router.put("/main/cards-section", protect, requireAdmin, updateServiceCardsSection);

// @route  PUT /api/services/main/testimonial
// @access Private/Admin
// Body is plain JSON — testimonial images are uploaded to Cloudinary client-side first.
router.put("/main/testimonial", protect, requireAdmin, updateServiceTestimonialSection);

module.exports = router;
