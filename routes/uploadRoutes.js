const express = require("express");
const router = express.Router();
const { getUploadSignature } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

// Guard: any logged-in admin or editor may upload content
const requireEditorOrAdmin = (req, res, next) => {
  if (req.admin && (req.admin.role === "admin" || req.admin.role === "editor")) {
    return next();
  }
  res.status(403);
  throw new Error("Access denied — insufficient permissions");
};

// @route  POST /api/uploads/signature
// @access Private (admin or editor)
router.post("/signature", protect, requireEditorOrAdmin, getUploadSignature);

module.exports = router;
