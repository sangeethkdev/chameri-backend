const express = require("express");
const router = express.Router();
const {
  getGalleryMain,
  updateGalleryHeroSection,
  updateGalleryImages,
} = require("../controllers/galleryMainController");
const { protect } = require("../middleware/auth");
const { createUploader } = require("../middleware/upload");

const uploadGalleryImage = createUploader("chameri/gallery");

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/gallery/main
// @access Public
router.get("/main", getGalleryMain);

// @route  PUT /api/gallery/main/hero
// @access Private/Admin
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  uploadGalleryImage.fields([
    { name: "firstImage",  maxCount: 1 },
    { name: "secondImage", maxCount: 1 },
    { name: "thirdImage",  maxCount: 1 },
  ]),
  updateGalleryHeroSection
);

// @route  PUT /api/gallery/main/images
// @access Private/Admin
router.put(
  "/main/images",
  protect,
  requireAdmin,
  uploadGalleryImage.fields([{ name: "galleryImages", maxCount: 100 }]),
  updateGalleryImages
);

module.exports = router;
