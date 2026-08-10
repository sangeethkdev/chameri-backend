const asyncHandler = require("express-async-handler");
const AboutMain = require("../models/AboutMain");
const { cloudinary } = require("../config/cloudinary");
const { sanitizeHtml } = require("../utils/sanitizeHtml");

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
  aboutMain.story.description = sanitizeHtml(storyDescription);

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

// @desc   Update Hero section only
// @route  PUT /api/about/main/hero
// @access Private (Admin only)
const updateHeroSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { heroHeading, heroSubheading } = req.body;
  aboutMain.hero.heading = heroHeading || "";
  aboutMain.hero.subheading = heroSubheading || "";

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Story section only
// @route  PUT /api/about/main/story
// @access Private (Admin only)
const updateStorySection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { storyHeading, storyDescription } = req.body;
  aboutMain.story.heading = storyHeading || "";
  // Description is rich text (HTML) authored in the admin editor.
  aboutMain.story.description = sanitizeHtml(storyDescription);

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Founder section only
// @route  PUT /api/about/main/founder
// @access Private (Admin only)
// The founder image is uploaded directly to Cloudinary from the browser
// (see POST /api/uploads/signature) — this endpoint only ever receives the
// resulting URL, never the file itself.
const updateFounderSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { founderQuote, founderName, founderRole, founderArchitectsName, founderImage } = req.body;
  aboutMain.founder.quote = founderQuote || "";
  aboutMain.founder.name = founderName || "";
  aboutMain.founder.role = founderRole || "";
  aboutMain.founder.architectsName = founderArchitectsName || "";

  // Handle Founder Image (URL already resolved client-side)
  if (founderImage !== undefined && founderImage !== aboutMain.founder.image) {
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
    aboutMain.founder.image = founderImage;
  }

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Work Logos section only
// @route  PUT /api/about/main/logos
// @access Private (Admin only)
// Logos are uploaded directly to Cloudinary from the browser — this endpoint
// only ever receives the final list of URLs, never the files themselves.
const updateLogosSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { workLogos } = req.body;
  const updatedLogos = Array.isArray(workLogos) ? workLogos : (workLogos ? [workLogos] : []);

  // Delete removed logos from Cloudinary (diff old stored list vs final list)
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

  aboutMain.workLogos = updatedLogos;
  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Vision & Mission section only
// @route  PUT /api/about/main/vision-mission
// @access Private (Admin only)
// Images are uploaded directly to Cloudinary from the browser — this
// endpoint only ever receives the resulting URLs.
const updateVisionMissionSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const {
    visionTitle, visionHeading, visionSubheading, visionImage,
    missionTitle, missionHeading, missionSubheading, missionImage,
  } = req.body;

  // Helper to delete old Cloudinary image
  const deleteOldImage = async (url) => {
    if (!url) return;
    try {
      const urlParts = url.split("/");
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split(".")[0];
      await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
    } catch (err) {
      console.error("Failed to delete old image:", err);
    }
  };

  // Preserve existing images unless replaced
  let visionImageUrl = aboutMain.vision?.image || "";
  let missionImageUrl = aboutMain.mission?.image || "";

  if (visionImage !== undefined && visionImage !== visionImageUrl) {
    await deleteOldImage(visionImageUrl);
    visionImageUrl = visionImage;
  }

  if (missionImage !== undefined && missionImage !== missionImageUrl) {
    await deleteOldImage(missionImageUrl);
    missionImageUrl = missionImage;
  }

  aboutMain.vision = {
    title: visionTitle || "",
    heading: visionHeading || "",
    subheading: visionSubheading || "",
    image: visionImageUrl,
  };

  aboutMain.mission = {
    title: missionTitle || "",
    heading: missionHeading || "",
    subheading: missionSubheading || "",
    image: missionImageUrl,
  };

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Special Section only
// @route  PUT /api/about/main/special-section
// @access Private (Admin only)
// Images are uploaded directly to Cloudinary from the browser — this
// endpoint only ever receives the resolved URL per item.
const updateSpecialSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const {
    specialTitle,
    firstHeading,    firstSubheading,    firstImage,
    secondHeading,   secondSubheading,   secondImage,
    thirdHeading,    thirdSubheading,    thirdImage,
    fourthHeading,   fourthSubheading,   fourthImage,
    fifthHeading,    fifthSubheading,    fifthImage,
  } = req.body;

  // Helper: delete old Cloudinary image by URL
  const deleteOld = async (url) => {
    if (!url) return;
    try {
      const parts = url.split("/");
      const publicId = parts[parts.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
    } catch (err) {
      console.error("Failed to delete special section image:", err);
    }
  };

  // Build each item — preserve existing image unless a new URL was sent
  const buildItem = async (key, heading, subheading, image) => {
    const existing = aboutMain.specialSection?.[key]?.image || "";
    let imageUrl = existing;
    if (image !== undefined && image !== existing) {
      await deleteOld(existing);
      imageUrl = image;
    }
    return { heading: heading || "", subheading: subheading || "", image: imageUrl };
  };

  aboutMain.specialSection = {
    title:  specialTitle || "",
    first:  await buildItem("first",  firstHeading,  firstSubheading,  firstImage),
    second: await buildItem("second", secondHeading, secondSubheading, secondImage),
    third:  await buildItem("third",  thirdHeading,  thirdSubheading,  thirdImage),
    fourth: await buildItem("fourth", fourthHeading, fourthSubheading, fourthImage),
    fifth:  await buildItem("fifth",  fifthHeading,  fifthSubheading,  fifthImage),
  };

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Board Section only
// @route  PUT /api/about/main/board-section
// @access Private (Admin only)
// Images are uploaded directly to Cloudinary from the browser — this
// endpoint only ever receives the resolved URL per member.
const updateBoardSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const {
    boardTitle,
    firstName,    firstDesignation,    firstImage,
    secondName,   secondDesignation,   secondImage,
    thirdName,    thirdDesignation,    thirdImage,
    fourthName,   fourthDesignation,   fourthImage,
  } = req.body;

  // Helper: delete old Cloudinary image by URL
  const deleteOld = async (url) => {
    if (!url) return;
    try {
      const parts = url.split("/");
      const publicId = parts[parts.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
    } catch (err) {
      console.error("Failed to delete board section image:", err);
    }
  };

  // Build each member — preserve existing image unless a new URL was sent
  const buildMember = async (key, name, designation, image) => {
    const existing = aboutMain.boardSection?.[key]?.image || "";
    let imageUrl = existing;
    if (image !== undefined && image !== existing) {
      await deleteOld(existing);
      imageUrl = image;
    }
    return { name: name || "", designation: designation || "", image: imageUrl };
  };

  aboutMain.boardSection = {
    title:  boardTitle || "",
    first:  await buildMember("first",  firstName,  firstDesignation,  firstImage),
    second: await buildMember("second", secondName, secondDesignation, secondImage),
    third:  await buildMember("third",  thirdName,  thirdDesignation,  thirdImage),
    fourth: await buildMember("fourth", fourthName, fourthDesignation, fourthImage),
  };

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Testimonial Section only
// @route  PUT /api/about/main/testimonial-section
// @access Private (Admin only)
// Each card's image/cardImage is already a Cloudinary URL by the time this
// runs — the frontend uploads any new photos directly to Cloudinary and
// resolves each card's final URL before sending this request, so no
// index-matching against uploaded files is needed here.
const updateTestimonialSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { testimonialHeading, testimonialSubheading, testimonials } = req.body;

  let parsedCards = [];
  if (testimonials) {
    try {
      parsedCards = typeof testimonials === "string" ? JSON.parse(testimonials) : testimonials;
    } catch (err) {
      console.error("Error parsing testimonials data", err);
    }
  }

  // Helper: delete old Cloudinary image by URL
  const deleteOld = async (url) => {
    if (!url) return;
    try {
      const parts = url.split("/");
      const publicId = parts[parts.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
    } catch (err) {
      console.error("Failed to delete testimonial image:", err);
    }
  };

  const newCards = parsedCards.map((card) => ({
    quote: card.quote || "",
    name: card.name || "",
    designation: card.designation || "",
    image: card.image || "",
    cardImage: card.cardImage || "",
  }));

  const oldImages = aboutMain.testimonialSection?.cards?.map(c => c.image).filter(Boolean) || [];
  const oldCardImages = aboutMain.testimonialSection?.cards?.map(c => c.cardImage).filter(Boolean) || [];
  const newImages = newCards.map(c => c.image).filter(Boolean);
  const newCardImages = newCards.map(c => c.cardImage).filter(Boolean);

  const removedImages = [
    ...oldImages.filter(url => !newImages.includes(url)),
    ...oldCardImages.filter(url => !newCardImages.includes(url)),
  ];
  for (const url of removedImages) {
    await deleteOld(url);
  }

  aboutMain.testimonialSection = {
    heading: testimonialHeading || "",
    subheading: testimonialSubheading || "",
    cards: newCards,
  };

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

module.exports = {
  getAboutMain,
  updateAboutMain,
  updateHeroSection,
  updateStorySection,
  updateFounderSection,
  updateLogosSection,
  updateVisionMissionSection,
  updateSpecialSection,
  updateBoardSection,
  updateTestimonialSection,
};



