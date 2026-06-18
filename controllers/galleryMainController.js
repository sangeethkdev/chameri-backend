const asyncHandler = require("express-async-handler");
const cloudinary = require("cloudinary").v2;
const GalleryMain = require("../models/GalleryMain");

// ── Helper: get or create the single gallery document ────────────────────────
const getDoc = async () => {
  let doc = await GalleryMain.findOne();
  if (!doc) doc = await GalleryMain.create({});
  return doc;
};

// ── Helper: upload a file buffer to Cloudinary ───────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", transformation: [{ quality: "auto", fetch_format: "auto" }] },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

// @desc  GET /api/gallery/main
// @access Public
const getGalleryMain = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  res.json({ success: true, data: doc });
});

// @desc  PUT /api/gallery/main/hero
// @access Private/Admin
const updateGalleryHeroSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { firstText, secondText, thirdText } = req.body;
  const files = req.files || {};

  if (firstText  !== undefined) doc.heroSection.first.text  = firstText;
  if (secondText !== undefined) doc.heroSection.second.text = secondText;
  if (thirdText  !== undefined) doc.heroSection.third.text  = thirdText;

  if (files.firstImage?.[0]) {
    doc.heroSection.first.image = files.firstImage[0].path;
  }
  if (files.secondImage?.[0]) {
    doc.heroSection.second.image = files.secondImage[0].path;
  }
  if (files.thirdImage?.[0]) {
    doc.heroSection.third.image = files.thirdImage[0].path;
  }

  await doc.save();
  res.json({ success: true, data: doc });
});

// @desc  PUT /api/gallery/main/images
// @access Private/Admin
const updateGalleryImages = asyncHandler(async (req, res) => {
  const doc = await getDoc();

  // Existing URLs kept by the client (after user removed some)
  let existing = [];
  try {
    existing = JSON.parse(req.body.existingImages || "[]");
  } catch (_) {
    existing = [];
  }

  // New files uploaded via multer-cloudinary — path is already the Cloudinary URL
  const newUrls = (req.files?.galleryImages || []).map((f) => f.path);

  doc.galleryImages = [...existing, ...newUrls];
  await doc.save();
  res.json({ success: true, data: doc });
});

module.exports = {
  getGalleryMain,
  updateGalleryHeroSection,
  updateGalleryImages,
};
