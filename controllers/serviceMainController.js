const ServiceMain = require("../models/ServiceMain");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get Service main data
// @route   GET /api/services/main
// @access  Public
exports.getServiceMain = async (req, res) => {
  try {
    let data = await ServiceMain.findOne();
    if (!data) {
      data = await ServiceMain.create({});
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Service hero section
// @route   PUT /api/services/main/hero
// @access  Private/Admin
exports.updateServiceHeroSection = async (req, res) => {
  try {
    const { heading, subheading, video } = req.body;
    let data = await ServiceMain.findOne();
    if (!data) data = new ServiceMain();

    data.heroSection.heading = heading !== undefined ? heading : data.heroSection.heading;
    data.heroSection.subheading = subheading !== undefined ? subheading : data.heroSection.subheading;

    // video is already a Cloudinary URL, uploaded client-side before this
    // request — only destroy the old asset when it's actually being replaced.
    if (video !== undefined && video !== data.heroSection.video) {
      if (data.heroSection.video) {
        try {
          const parts = data.heroSection.video.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/services/${publicId}`, { resource_type: "video" });
        } catch (err) {
          console.error("Failed to delete old hero video:", err);
        }
      }
      data.heroSection.video = video;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Service cards section
// @route   PUT /api/services/main/cards-section
// @access  Private/Admin
exports.updateServiceCardsSection = async (req, res) => {
  try {
    let data = await ServiceMain.findOne();
    if (!data) data = new ServiceMain();

    const { cardsHeading, cardsSubheading, cardsData } = req.body;

    // cardsData arrives as a plain JSON array — each card's image is already
    // a Cloudinary URL, resolved client-side (new files uploaded directly to
    // Cloudinary) before this request was sent.
    const parsedCards = Array.isArray(cardsData) ? cardsData : [];

    const deleteOld = async (url) => {
      if (!url) return;
      try {
        const parts = url.split("/");
        const publicId = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`chameri/services/${publicId}`);
      } catch (err) {
        console.error("Failed to delete card image:", err);
      }
    };

    const newCards = parsedCards.map((card) => ({
      heading: card.heading || "",
      subheading: card.subheading || "",
      image: card.image || "",
    }));

    const oldImages = data.cardsSection?.cards?.map((c) => c.image).filter(Boolean) || [];
    const newImages = newCards.map((c) => c.image).filter(Boolean);

    const removedImages = oldImages.filter((url) => !newImages.includes(url));
    for (const url of removedImages) {
      await deleteOld(url);
    }

    data.cardsSection = {
      heading: cardsHeading || "",
      subheading: cardsSubheading || "",
      cards: newCards,
    };

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Service testimonial section
// @route   PUT /api/services/main/testimonial
// @access  Private/Admin
exports.updateServiceTestimonialSection = async (req, res) => {
  try {
    let data = await ServiceMain.findOne();
    if (!data) data = new ServiceMain();

    const { heading, subheading, testimonialsData } = req.body;

    // testimonialsData arrives as a plain JSON array — each item's image and
    // cardImage are already Cloudinary URLs, resolved client-side (new files
    // uploaded directly to Cloudinary) before this request was sent.
    const parsedCards = Array.isArray(testimonialsData) ? testimonialsData : [];

    // Helper: delete old Cloudinary image by URL
    const deleteOld = async (url, resourceType = "image") => {
      if (!url) return;
      try {
        const urlParts = url.split("/upload/");
        if (urlParts.length > 1) {
          const publicIdWithExt = urlParts[1].replace(/^v\d+\//, "");
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
          // Videos live under a separate Cloudinary resource type — destroying
          // one without saying so silently no-ops and leaks the asset.
          await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        }
      } catch (err) {
        console.error("Failed to delete testimonial media:", err);
      }
    };

    const MEDIA_TYPES = new Set(["image", "video", "youtube"]);

    const newCards = parsedCards.map((card) => {
      const cardMediaType = MEDIA_TYPES.has(card.cardMediaType) ? card.cardMediaType : "image";
      return {
        quote: card.quote || "",
        name: card.name || "",
        designation: card.designation || "",
        image: card.image || "",
        // Only the asset matching the chosen media type is kept, so switching
        // type leaves no orphan URL behind for the cleanup pass below to miss.
        cardImage: cardMediaType === "image" ? card.cardImage || "" : "",
        cardVideo: cardMediaType === "video" ? card.cardVideo || "" : "",
        cardYoutubeUrl: cardMediaType === "youtube" ? card.cardYoutubeUrl || "" : "",
        cardMediaType,
      };
    });

    const oldImages = data.testimonial?.cards?.map((c) => c.image).filter(Boolean) || [];
    const newImages = newCards.map((c) => c.image).filter(Boolean);
    const oldCardImages = data.testimonial?.cards?.map((c) => c.cardImage).filter(Boolean) || [];
    const newCardImages = newCards.map((c) => c.cardImage).filter(Boolean);

    // Uploaded card videos are Cloudinary assets too, so they need the same
    // orphan cleanup as images (YouTube URLs are external — nothing to delete).
    const oldCardVideos = data.testimonial?.cards?.map((c) => c.cardVideo).filter(Boolean) || [];
    const newCardVideos = newCards.map((c) => c.cardVideo).filter(Boolean);

    const removedImages = oldImages.filter((url) => !newImages.includes(url));
    const removedCardImages = oldCardImages.filter((url) => !newCardImages.includes(url));
    const removedCardVideos = oldCardVideos.filter((url) => !newCardVideos.includes(url));
    for (const url of [...removedImages, ...removedCardImages]) {
      await deleteOld(url);
    }
    for (const url of removedCardVideos) {
      await deleteOld(url, "video");
    }

    data.testimonial = {
      heading: heading || "",
      subheading: subheading || "",
      cards: newCards,
    };

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
