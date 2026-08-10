const express = require("express");
const router = express.Router();
const {
  getTestimonialsMain,
  updateTestimonialsHeroSection,
  updateTestimonialsReviewsSection,
} = require("../controllers/testimonialsMainController");
const { protect } = require("../middleware/auth");
// Note: uploads for /main/hero and /main/reviews go straight from the
// browser to Cloudinary (see uploadToCloudinary on the frontend), so no
// multer middleware is needed on these routes anymore.

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
router.put("/main/hero", protect, requireAdmin, updateTestimonialsHeroSection);

// @route  PUT /api/testimonials-main/main/reviews
// @access Private/Admin
router.put("/main/reviews", protect, requireAdmin, updateTestimonialsReviewsSection);

module.exports = router;
