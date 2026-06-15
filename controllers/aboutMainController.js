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
  aboutMain.story.description = storyDescription || "";

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Founder section only
// @route  PUT /api/about/main/founder
// @access Private (Admin only)
const updateFounderSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { founderQuote, founderName, founderRole, founderArchitectsName } = req.body;
  aboutMain.founder.quote = founderQuote || "";
  aboutMain.founder.name = founderName || "";
  aboutMain.founder.role = founderRole || "";
  aboutMain.founder.architectsName = founderArchitectsName || "";

  // Handle Founder Image upload
  if (req.files && req.files["founderImage"]) {
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

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Work Logos section only
// @route  PUT /api/about/main/logos
// @access Private (Admin only)
const updateLogosSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { existingWorkLogos } = req.body;

  let updatedLogos = [];
  if (existingWorkLogos) {
    try {
      updatedLogos = JSON.parse(existingWorkLogos);
    } catch (err) {
      updatedLogos = typeof existingWorkLogos === "string" ? [existingWorkLogos] : existingWorkLogos;
    }
  }

  // Delete removed logos from Cloudinary
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

  // Add newly uploaded logos
  if (req.files && req.files["workLogos"]) {
    const newLogoUrls = req.files["workLogos"].map((file) => file.path);
    updatedLogos = [...updatedLogos, ...newLogoUrls];
  }

  aboutMain.workLogos = updatedLogos;
  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Vision & Mission section only
// @route  PUT /api/about/main/vision-mission
// @access Private (Admin only)
const updateVisionMissionSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const {
    visionTitle, visionHeading, visionSubheading,
    missionTitle, missionHeading, missionSubheading,
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

  if (req.files && req.files["visionImage"]) {
    await deleteOldImage(visionImageUrl);
    visionImageUrl = req.files["visionImage"][0].path;
  }

  if (req.files && req.files["missionImage"]) {
    await deleteOldImage(missionImageUrl);
    missionImageUrl = req.files["missionImage"][0].path;
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
const updateSpecialSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const {
    specialTitle,
    firstHeading,    firstSubheading,
    secondHeading,   secondSubheading,
    thirdHeading,    thirdSubheading,
    fourthHeading,   fourthSubheading,
    fifthHeading,    fifthSubheading,
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

  // Build each item — preserve existing image unless a new one is uploaded
  const buildItem = async (key, heading, subheading) => {
    const existing = aboutMain.specialSection?.[key]?.image || "";
    let imageUrl = existing;
    if (req.files && req.files[`${key}Image`]) {
      await deleteOld(existing);
      imageUrl = req.files[`${key}Image`][0].path;
    }
    return { heading: heading || "", subheading: subheading || "", image: imageUrl };
  };

  aboutMain.specialSection = {
    title:  specialTitle || "",
    first:  await buildItem("first",  firstHeading,  firstSubheading),
    second: await buildItem("second", secondHeading, secondSubheading),
    third:  await buildItem("third",  thirdHeading,  thirdSubheading),
    fourth: await buildItem("fourth", fourthHeading, fourthSubheading),
    fifth:  await buildItem("fifth",  fifthHeading,  fifthSubheading),
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
};

// @desc   Update Board Section only
// @route  PUT /api/about/main/board-section
// @access Private (Admin only)
const updateBoardSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const {
    boardTitle,
    firstName,    firstDesignation,
    secondName,   secondDesignation,
    thirdName,    thirdDesignation,
    fourthName,   fourthDesignation,
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

  // Build each member — preserve existing image unless a new one is uploaded
  const buildMember = async (key, name, designation) => {
    const existing = aboutMain.boardSection?.[key]?.image || "";
    let imageUrl = existing;
    if (req.files && req.files[`${key}Image`]) {
      await deleteOld(existing);
      imageUrl = req.files[`${key}Image`][0].path;
    }
    return { name: name || "", designation: designation || "", image: imageUrl };
  };

  aboutMain.boardSection = {
    title:  boardTitle || "",
    first:  await buildMember("first",  firstName,  firstDesignation),
    second: await buildMember("second", secondName, secondDesignation),
    third:  await buildMember("third",  thirdName,  thirdDesignation),
    fourth: await buildMember("fourth", fourthName, fourthDesignation),
  };

  await aboutMain.save();
  res.json({ success: true, data: aboutMain });
});

// @desc   Update Testimonial Section only
// @route  PUT /api/about/main/testimonial-section
// @access Private (Admin only)
const updateTestimonialSection = asyncHandler(async (req, res) => {
  let aboutMain = await AboutMain.findOne();
  if (!aboutMain) aboutMain = new AboutMain();

  const { testimonialHeading, testimonialSubheading, testimonialsData } = req.body;

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
      const parts = url.split("/");
      const publicId = parts[parts.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(`chameri/about/${publicId}`);
    } catch (err) {
      console.error("Failed to delete testimonial image:", err);
    }
  };

  const newCards = [];
  let fileIndex = 0;
  
  for (let card of parsedCards) {
    let imageUrl = card.existingImage || "";
    
    // If this card has a new file attached, get its path
    if (card.newImageIndex !== undefined && card.newImageIndex !== null) {
       if (req.files && req.files["testimonialImages"] && req.files["testimonialImages"][fileIndex]) {
          // Delete old image if we are replacing it
          if (imageUrl) {
             await deleteOld(imageUrl);
          }
          imageUrl = req.files["testimonialImages"][fileIndex].path;
          fileIndex++;
       }
    }
    
    newCards.push({
       quote: card.quote || "",
       name: card.name || "",
       designation: card.designation || "",
       image: imageUrl
    });
  }

  // Find images that were in the DB but are not in the newCards array, and delete them
  const oldImages = aboutMain.testimonialSection?.cards?.map(c => c.image).filter(Boolean) || [];
  const newImages = newCards.map(c => c.image).filter(Boolean);
  
  const removedImages = oldImages.filter(url => !newImages.includes(url));
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



