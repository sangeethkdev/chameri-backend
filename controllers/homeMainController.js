const asyncHandler = require("express-async-handler");
const HomeMain = require("../models/HomeMain");
const { cloudinary } = require("../config/cloudinary");

// @desc   Get the Home Main section data
// @route  GET /api/home/main
// @access Public
const getHomeMain = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) {
    homeMain = await HomeMain.create({});
  }
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home Hero Section
// @route  PUT /api/home/main/hero
// @access Private (Admin only)
const updateHomeHeroSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { heading, subheading1, subheading2, tagline } = req.body;

  homeMain.hero = {
    heading: heading || "",
    subheading1: subheading1 || "",
    subheading2: subheading2 || "",
    tagline: tagline || "",
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home About Us Section
// @route  PUT /api/home/main/about-us
// @access Private (Admin only)
const updateHomeAboutUsSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { heading, count1, count1Text, count2, count2Text, count3, count3Text, count4, count4Text } = req.body;

  homeMain.aboutUs = {
    heading: heading || "",
    count1: count1 || "",
    count1Text: count1Text || "",
    count2: count2 || "",
    count2Text: count2Text || "",
    count3: count3 || "",
    count3Text: count3Text || "",
    count4: count4 || "",
    count4Text: count4Text || "",
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});


// @desc   Update Home Logos Section
// @route  PUT /api/home/main/logos
// @access Private (Admin only)
const updateHomeLogosSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { existingLogos } = req.body;

  let updatedLogos = [];
  if (existingLogos) {
    try {
      updatedLogos = JSON.parse(existingLogos);
    } catch (err) {
      updatedLogos = typeof existingLogos === "string" ? [existingLogos] : existingLogos;
    }
  }

  // Delete removed logos from Cloudinary
  const removedLogos = homeMain.logos.filter((url) => !updatedLogos.includes(url));
  for (const url of removedLogos) {
    try {
      const urlParts = url.split("/upload/");
      if (urlParts.length > 1) {
        const publicIdWithExt = urlParts[1].replace(/^v\d+\//, "");
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (err) {
      console.error("Failed to delete removed home logo:", err);
    }
  }

  // Add newly uploaded logos
  if (req.files && req.files["homeLogos"]) {
    const newLogoUrls = req.files["homeLogos"].map((file) => file.path);
    updatedLogos = [...updatedLogos, ...newLogoUrls];
  }

  homeMain.logos = updatedLogos;
  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home Villa Plan Section
// @route  PUT /api/home/main/villaplan
// @access Private (Admin only)
const updateHomeVillaPlanSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const {
    heading, subheading,
    card1Heading, card1Description, card1Image,
    card2Heading, card2Description, card2Image,
  } = req.body;

  // Images are uploaded directly to Cloudinary from the browser (see
  // /api/uploads/signature) — this endpoint only ever receives the
  // resulting URL, never the file itself, so it isn't exposed to Vercel's
  // ~4.5MB serverless function body limit.
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
      console.error("Failed to delete home villaplan image:", err);
    }
  };

  const buildCard = async (key, cardHeading, cardDescription, newImageUrl) => {
    const existing = homeMain.villaPlan?.[key]?.image || "";
    let imageUrl = existing;
    if (newImageUrl && newImageUrl !== existing) {
      await deleteOld(existing);
      imageUrl = newImageUrl;
    }
    return { heading: cardHeading || "", description: cardDescription || "", image: imageUrl };
  };

  homeMain.villaPlan = {
    heading: heading || "",
    subheading: subheading || "",
    card1: await buildCard("card1", card1Heading, card1Description, card1Image),
    card2: await buildCard("card2", card2Heading, card2Description, card2Image),
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home Choose Us Section
// @route  PUT /api/home/main/chooseus
// @access Private (Admin only)
const updateHomeChooseUsSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { heading, subheading, card1Heading, card1Subheading, card2Heading, card2Subheading, card3Heading, card3Subheading } = req.body;

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
      console.error("Failed to delete home chooseus image:", err);
    }
  };

  const buildCard = async (key, cardHeading, cardSubheading) => {
    const existing = homeMain.chooseUs?.[key]?.image || "";
    let imageUrl = existing;
    if (req.files && req.files[`${key}Image`]) {
      await deleteOld(existing);
      imageUrl = req.files[`${key}Image`][0].path;
    }
    return { heading: cardHeading || "", subheading: cardSubheading || "", image: imageUrl };
  };

  homeMain.chooseUs = {
    heading: heading || "",
    subheading: subheading || "",
    card1: await buildCard("card1", card1Heading, card1Subheading),
    card2: await buildCard("card2", card2Heading, card2Subheading),
    card3: await buildCard("card3", card3Heading, card3Subheading),
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home Gallery Section
// @route  PUT /api/home/main/gallery
// @access Private (Admin only)
const updateHomeGallerySection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { heading, subheading } = req.body;

  const buildCard = async (key) => {
    const cardName = req.body[`${key}Name`] || "";
    const cardPlace = req.body[`${key}Place`] || "";
    const cardDate = req.body[`${key}Date`] || "";
    
    // Parse existing images passed from frontend
    let existingImages = [];
    if (req.body[`${key}ExistingImages`]) {
      try {
        existingImages = JSON.parse(req.body[`${key}ExistingImages`]);
      } catch (err) {
        existingImages = typeof req.body[`${key}ExistingImages`] === "string" 
          ? [req.body[`${key}ExistingImages`]] 
          : req.body[`${key}ExistingImages`];
      }
    }

    const previousImages = homeMain.gallery?.[key]?.images || [];
    
    // Delete removed images from Cloudinary
    const removedImages = previousImages.filter((url) => !existingImages.includes(url));
    for (const url of removedImages) {
      try {
        const urlParts = url.split("/upload/");
        if (urlParts.length > 1) {
          const publicIdWithExt = urlParts[1].replace(/^v\d+\//, "");
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (err) {
        console.error(`Failed to delete gallery ${key} image:`, err);
      }
    }

    // Add newly uploaded images
    let updatedImages = [...existingImages];
    if (req.files && req.files[`${key}Images`]) {
      const newImageUrls = req.files[`${key}Images`].map((file) => file.path);
      updatedImages = [...updatedImages, ...newImageUrls];
    }

    return { name: cardName, place: cardPlace, date: cardDate, images: updatedImages };
  };

  homeMain.gallery = {
    heading: heading || "",
    subheading: subheading || "",
    card1: await buildCard("card1"),
    card2: await buildCard("card2"),
    card3: await buildCard("card3"),
    card4: await buildCard("card4"),
    card5: await buildCard("card5"),
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home Our Team Section
// @route  PUT /api/home/main/ourteam
// @access Private (Admin only)
const updateHomeOurTeamSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { heading, subheading, separateCardHeading } = req.body;

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
      console.error("Failed to delete home ourteam image:", err);
    }
  };

  const buildCard = async (key) => {
    const cardName = req.body[`${key}Name`] || "";
    const cardDesignation = req.body[`${key}Designation`] || "";
    
    const existing = homeMain.ourTeam?.[key]?.image || "";
    let imageUrl = existing;
    if (req.files && req.files[`${key}Image`]) {
      await deleteOld(existing);
      imageUrl = req.files[`${key}Image`][0].path;
    }
    return { name: cardName, designation: cardDesignation, image: imageUrl };
  };

  homeMain.ourTeam = {
    heading: heading || "",
    subheading: subheading || "",
    card1: await buildCard("card1"),
    card2: await buildCard("card2"),
    card3: await buildCard("card3"),
    card4: await buildCard("card4"),
    card5: await buildCard("card5"),
    separateCard: {
      heading: separateCardHeading || ""
    }
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home Testimonial Section
// @route  PUT /api/home/main/testimonial
// @access Private (Admin only)
const updateHomeTestimonialSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

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
    let cardImageUrl = card.existingCardImage || "";
    
    // If this card has a new card background image file attached, get its path
    if (card.newCardImageIndex !== undefined && card.newCardImageIndex !== null) {
       if (req.files && req.files["testimonialCardImages"] && req.files["testimonialCardImages"][cardFileIndex]) {
          // Delete old image if we are replacing it
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
       cardImage: cardImageUrl
    });
  }

  // Find images that were in the DB but are not in the newCards array, and delete them
  const oldImages = homeMain.testimonial?.cards?.map(c => c.image).filter(Boolean) || [];
  const newImages = newCards.map(c => c.image).filter(Boolean);
  const oldCardImages = homeMain.testimonial?.cards?.map(c => c.cardImage).filter(Boolean) || [];
  const newCardImages = newCards.map(c => c.cardImage).filter(Boolean);
  
  const removedImages = oldImages.filter(url => !newImages.includes(url));
  const removedCardImages = oldCardImages.filter(url => !newCardImages.includes(url));
  for (const url of [...removedImages, ...removedCardImages]) {
      await deleteOld(url);
  }

  homeMain.testimonial = {
    heading: heading || "",
    subheading: subheading || "",
    cards: newCards,
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

// @desc   Update Home FAQ Section
// @route  PUT /api/home/main/faq
// @access Private (Admin only)
const updateHomeFaqSection = asyncHandler(async (req, res) => {
  let homeMain = await HomeMain.findOne();
  if (!homeMain) homeMain = new HomeMain();

  const { heading, subheading, faqsData } = req.body;

  let parsedFaqs = [];
  if (faqsData) {
    try {
      parsedFaqs = JSON.parse(faqsData);
    } catch (err) {
      console.error("Error parsing faqs data", err);
    }
  }

  homeMain.faqSection = {
    heading: heading || "",
    subheading: subheading || "",
    faqs: parsedFaqs.map(f => ({ question: f.question || "", answer: f.answer || "" })),
  };

  await homeMain.save();
  res.json({ success: true, data: homeMain });
});

module.exports = {
  getHomeMain,
  updateHomeHeroSection,
  updateHomeAboutUsSection,
  updateHomeLogosSection,
  updateHomeVillaPlanSection,
  updateHomeChooseUsSection,
  updateHomeGallerySection,
  updateHomeOurTeamSection,
  updateHomeTestimonialSection,
  updateHomeFaqSection,
};
