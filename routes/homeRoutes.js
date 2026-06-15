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
} = require("../controllers/homeMainController");
const { protect } = require("../middleware/auth");
const { uploadAboutImage } = require("../middleware/upload"); // Re-using image uploader

// Middleware to ensure user is logged in and is an admin
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") {
    return next();
  }
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route   GET /api/home/main
router.get("/main", getHomeMain);

// @route   PUT /api/home/main/hero
router.put("/main/hero", protect, requireAdmin, updateHomeHeroSection);

// @route   PUT /api/home/main/about-us
router.put("/main/about-us", protect, requireAdmin, updateHomeAboutUsSection);

// @route   PUT /api/home/main/logos
router.put(
  "/main/logos",
  protect,
  requireAdmin,
  uploadAboutImage.fields([{ name: "homeLogos", maxCount: 15 }]),
  updateHomeLogosSection
);

// @route   PUT /api/home/main/villaplan
router.put(
  "/main/villaplan",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "card1Image", maxCount: 1 },
    { name: "card2Image", maxCount: 1 },
  ]),
  updateHomeVillaPlanSection
);

// @route   PUT /api/home/main/chooseus
router.put(
  "/main/chooseus",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "card1Image", maxCount: 1 },
    { name: "card2Image", maxCount: 1 },
    { name: "card3Image", maxCount: 1 },
  ]),
  updateHomeChooseUsSection
);

// @route   PUT /api/home/main/gallery
router.put(
  "/main/gallery",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "card1Images", maxCount: 2 },
    { name: "card2Images", maxCount: 2 },
    { name: "card3Images", maxCount: 2 },
    { name: "card4Images", maxCount: 2 },
    { name: "card5Images", maxCount: 2 },
  ]),
  updateHomeGallerySection
);

// @route   PUT /api/home/main/ourteam
router.put(
  "/main/ourteam",
  protect,
  requireAdmin,
  uploadAboutImage.fields([
    { name: "card1Image", maxCount: 1 },
    { name: "card2Image", maxCount: 1 },
    { name: "card3Image", maxCount: 1 },
    { name: "card4Image", maxCount: 1 },
    { name: "card5Image", maxCount: 1 },
  ]),
  updateHomeOurTeamSection
);

// @route   PUT /api/home/main/testimonial
router.put(
  "/main/testimonial",
  protect,
  requireAdmin,
  uploadAboutImage.fields([{ name: "testimonialImages", maxCount: 20 }]),
  updateHomeTestimonialSection
);

module.exports = router;
