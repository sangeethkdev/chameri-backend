const express = require("express");
const router = express.Router();
const {
  getProjectsMain,
  updateProjectsHeroSection,
  updateProjectsCardsSection,
} = require("../controllers/projectsMainController");
const { protect } = require("../middleware/auth");
const { uploadProjectImage } = require("../middleware/upload");

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
router.put(
  "/main/hero",
  protect,
  requireAdmin,
  uploadProjectImage.single("image"),
  updateProjectsHeroSection
);

// @route  PUT /api/projects-main/main/cards-section
// @access Private/Admin
router.put(
  "/main/cards-section",
  protect,
  requireAdmin,
  uploadProjectImage.fields([{ name: "cardImages" }]),
  updateProjectsCardsSection
);

module.exports = router;
