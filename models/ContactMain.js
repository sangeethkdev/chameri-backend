const mongoose = require("mongoose");

const contactMainSchema = new mongoose.Schema(
  {
    heroSection: {
      heading: { type: String, default: "" },
      image: { type: String, default: "" },
      // Optional portrait crop shown on phones. A phone only displays a narrow
      // vertical slice of the landscape "image", so a dedicated crop keeps the
      // subject in frame. Empty means "fall back to image", which is what
      // every document saved before this field existed does.
      mobileImage: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMain", contactMainSchema);
