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
    const { heading, subheading } = req.body;
    let data = await ServiceMain.findOne();
    if (!data) data = new ServiceMain();

    data.heroSection.heading = heading !== undefined ? heading : data.heroSection.heading;
    data.heroSection.subheading = subheading !== undefined ? subheading : data.heroSection.subheading;

    if (req.files && req.files.video && req.files.video[0]) {
      if (data.heroSection.video) {
        try {
          const parts = data.heroSection.video.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/services/${publicId}`, { resource_type: "video" });
        } catch (err) {
          console.error("Failed to delete old hero video:", err);
        }
      }
      data.heroSection.video = req.files.video[0].path;
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

    let parsedCards = [];
    if (cardsData) {
      try {
        parsedCards = JSON.parse(cardsData);
      } catch (err) {
        console.error("Error parsing cards data", err);
      }
    }

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

    const newCards = [];
    let fileIndex = 0;

    for (let card of parsedCards) {
      let imageUrl = card.existingImage || "";

      if (card.newImageIndex !== undefined && card.newImageIndex !== null) {
        if (req.files && req.files["cardImages"] && req.files["cardImages"][fileIndex]) {
          if (imageUrl) {
            await deleteOld(imageUrl);
          }
          imageUrl = req.files["cardImages"][fileIndex].path;
          fileIndex++;
        }
      }

      newCards.push({
        heading: card.heading || "",
        subheading: card.subheading || "",
        image: imageUrl,
      });
    }

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

    let parsedCards = [];
    if (testimonialsData) {
      try {
        parsedCards = JSON.parse(testimonialsData);
      } catch (err) {
        console.error("Error parsing testimonials data", err);
      }
    }

    // Helper: delete old Cloudinary image by URL
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
        console.error("Failed to delete testimonial image:", err);
      }
    };

    const newCards = [];
    let fileIndex = 0;
    let cardFileIndex = 0;

    for (let card of parsedCards) {
      let imageUrl = card.existingImage || "";

      if (card.newImageIndex !== undefined && card.newImageIndex !== null) {
        if (req.files && req.files["testimonialImages"] && req.files["testimonialImages"][fileIndex]) {
          if (imageUrl) {
            await deleteOld(imageUrl);
          }
          imageUrl = req.files["testimonialImages"][fileIndex].path;
          fileIndex++;
        }
      }

      let cardImageUrl = card.existingCardImage || "";

      if (card.newCardImageIndex !== undefined && card.newCardImageIndex !== null) {
        if (req.files && req.files["testimonialCardImages"] && req.files["testimonialCardImages"][cardFileIndex]) {
          if (cardImageUrl) {
            await deleteOld(cardImageUrl);
          }
          cardImageUrl = req.files["testimonialCardImages"][cardFileIndex].path;
          cardFileIndex++;
        }
      }

      newCards.push({
        quote: card.quote || "",
        name: card.name || "",
        designation: card.designation || "",
        image: imageUrl,
        cardImage: cardImageUrl,
      });
    }

    const oldImages = data.testimonial?.cards?.map((c) => c.image).filter(Boolean) || [];
    const newImages = newCards.map((c) => c.image).filter(Boolean);
    const oldCardImages = data.testimonial?.cards?.map((c) => c.cardImage).filter(Boolean) || [];
    const newCardImages = newCards.map((c) => c.cardImage).filter(Boolean);

    const removedImages = oldImages.filter((url) => !newImages.includes(url));
    const removedCardImages = oldCardImages.filter((url) => !newCardImages.includes(url));
    for (const url of [...removedImages, ...removedCardImages]) {
      await deleteOld(url);
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
