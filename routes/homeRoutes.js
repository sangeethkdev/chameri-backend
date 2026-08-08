const express = require("express");
const router = express.Router();
const multer = require("multer");
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
const { uploadHomeImage } = require("../middleware/upload");

// Middleware to ensure user is logged in (admin or editor can edit content)
const requireAdmin = (req, res, next) => {
  if (req.admin && (req.admin.role === "admin" || req.admin.role === "editor")) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Access denied — insufficient permissions" });
};

// ─── Multer error wrapper ────────────────────────────────────────────────────
// Multer errors (e.g. LIMIT_UNEXPECTED_FILE, Cloudinary failures) bypass
// asyncHandler. This wrapper catches them and sends proper JSON responses.
const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err.code || "", err.message);
      if (err instanceof multer.MulterError) {
        res.status(400);
        return next(new Error(`Upload error: ${err.message} (field: ${err.field || "unknown"})`));
      }
      res.status(500);
      return next(new Error(`File upload failed: ${err.message}`));
    }
    next();
  });
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
  handleUpload(uploadHomeImage.fields([{ name: "homeLogos", maxCount: 15 }])),
  updateHomeLogosSection
);

// @route   PUT /api/home/main/villaplan
// Images already live on Cloudinary by the time this runs — the frontend
// uploads them directly (see /api/uploads/signature) and sends the
// resulting URLs here as plain JSON, so no upload middleware is needed.
router.put("/main/villaplan", protect, requireAdmin, updateHomeVillaPlanSection);

// @route   PUT /api/home/main/chooseus
router.put(
  "/main/chooseus",
  protect,
  requireAdmin,
  handleUpload(uploadHomeImage.fields([
    { name: "card1Image", maxCount: 1 },
    { name: "card2Image", maxCount: 1 },
    { name: "card3Image", maxCount: 1 },
  ])),
  updateHomeChooseUsSection
);

// @route   PUT /api/home/main/gallery
router.put(
  "/main/gallery",
  protect,
  requireAdmin,
  handleUpload(uploadHomeImage.fields([
    { name: "card1Images", maxCount: 2 },
    { name: "card2Images", maxCount: 2 },
    { name: "card3Images", maxCount: 2 },
    { name: "card4Images", maxCount: 2 },
    { name: "card5Images", maxCount: 2 },
  ])),
  updateHomeGallerySection
);

// @route   PUT /api/home/main/ourteam
router.put(
  "/main/ourteam",
  protect,
  requireAdmin,
  handleUpload(uploadHomeImage.fields([
    { name: "card1Image", maxCount: 1 },
    { name: "card2Image", maxCount: 1 },
    { name: "card3Image", maxCount: 1 },
    { name: "card4Image", maxCount: 1 },
    { name: "card5Image", maxCount: 1 },
  ])),
  updateHomeOurTeamSection
);

// @route   PUT /api/home/main/testimonial
router.put(
  "/main/testimonial",
  protect,
  requireAdmin,
  handleUpload(uploadHomeImage.fields([
    { name: "testimonialImages", maxCount: 20 },
    { name: "testimonialCardImages", maxCount: 20 }
  ])),
  updateHomeTestimonialSection
);

// @route   PUT /api/home/main/faq
router.put("/main/faq", protect, requireAdmin, updateHomeFaqSection);

module.exports = router;
