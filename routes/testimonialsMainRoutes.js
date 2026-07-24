const express = require("express");
const router = express.Router();
const {
  getTestimonialsMain,
  updateTestimonialsHeroSection,
  updateTestimonialsReviewsSection,
} = require("../controllers/testimonialsMainController");
const { protect } = require("../middleware/auth");
const { uploadTestimonialImage, uploadTestimonialMedia } = require("../middleware/upload");

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/testimonials-main/main
// @access Public
router.get("/main", getTestimonialsMain);

// @route  PUT /api/testimonials-main/main/hero
// @access Private/Admin
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  uploadTestimonialImage.single("image"),
  updateTestimonialsHeroSection
);

// @route  PUT /api/testimonials-main/main/reviews
// @access Private/Admin
router.put(
  "/main/reviews",
  protect,
  requireAdmin,
  uploadTestimonialMedia.fields([
    { name: "reviewImages", maxCount: 50 },
    { name: "reviewVideos", maxCount: 50 },
  ]),
  updateTestimonialsReviewsSection
);

module.exports = router;
