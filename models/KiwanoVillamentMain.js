const mongoose = require("mongoose");

const kiwanoVillamentMainSchema = new mongoose.Schema(
  {
    heroSection: {
      video: { type: String, default: "" },
      heading: { type: String, default: "" },
    },
    luxuryVillasSection: {
      subheading: { type: String, default: "" },
    },
    featureSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      features: [
        {
          image: { type: String, default: "" },
          name: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
    },
    tour360Section: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      media: { type: String, default: "" }, // Can be video or image URL
    },
    gallerySection: {
      heading: { type: String, default: "" },
      exteriorImages: [{ type: String }],
      interiorImages: [{ type: String }],
      amenitiesImages: [{ type: String }],
    },
    amenitiesSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
    },
    otherProjectSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    highlightsSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      video: { type: String, default: "" },
      images: [{ type: String }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KiwanoVillamentMain", kiwanoVillamentMainSchema);
