const asyncHandler = require("express-async-handler");
const AboutMain = require("../models/AboutMain");
const { cloudinary } = require("../config/cloudinary");

// @desc   Get About Main section content
// @route  GET /api/about/main
// @access Public (or Admin, depending on usage. Usually public for frontend, but here we can make it public so the main site can read it)
const getAboutMain = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) {
    // Return empty template if nothing exists yet
    aboutMain = {
      hero: { heading: "", subheading: "" },
      story: { heading: "", description: "" },
      founder: { image: "", quote: "", name: "", role: "", architectsName: "" },
      workLogos: [],
    };
  }
  res.json({ success: true, data: aboutMain });
});

// @desc   Update About Main section content
// @route  PUT /api/about/main
// @access Private (Admin only)
const updateAboutMain = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) {
    aboutMain = new AboutMain();
  }

  // Files will be in req.files
  // Text fields in req.body
  const {
    heroHeading,
    heroSubheading,
    storyHeading,
    storyDescription,
    founderQuote,
    founderName,
    founderRole,
    founderArchitectsName,
    existingWorkLogos, // JSON string of URLs that we want to KEEP
  } = req.body;

  // Update text fields
  aboutMain.hero.heading = heroHeading || "";
  aboutMain.hero.subheading = heroSubheading || "";

  aboutMain.story.heading = storyHeading || "";
  aboutMain.story.description = storyDescription || "";

  aboutMain.founder.quote = founderQuote || "";
  aboutMain.founder.name = founderName || "";
  aboutMain.founder.role = founderRole || "";
  aboutMain.founder.architectsName = founderArchitectsName || "";

  // Handle Founder Image
  if (req.files && req.files["founderImage"]) {
    // If there's an existing image, delete it from Cloudinary
    if (aboutMain.founder.image) {
      try {
        const urlParts = aboutMain.founder.image.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split(".")[0];
        await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
      } catch (err) {
        console.error("Failed to delete old founder image:", err);
      }
    }
    aboutMain.founder.image = req.files["founderImage"][0].path;
  }

  // Handle Work Logos
  // 1. Keep existing logos passed back from frontend
  let updatedLogos = [];
  if (existingWorkLogos) {
    try {
      updatedLogos = JSON.parse(existingWorkLogos);
    } catch (err) {
      updatedLogos = typeof existingWorkLogos === "string" ? [existingWorkLogos] : existingWorkLogos;
    }
  }

  // Find logos that were removed and delete them from Cloudinary
  const removedLogos = aboutMain.workLogos.filter((url) => !updatedLogos.includes(url));
  for (const url of removedLogos) {
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split(".")[0];
      await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
    } catch (err) {
      console.error("Failed to delete removed work logo:", err);
    }
  }

  // 2. Add newly uploaded logos
  if (req.files && req.files["workLogos"]) {
    const newLogoUrls = req.files["workLogos"].map((file) => file.path);
    updatedLogos = [...updatedLogos, ...newLogoUrls];
  }

  aboutMain.workLogos = updatedLogos;

  await aboutMain.save();

  res.json({ success: true, data: aboutMain });
});

module.exports = {
  getAboutMain,
  updateAboutMain,
};
