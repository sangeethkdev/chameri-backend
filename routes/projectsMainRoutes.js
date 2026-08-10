const express = require("express");
const router = express.Router();
const {
  getProjectsMain,
  updateProjectsHeroSection,
  updateProjectsCardsSection,
} = require("../controllers/projectsMainController");
const { protect } = require("../middleware/auth");

// Guard: admin-only writes
const requireAdmin = (req, res, next) => {
  if (req.admin?.role === "admin") return next();
  res.status(403);
  throw new Error("Access denied — admin role required");
};

// @route  GET /api/projects-main/main
// @access Public
router.get("/main", getProjectsMain);

// @route  PUT /api/projects-main/main/hero
// @access Private/Admin
// Image is uploaded straight to Cloudinary from the browser; the request
// body is plain JSON containing the resolved image URL (no multer).
router.put("/main/hero", protect, requireAdmin, updateProjectsHeroSection);

// @route  PUT /api/projects-main/main/cards-section
// @access Private/Admin
// Card images are uploaded straight to Cloudinary from the browser; the
// request body is plain JSON containing the resolved cards array (no multer).
router.put("/main/cards-section", protect, requireAdmin, updateProjectsCardsSection);

module.exports = router;
