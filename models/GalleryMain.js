const mongoose = require("mongoose");

// Subdocument shape for each hero slide
const heroSlideSchema = {
  image: { type: String, default: "" },
  text:  { type: String, default: "" },
};

const galleryMainSchema = new mongoose.Schema(
  {
    heroSection: {
      first:  heroSlideSchema,
      second: heroSlideSchema,
      third:  heroSlideSchema,
    },
    galleryImages: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryMain", galleryMainSchema);
