const KiwanoVillamentMain = require("../models/KiwanoVillamentMain");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get Kiwano Villament main data
// @route   GET /api/kiwano-villament/main
// @access  Public
exports.getKiwanoVillamentMain = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) {
      data = await KiwanoVillamentMain.create({});
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament hero section
// @route   PUT /api/kiwano-villament/main/hero
// @access  Private/Admin
exports.updateKiwanoVillamentHeroSection = async (req, res) => {
  try {
    const { heading } = req.body;
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    data.heroSection.heading = heading !== undefined ? heading : data.heroSection.heading;

    // Handle video upload if provided
    if (req.files && req.files.video && req.files.video[0]) {
      data.heroSection.video = req.files.video[0].path;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament Luxury Villas section
// @route   PUT /api/kiwano-villament/main/luxury-villas
// @access  Private/Admin
exports.updateKiwanoVillamentLuxuryVillasSection = async (req, res) => {
  try {
    const { heading, subheading } = req.body;
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    data.luxuryVillasSection.heading = heading !== undefined ? heading : data.luxuryVillasSection.heading;
    data.luxuryVillasSection.subheading = subheading !== undefined ? subheading : data.luxuryVillasSection.subheading;

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament Features section
// @route   PUT /api/kiwano-villament/main/feature-section
// @access  Private/Admin
exports.updateKiwanoVillamentFeatureSection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { featureHeading, featureSubheading, featuresData } = req.body;

    let parsedFeatures = [];
    if (featuresData) {
      try {
        parsedFeatures = JSON.parse(featuresData);
      } catch (err) {
        console.error("Error parsing features data", err);
      }
    }

    const deleteOld = async (url) => {
      if (!url) return;
      try {
        const parts = url.split("/");
        const publicId = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`chameri/kiwano-villament/${publicId}`);
      } catch (err) {
        console.error("Failed to delete feature image:", err);
      }
    };

    const newFeatures = [];
    let fileIndex = 0;

    for (let feature of parsedFeatures) {
      let imageUrl = feature.existingImage || "";

      if (feature.newImageIndex !== undefined && feature.newImageIndex !== null) {
        if (req.files && req.files["featureImages"] && req.files["featureImages"][fileIndex]) {
          if (imageUrl) {
            await deleteOld(imageUrl);
          }
          imageUrl = req.files["featureImages"][fileIndex].path;
          fileIndex++;
        }
      }

      newFeatures.push({
        name: feature.name || "",
        image: imageUrl
      });
    }

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

// @desc    Update Kiwano Villament 360Tour section
// @route   PUT /api/kiwano-villament/main/tour360-section
// @access  Private/Admin
exports.updateKiwanoVillamentTour360Section = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { heading, subheading } = req.body;
    data.tour360Section.heading = heading !== undefined ? heading : data.tour360Section.heading;
    data.tour360Section.subheading = subheading !== undefined ? subheading : data.tour360Section.subheading;

    if (req.files && req.files.media && req.files.media[0]) {
      // If there's an existing media, we can attempt to delete it
      if (data.tour360Section.media) {
        try {
          const parts = data.tour360Section.media.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/kiwano-villament/${publicId}`);
        } catch (err) {
          console.error("Failed to delete old media:", err);
        }
      }
      data.tour360Section.media = req.files.media[0].path;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament Gallery section
// @route   PUT /api/kiwano-villament/main/gallery-section
// @access  Private/Admin
// Images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the final
// list of URLs per category, never the files themselves, so it isn't
// exposed to Vercel's ~4.5MB serverless function body limit.
exports.updateKiwanoVillamentGallerySection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

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
          await cloudinary.uploader.destroy(`chameri/kiwano-villament/${publicId}`);
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

// @desc    Update Kiwano Villament Amenities section
// @route   PUT /api/kiwano-villament/main/amenities-section
// @access  Private/Admin
exports.updateKiwanoVillamentAmenitiesSection = async (req, res) => {
  try {
    const { heading, subheading } = req.body;
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    data.amenitiesSection.heading = heading !== undefined ? heading : data.amenitiesSection.heading;
    data.amenitiesSection.subheading = subheading !== undefined ? subheading : data.amenitiesSection.subheading;

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament Highlights section
// @route   PUT /api/kiwano-villament/main/highlights-section
// @access  Private/Admin
exports.updateKiwanoVillamentHighlightsSection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { heading, subheading, existingImages } = req.body;

    const deleteAsset = async (url) => {
      if (!url) return;
      try {
        const parts = url.split("/");
        const publicId = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`chameri/kiwano-villament/${publicId}`, { resource_type: "auto" });
      } catch (err) {
        console.error("Failed to delete highlights asset:", err);
      }
    };

    data.highlightsSection.heading = heading !== undefined ? heading : data.highlightsSection.heading;
    data.highlightsSection.subheading = subheading !== undefined ? subheading : data.highlightsSection.subheading;

    if (req.files && req.files.video && req.files.video[0]) {
      if (data.highlightsSection.video) await deleteAsset(data.highlightsSection.video);
      data.highlightsSection.video = req.files.video[0].path;
    }

    let updatedImages = [];
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
      } catch (err) {
        updatedImages = typeof existingImages === "string" ? [existingImages] : existingImages;
      }
    }

    const oldImages = data.highlightsSection.images || [];
    const removedImages = oldImages.filter((url) => !updatedImages.includes(url));
    for (const url of removedImages) {
      await deleteAsset(url);
    }

    if (req.files && req.files.images) {
      const newUrls = req.files.images.map((file) => file.path);
      updatedImages = [...updatedImages, ...newUrls];
    }

    data.highlightsSection.images = updatedImages.slice(0, 4);

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament Other Project section
// @route   PUT /api/kiwano-villament/main/other-project-section
// @access  Private/Admin
exports.updateKiwanoVillamentOtherProjectSection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { heading, subheading, imageHeading, imageSubheading } = req.body;
    data.otherProjectSection.heading = heading !== undefined ? heading : data.otherProjectSection.heading;
    data.otherProjectSection.subheading = subheading !== undefined ? subheading : data.otherProjectSection.subheading;
    data.otherProjectSection.imageHeading = imageHeading !== undefined ? imageHeading : data.otherProjectSection.imageHeading;
    data.otherProjectSection.imageSubheading = imageSubheading !== undefined ? imageSubheading : data.otherProjectSection.imageSubheading;

    if (req.files && req.files.image && req.files.image[0]) {
      if (data.otherProjectSection.image) {
        try {
          const parts = data.otherProjectSection.image.split("/");
          const publicId = parts[parts.length - 1].split(".")[0];
          await cloudinary.uploader.destroy(`chameri/kiwano-villament/${publicId}`);
        } catch (err) {
          console.error("Failed to delete old other project image:", err);
        }
      }
      data.otherProjectSection.image = req.files.image[0].path;
    }

    await data.save();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
