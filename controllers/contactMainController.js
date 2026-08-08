const asyncHandler = require("express-async-handler");
const ContactMain = require("../models/ContactMain");
const { cloudinary } = require("../config/cloudinary");

const getDoc = async () => {
  let doc = await ContactMain.findOne();
  if (!doc) doc = await ContactMain.create({});
  return doc;
};

// @desc   Get the Contact page content
// @route  GET /api/contact-main/main
// @access Public
const getContactMain = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  res.json({ success: true, data: doc });
});

// Delete an old Cloudinary image by its stored URL
const deleteOld = async (url) => {
  if (!url) return;
  try {
    const urlParts = url.split("/upload/");
    if (urlParts.length > 1) {
      const publicIdWithExt = urlParts[1].replace(/^v\d+\//, "");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error("Failed to delete contact hero image:", err);
  }
};

// @desc   Update the Contact Hero section
// @route  PUT /api/contact-main/main/hero
// @access Private/Admin
// The image is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself.
const updateContactHeroSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { heading, image } = req.body;

  const existing = doc.heroSection?.image || "";
  if (image && image !== existing) {
    await deleteOld(existing);
  }

  doc.heroSection = { heading: heading || "", image: image || existing };
  await doc.save();
  res.json({ success: true, data: doc });
});

module.exports = { getContactMain, updateContactHeroSection };
