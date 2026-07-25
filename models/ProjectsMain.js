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
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectsMain", projectsMainSchema);
