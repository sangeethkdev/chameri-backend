const mongoose = require("mongoose");

// Subdocument shape for each hero slide
const heroSlideSchema = {
  image: { type: String, default: "" },
  text:  { type: String, default: "" },
};

// Each event groups its own images under a title/date, rather than the
// gallery being one flat, unordered pool of images.
const galleryEventSchema = {
  title:  { type: String, default: "" },
  date:   { type: String, default: "" },
  images: [{ type: String }],
};

const galleryMainSchema = new mongoose.Schema(
  {
    heroSection: {
      first:  heroSlideSchema,
      second: heroSlideSchema,
      third:  heroSlideSchema,
    },
    // Legacy flat pool — kept so existing documents/frontend fallback still
    // work, but the admin UI now writes to `galleryEvents` instead.
    galleryImages: [{ type: String }],
    galleryEvents: [galleryEventSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GalleryMain", galleryMainSchema);
