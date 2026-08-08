const mongoose = require("mongoose");

const contactMainSchema = new mongoose.Schema(
  {
    heroSection: {
      heading: { type: String, default: "" },
      image: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMain", contactMainSchema);
