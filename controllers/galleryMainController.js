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
// Images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URLs, never the files themselves, so it isn't exposed to
// Vercel's ~4.5MB serverless function body limit.
const updateGalleryHeroSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { firstText, secondText, thirdText, firstImage, secondImage, thirdImage } = req.body;

  if (firstText  !== undefined) doc.heroSection.first.text  = firstText;
  if (secondText !== undefined) doc.heroSection.second.text = secondText;
  if (thirdText  !== undefined) doc.heroSection.third.text  = thirdText;

  if (firstImage  !== undefined) doc.heroSection.first.image  = firstImage;
  if (secondImage !== undefined) doc.heroSection.second.image = secondImage;
  if (thirdImage  !== undefined) doc.heroSection.third.image  = thirdImage;

  await doc.save();
  res.json({ success: true, data: doc });
});

// @desc  PUT /api/gallery/main/images
// @access Private/Admin
// Images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the final
// list of URLs, never the files themselves, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
const updateGalleryImages = asyncHandler(async (req, res) => {
  const doc = await getDoc();

  const { galleryImages } = req.body;
  doc.galleryImages = Array.isArray(galleryImages) ? galleryImages : [];

  await doc.save();
  res.json({ success: true, data: doc });
});

module.exports = {
  getGalleryMain,
  updateGalleryHeroSection,
  updateGalleryImages,
};
