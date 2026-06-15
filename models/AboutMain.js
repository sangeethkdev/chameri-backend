const mongoose = require("mongoose");

const aboutMainSchema = new mongoose.Schema(
  {
    hero: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
    },
    story: {
      heading: { type: String, default: "" },
      description: { type: String, default: "" },
    },
    founder: {
      image: { type: String, default: "" }, // Cloudinary URL
      quote: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "" },
      architectsName: { type: String, default: "" },
    },
    workLogos: [{ type: String }], // Array of Cloudinary URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutMain", aboutMainSchema);
