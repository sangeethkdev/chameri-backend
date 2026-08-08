const mongoose = require("mongoose");

// timestamps so each review card carries its own createdAt — the dashboard
// activity chart groups client reviews by the month they were added
const reviewCardSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    video: { type: String, default: "" },
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
    },
    reviewsSection: {
      cards: [reviewCardSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TestimonialsMain", testimonialsMainSchema);
