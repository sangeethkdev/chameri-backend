const asyncHandler = require("express-async-handler");
const TestimonialsMain = require("../models/TestimonialsMain");
const { cloudinary } = require("../config/cloudinary");

// ── Helper: get or create the single testimonials document ───────────────────
const getDoc = async () => {
  let doc = await TestimonialsMain.findOne();
  if (!doc) doc = await TestimonialsMain.create({});
  return doc;
};

// ── Helper: delete an old Cloudinary asset by its URL ─────────────────────────
const deleteOld = async (url, resourceType = "image") => {
  if (!url) return;
  try {
    const urlParts = url.split("/upload/");
    if (urlParts.length > 1) {
      const publicIdWithExt = urlParts[1].replace(/^v\d+\//, "");
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    }
  } catch (err) {
    console.error("Failed to delete review asset:", err);
  }
};

// @desc   GET /api/testimonials-main/main
// @access Public
const getTestimonialsMain = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  res.json({ success: true, data: doc });
});

// @desc   PUT /api/testimonials-main/main/hero
// @access Private/Admin
const updateTestimonialsHeroSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();
  const { heading } = req.body;

  if (heading !== undefined) doc.heroSection.heading = heading;
  if (req.file) doc.heroSection.image = req.file.path;

  await doc.save();
  res.json({ success: true, data: doc });
});

// @desc   PUT /api/testimonials-main/main/reviews
// @access Private/Admin
const updateTestimonialsReviewsSection = asyncHandler(async (req, res) => {
  const doc = await getDoc();

  let parsedCards = [];
  try {
    parsedCards = JSON.parse(req.body.reviewsData || "[]");
  } catch (_) {
    parsedCards = [];
  }

  const newCards = [];
  let imageFileIndex = 0;
  let videoFileIndex = 0;

  for (const card of parsedCards) {
    let imageUrl = card.existingImage || "";
    let videoUrl = card.existingVideo || "";

    if (card.newImageIndex !== undefined && card.newImageIndex !== null) {
      if (req.files?.reviewImages?.[imageFileIndex]) {
        if (imageUrl) await deleteOld(imageUrl, "image");
        imageUrl = req.files.reviewImages[imageFileIndex].path;
        imageFileIndex++;
      }
    }

    if (card.newVideoIndex !== undefined && card.newVideoIndex !== null) {
      if (req.files?.reviewVideos?.[videoFileIndex]) {
        if (videoUrl) await deleteOld(videoUrl, "video");
        videoUrl = req.files.reviewVideos[videoFileIndex].path;
        videoFileIndex++;
      }
    }

    newCards.push({
      image: imageUrl,
      video: videoUrl,
      quote: card.quote || "",
      name: card.name || "",
      role: card.role || "",
      rating: card.rating || 5,
    });
  }

  const oldImages = doc.reviewsSection?.cards?.map((c) => c.image).filter(Boolean) || [];
  const newImages = newCards.map((c) => c.image).filter(Boolean);
  const removedImages = oldImages.filter((url) => !newImages.includes(url));
  for (const url of removedImages) await deleteOld(url, "image");

  const oldVideos = doc.reviewsSection?.cards?.map((c) => c.video).filter(Boolean) || [];
  const newVideos = newCards.map((c) => c.video).filter(Boolean);
  const removedVideos = oldVideos.filter((url) => !newVideos.includes(url));
  for (const url of removedVideos) await deleteOld(url, "video");

  doc.reviewsSection = { cards: newCards };
  await doc.save();
  res.json({ success: true, data: doc });
});

module.exports = {
  getTestimonialsMain,
  updateTestimonialsHeroSection,
  updateTestimonialsReviewsSection,
};
