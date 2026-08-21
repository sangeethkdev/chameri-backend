const KiwanoMain = require("../models/KiwanoMain");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get Kiwano main data
// @route   GET /api/kiwano/main
// @access  Public
exports.getKiwanoMain = async (req, res) => {
  try {
    let data = await KiwanoMain.findOne();
    if (!data) {
      data = await KiwanoMain.create({});
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano hero section
// @route   PUT /api/kiwano/main/hero
// @access  Private/Admin
// Media is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
exports.updateKiwanoHeroSection = async (req, res) => {
  try {
    const { heading, video } = req.body;
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    data.heroSection.heading = heading !== undefined ? heading : data.heroSection.heading;

    // Handle video URL if provided
    if (video !== undefined) {
      data.heroSection.video = video;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Luxury Villas section
// @route   PUT /api/kiwano/main/luxury-villas
// @access  Private/Admin
exports.updateKiwanoLuxuryVillasSection = async (req, res) => {
  try {
    const { heading, subheading } = req.body;
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    data.luxuryVillasSection.heading = heading !== undefined ? heading : data.luxuryVillasSection.heading;
    data.luxuryVillasSection.subheading = subheading !== undefined ? subheading : data.luxuryVillasSection.subheading;

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Features section
// @route   PUT /api/kiwano/main/feature-section
// @access  Private/Admin
// Images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the final
// resolved features array (name + image URL), never the files themselves,
// so it isn't exposed to Vercel's ~4.5MB serverless function body limit.
exports.updateKiwanoFeatureSection = async (req, res) => {
  try {
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    const { featureHeading, featureSubheading, features } = req.body;

    const newFeatures = Array.isArray(features)
      ? features.map((feature) => ({
          name: feature.name || "",
          image: feature.image || "",
        }))
      : [];

    const deleteOld = async (url) => {
      if (!url) return;
      try {
        const parts = url.split("/");
        const publicId = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`chameri/kiwano/${publicId}`);
      } catch (err) {
        console.error("Failed to delete feature image:", err);
      }
    };

    const oldImages = data.featureSection?.features?.map(c => c.image).filter(Boolean) || [];
    const newImages = newFeatures.map(c => c.image).filter(Boolean);

    const removedImages = oldImages.filter(url => !newImages.includes(url));
    for (const url of removedImages) {
      await deleteOld(url);
    }

    data.featureSection = {
      heading: featureHeading || "",
      subheading: featureSubheading || "",
      features: newFeatures,
    };

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano 360Tour section
// @route   PUT /api/kiwano/main/tour360-section
// @access  Private/Admin
// Media is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
exports.updateKiwanoTour360Section = async (req, res) => {
  try {
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    const { heading, subheading, media } = req.body;
    data.tour360Section.heading = heading !== undefined ? heading : data.tour360Section.heading;
    data.tour360Section.subheading = subheading !== undefined ? subheading : data.tour360Section.subheading;

    if (media !== undefined && media !== data.tour360Section.media) {
      // If there's an existing media, we can attempt to delete it
      if (data.tour360Section.media) {
        try {
          const parts = data.tour360Section.media.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/kiwano/${publicId}`);
        } catch (err) {
          console.error("Failed to delete old media:", err);
        }
      }
      data.tour360Section.media = media;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Gallery section
// @route   PUT /api/kiwano/main/gallery-section
// @access  Private/Admin
// Images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the final
// list of URLs per category, never the files themselves, so it isn't
// exposed to Vercel's ~4.5MB serverless function body limit.
exports.updateKiwanoGallerySection = async (req, res) => {
  try {
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    const { heading, exteriorImages, interiorImages, amenitiesImages } = req.body;
    data.gallerySection.heading = heading !== undefined ? heading : data.gallerySection.heading;

    const applyCategory = async (categoryName, newList) => {
      if (newList === undefined) return;

      const oldList = data.gallerySection[categoryName] || [];
      const removedList = oldList.filter((url) => !newList.includes(url));
      for (const url of removedList) {
        try {
          const parts = url.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/kiwano/${publicId}`);
        } catch (err) {
          console.error(`Failed to delete removed ${categoryName} image:`, err);
        }
      }

      data.gallerySection[categoryName] = newList;
    };

    await applyCategory("exteriorImages", exteriorImages);
    await applyCategory("interiorImages", interiorImages);
    await applyCategory("amenitiesImages", amenitiesImages);

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Amenities section
// @route   PUT /api/kiwano/main/amenities-section
// @access  Private/Admin
exports.updateKiwanoAmenitiesSection = async (req, res) => {
  try {
    const { heading, subheading } = req.body;
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    data.amenitiesSection.heading = heading !== undefined ? heading : data.amenitiesSection.heading;
    data.amenitiesSection.subheading = subheading !== undefined ? subheading : data.amenitiesSection.subheading;

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Highlights section
// @route   PUT /api/kiwano/main/highlights-section
// @access  Private/Admin
// Media is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting video/image URLs, never the files themselves, so it isn't
// exposed to Vercel's ~4.5MB serverless function body limit.
exports.updateKiwanoHighlightsSection = async (req, res) => {
  try {
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    const { heading, subheading, video, images, date } = req.body;

    const deleteAsset = async (url) => {
      if (!url) return;
      try {
        const parts = url.split("/");
        const publicId = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`chameri/kiwano/${publicId}`, { resource_type: "auto" });
      } catch (err) {
        console.error("Failed to delete highlights asset:", err);
      }
    };

    data.highlightsSection.heading = heading !== undefined ? heading : data.highlightsSection.heading;
    data.highlightsSection.subheading = subheading !== undefined ? subheading : data.highlightsSection.subheading;
    data.highlightsSection.date = date !== undefined ? date : data.highlightsSection.date;

    if (video !== undefined && video !== data.highlightsSection.video) {
      if (data.highlightsSection.video) await deleteAsset(data.highlightsSection.video);
      data.highlightsSection.video = video;
    }

    const updatedImages = Array.isArray(images) ? images : data.highlightsSection.images || [];

    const oldImages = data.highlightsSection.images || [];
    const removedImages = oldImages.filter((url) => !updatedImages.includes(url));
    for (const url of removedImages) {
      await deleteAsset(url);
    }

    data.highlightsSection.images = updatedImages.slice(0, 4);

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Other Project section
// @route   PUT /api/kiwano/main/other-project-section
// @access  Private/Admin
// Media is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
exports.updateKiwanoOtherProjectSection = async (req, res) => {
  try {
    let data = await KiwanoMain.findOne();
    if (!data) data = new KiwanoMain();

    const { heading, subheading, imageHeading, imageSubheading, image } = req.body;
    data.otherProjectSection.heading = heading !== undefined ? heading : data.otherProjectSection.heading;
    data.otherProjectSection.subheading = subheading !== undefined ? subheading : data.otherProjectSection.subheading;
    data.otherProjectSection.imageHeading = imageHeading !== undefined ? imageHeading : data.otherProjectSection.imageHeading;
    data.otherProjectSection.imageSubheading = imageSubheading !== undefined ? imageSubheading : data.otherProjectSection.imageSubheading;

    if (image !== undefined && image !== data.otherProjectSection.image) {
      if (data.otherProjectSection.image) {
        try {
          const parts = data.otherProjectSection.image.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/kiwano/${publicId}`);
        } catch (err) {
          console.error("Failed to delete old other project image:", err);
        }
      }
      data.otherProjectSection.image = image;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
