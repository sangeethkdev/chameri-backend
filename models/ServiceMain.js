const mongoose = require("mongoose");

const serviceTestimonialCardSchema = new mongoose.Schema({
  quote: { type: String, default: "" },
  name: { type: String, default: "" },
  designation: { type: String, default: "" },
  image: { type: String, default: "" },
  cardImage: { type: String, default: "" },
});

const serviceMainSchema = new mongoose.Schema(
  {
    heroSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      video: { type: String, default: "" },
    },
    cardsSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      cards: [
        {
          heading: { type: String, default: "" },
          subheading: { type: String, default: "" },
          image: { type: String, default: "" },
        },
      ],
    },
    testimonial: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      cards: [serviceTestimonialCardSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceMain", serviceMainSchema);
