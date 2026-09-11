const mongoose = require("mongoose");

const projectsMainSchema = new mongoose.Schema(
  {
    heroSection: {
      heading: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    cardsSection: {
      cards: [
        {
          title: { type: String, default: "" },
          heading: { type: String, default: "" },
          subheading: { type: String, default: "" },
          image: { type: String, default: "" },
          // Portrait crop for the stacked mobile cards. The desktop image is
          // a wide landscape frame; reused as-is in the tall mobile card it
          // crops to an unusable slice. Falls back to `image` when unset, so
          // cards saved before this field existed keep rendering.
          mobileImage: { type: String, default: "" },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectsMain", projectsMainSchema);
