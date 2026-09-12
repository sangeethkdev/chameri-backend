const mongoose = require("mongoose");

// timestamps so each review card carries its own createdAt — the dashboard
// activity chart groups client reviews by the month they were added
const reviewCardSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    video: { type: String, default: "" },
    // Which media the card shows. "video" is the default because every
    // review card was a video before the other two options existed.
    mediaType: { type: String, enum: ["image", "video", "youtube"], default: "video" },
    // Card background image — used when mediaType === "image" (distinct
    // from `image` above, which is the client's own photo/avatar).
    cardImage: { type: String, default: "" },
    // Full YouTube URL as pasted by the admin — used when mediaType === "youtube"
    youtubeUrl: { type: String, default: "" },
    quote: { type: String, default: "" },
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 5 },
  },
  { timestamps: true }
);

const testimonialsMainSchema = new mongoose.Schema(
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
    reviewsSection: {
      cards: [reviewCardSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestimonialsMain", testimonialsMainSchema);
