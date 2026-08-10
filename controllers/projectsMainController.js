const asyncHandler = require("express-async-handler");
const ProjectsMain = require("../models/ProjectsMain");
const { cloudinary } = require("../config/cloudinary");

// ── Helper: get or create the single projects document ───────────────────────
const getDoc = async () => {
  let doc = await ProjectsMain.findOne();
  if (!doc) doc = await ProjectsMain.create({});
  return doc;
};

// ── Helper: delete an old Cloudinary image by its URL ─────────────────────────
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
    console.error("Failed to delete project card image:", err);
  }
};

// @desc   GET /api/projects-main/main
// @access Public
const getProjectsMain = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  res.json({ success: true, data: doc });
});

// @desc   PUT /api/projects-main/main/hero
// @access Private/Admin
// Image is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
const updateProjectsHeroSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { heading, image } = req.body;

  if (heading !== undefined) doc.heroSection.heading = heading;
  if (image !== undefined) doc.heroSection.image = image;

  await doc.save();
  res.json({ success: true, data: doc });
});

// @desc   PUT /api/projects-main/main/cards-section
// @access Private/Admin
// Card images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the final
// resolved cards array (each with an `image` URL), never the files
// themselves, so it isn't exposed to Vercel's ~4.5MB body limit.
const updateProjectsCardsSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();

  const cards = Array.isArray(req.body.cards) ? req.body.cards : [];

  const newCards = cards.map((card) => ({
    title: card.title || "",
    heading: card.heading || "",
    subheading: card.subheading || "",
    image: card.image || "",
  }));

  const oldImages = doc.cardsSection?.cards?.map((c) => c.image).filter(Boolean) || [];
  const newImages = newCards.map((c) => c.image).filter(Boolean);
  const removedImages = oldImages.filter((url) => !newImages.includes(url));
  for (const url of removedImages) await deleteOld(url);

  doc.cardsSection = { cards: newCards };
  await doc.save();
  res.json({ success: true, data: doc });
});

module.exports = { getProjectsMain, updateProjectsHeroSection, updateProjectsCardsSection };
