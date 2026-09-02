const KiwanoVillamentMain = require("../models/KiwanoVillamentMain");
const { cloudinary } = require("../config/cloudinary");

/* Highlights timeline limits. The thumb strip on the site lays out exactly
   four images per stage, so anything beyond that would never be rendered. */
const MAX_HIGHLIGHT_IMAGES = 4;
const MAX_HIGHLIGHT_MONTHS = 12;

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
// The video is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
exports.updateKiwanoVillamentHeroSection = async (req, res) => {
  try {
    const { heading, video } = req.body;
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    data.heroSection.heading = heading !== undefined ? heading : data.heroSection.heading;

    // Handle video update if provided
    if (video !== undefined) {
      data.heroSection.video = video;
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
// Images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the final
// resolved { name, image } list, never the files themselves, so it isn't
// exposed to Vercel's ~4.5MB serverless function body limit.
exports.updateKiwanoVillamentFeatureSection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { featureHeading, featureSubheading, features } = req.body;

    const parsedFeatures = Array.isArray(features) ? features : [];

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

    const newFeatures = parsedFeatures.map((feature) => ({
      name: feature.name || "",
      image: feature.image || "",
    }));

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
// Media is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
exports.updateKiwanoVillamentTour360Section = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { heading, subheading, media } = req.body;
    data.tour360Section.heading = heading !== undefined ? heading : data.tour360Section.heading;
    data.tour360Section.subheading = subheading !== undefined ? subheading : data.tour360Section.subheading;

    if (media !== undefined && media !== data.tour360Section.media) {
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
      data.tour360Section.media = media;
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
// Video and images are uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URLs, never the files themselves, so it isn't exposed to
// Vercel's ~4.5MB serverless function body limit.
exports.updateKiwanoVillamentHighlightsSection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

    const { heading, subheading, months, video, images, date } = req.body;

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

    /** Every media URL a highlights payload references, months included. */
    const collectAssets = (section) => {
      const urls = [];
      if (section?.video) urls.push(section.video);
      if (Array.isArray(section?.images)) urls.push(...section.images.filter(Boolean));
      for (const month of section?.months || []) {
        if (month?.video) urls.push(month.video);
        if (Array.isArray(month?.images)) urls.push(...month.images.filter(Boolean));
      }
      return urls;
    };

    data.highlightsSection.heading = heading !== undefined ? heading : data.highlightsSection.heading;
    data.highlightsSection.subheading = subheading !== undefined ? subheading : data.highlightsSection.subheading;

    /* Snapshot what the section referenced before this save, so anything the
       new payload drops can be cleaned off Cloudinary afterwards. Taken from
       a plain object because the sub-document array is about to be replaced. */
    const previousAssets = collectAssets(data.highlightsSection.toObject
      ? data.highlightsSection.toObject()
      : data.highlightsSection);

    if (Array.isArray(months)) {
      data.highlightsSection.months = months.slice(0, MAX_HIGHLIGHT_MONTHS).map((month) => ({
        label: typeof month?.label === "string" ? month.label : "",
        date: typeof month?.date === "string" ? month.date : "",
        video: typeof month?.video === "string" ? month.video : "",
        images: Array.isArray(month?.images)
          ? month.images.filter((url) => typeof url === "string" && url).slice(0, MAX_HIGHLIGHT_IMAGES)
          : [],
      }));

      /* The timeline now owns the section's media. The admin panel seeds the
         first month from these legacy fields, so leaving them populated would
         keep a second copy of the same URLs around and let the site's legacy
         fallback disagree with the timeline. Cleared only when the caller
         didn't explicitly set them in this same request. */
      if (video === undefined) data.highlightsSection.video = "";
      if (images === undefined) data.highlightsSection.images = [];
      if (date === undefined) data.highlightsSection.date = "";
    }

    /* Legacy single-stage fields stay writable so an older client (or a
       payload that only touches the text) keeps working unchanged. */
    if (date !== undefined) data.highlightsSection.date = date;
    if (video !== undefined) data.highlightsSection.video = video;
    if (Array.isArray(images)) {
      data.highlightsSection.images = images.slice(0, MAX_HIGHLIGHT_IMAGES);
    }

    await data.save();

    /* Delete only assets no longer referenced anywhere in the section — an
       image moved between months keeps its URL and must survive. Runs after
       the save so a Cloudinary failure can't lose the content edit. */
    const remainingAssets = new Set(collectAssets(data.highlightsSection.toObject()));
    for (const url of previousAssets) {
      if (!remainingAssets.has(url)) await deleteAsset(url);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Kiwano Villament Other Project section
// @route   PUT /api/kiwano-villament/main/other-project-section
// @access  Private/Admin
// The image is uploaded directly to Cloudinary from the browser (see
// POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself, so it isn't exposed to Vercel's
// ~4.5MB serverless function body limit.
exports.updateKiwanoVillamentOtherProjectSection = async (req, res) => {
  try {
    let data = await KiwanoVillamentMain.findOne();
    if (!data) data = new KiwanoVillamentMain();

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
          await cloudinary.uploader.destroy(`chameri/kiwano-villament/${publicId}`);
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
