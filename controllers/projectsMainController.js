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
const updateProjectsHeroSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { heading } = req.body;

  if (heading !== undefined) doc.heroSection.heading = heading;
  if (req.file) doc.heroSection.image = req.file.path;

  await doc.save();
  res.json({ success: true, data: doc });
});

// @desc   PUT /api/projects-main/main/cards-section
// @access Private/Admin
const updateProjectsCardsSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();

  let parsedCards = [];
  try {
    parsedCards = JSON.parse(req.body.cardsData || "[]");
  } catch (_) {
    parsedCards = [];
  }

  const newCards = [];
  let fileIndex = 0;

  for (const card of parsedCards) {
    let imageUrl = card.existingImage || "";

    if (card.newImageIndex !== undefined && card.newImageIndex !== null) {
      if (req.files?.cardImages?.[fileIndex]) {
        if (imageUrl) await deleteOld(imageUrl);
        imageUrl = req.files.cardImages[fileIndex].path;
        fileIndex++;
      }
    }

    newCards.push({
      title: card.title || "",
      heading: card.heading || "",
      subheading: card.subheading || "",
      image: imageUrl,
    });
  }

  const oldImages = doc.cardsSection?.cards?.map((c) => c.image).filter(Boolean) || [];
  const newImages = newCards.map((c) => c.image).filter(Boolean);
  const removedImages = oldImages.filter((url) => !newImages.includes(url));
  for (const url of removedImages) await deleteOld(url);

  doc.cardsSection = { cards: newCards };
  await doc.save();
  res.json({ success: true, data: doc });
});

module.exports = { getProjectsMain, updateProjectsHeroSection, updateProjectsCardsSection };
