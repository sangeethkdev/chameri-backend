const express = require("express");
const router = express.Router();
const {
  getServiceMain,
  updateServiceHeroSection,
  updateServiceCardsSection,
  updateServiceTestimonialSection,
} = require("../controllers/serviceMainController");
const { protect } = require("../middleware/auth");
const { uploadServiceVideo, uploadServiceImage } = require("../middleware/upload");

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
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  uploadServiceVideo.fields([{ name: "video", maxCount: 1 }]),
  updateServiceHeroSection
);

// @route  PUT /api/services/main/cards-section
// @access Private/Admin
router.put(
  "/main/cards-section",
  protect,
  requireAdmin,
  uploadServiceImage.fields([{ name: "cardImages" }]),
  updateServiceCardsSection
);

// @route  PUT /api/services/main/testimonial
// @access Private/Admin
router.put(
  "/main/testimonial",
  protect,
  requireAdmin,
  uploadServiceImage.fields([
    { name: "testimonialImages", maxCount: 20 },
    { name: "testimonialCardImages", maxCount: 20 },
  ]),
  updateServiceTestimonialSection
);

module.exports = router;
