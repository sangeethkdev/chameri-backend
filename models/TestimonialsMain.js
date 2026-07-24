const mongoose = require("mongoose");

const reviewCardSchema = new mongoose.Schema({
  image: { type: String, default: "" },
  video: { type: String, default: "" },
  quote: { type: String, default: "" },
  name: { type: String, default: "" },
  role: { type: String, default: "" },
  rating: { type: Number, min: 1, max: 5, default: 5 },
});

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
