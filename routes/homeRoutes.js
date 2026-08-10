const express = require("express");
const router = express.Router();
const {
  getHomeMain,
  updateHomeHeroSection,
  updateHomeAboutUsSection,
  updateHomeLogosSection,
  updateHomeVillaPlanSection,
  updateHomeChooseUsSection,
  updateHomeGallerySection,
  updateHomeOurTeamSection,
  updateHomeTestimonialSection,
  updateHomeFaqSection,
} = require("../controllers/homeMainController");
const { protect } = require("../middleware/auth");

// Middleware to ensure user is logged in (admin or editor can edit content)
const requireAdmin = (req, res, next) => {
  if (req.admin && (req.admin.role === "admin" || req.admin.role === "editor")) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied — insufficient permissions" });
};

// @route   GET /api/home/main
router.get("/main", getHomeMain);

// @route   PUT /api/home/main/hero
router.put("/main/hero", protect, requireAdmin, updateHomeHeroSection);

// @route   PUT /api/home/main/about-us
router.put("/main/about-us", protect, requireAdmin, updateHomeAboutUsSection);

// @route   PUT /api/home/main/logos
// Images already live on Cloudinary by the time this runs — the frontend
// uploads them directly (see /api/uploads/signature) and sends the
// resulting URLs here as plain JSON, so no upload middleware is needed.
router.put("/main/logos", protect, requireAdmin, updateHomeLogosSection);

// @route   PUT /api/home/main/villaplan
// Images already live on Cloudinary by the time this runs — the frontend
// uploads them directly (see /api/uploads/signature) and sends the
// resulting URLs here as plain JSON, so no upload middleware is needed.
router.put("/main/villaplan", protect, requireAdmin, updateHomeVillaPlanSection);

// @route   PUT /api/home/main/chooseus
// Images already live on Cloudinary by the time this runs — see note above.
router.put("/main/chooseus", protect, requireAdmin, updateHomeChooseUsSection);

// @route   PUT /api/home/main/gallery
// Images already live on Cloudinary by the time this runs — see note above.
router.put("/main/gallery", protect, requireAdmin, updateHomeGallerySection);

// @route   PUT /api/home/main/ourteam
// Images already live on Cloudinary by the time this runs — see note above.
router.put("/main/ourteam", protect, requireAdmin, updateHomeOurTeamSection);

// @route   PUT /api/home/main/testimonial
// Images already live on Cloudinary by the time this runs — see note above.
router.put("/main/testimonial", protect, requireAdmin, updateHomeTestimonialSection);

// @route   PUT /api/home/main/faq
router.put("/main/faq", protect, requireAdmin, updateHomeFaqSection);

module.exports = router;
