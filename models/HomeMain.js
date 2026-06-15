const mongoose = require("mongoose");

const homeTestimonialCardSchema = new mongoose.Schema({
  quote: { type: String, default: "" },
  name: { type: String, default: "" },
  designation: { type: String, default: "" },
  image: { type: String, default: "" },
});

const homeMainSchema = new mongoose.Schema(
  {
    hero: {
      heading: { type: String, default: "" },
      subheading1: { type: String, default: "" },
      subheading2: { type: String, default: "" },
    },
    aboutUs: {
      heading: { type: String, default: "" },
      count1: { type: String, default: "" },
      count1Text: { type: String, default: "" },
      count2: { type: String, default: "" },
      count2Text: { type: String, default: "" },
      count3: { type: String, default: "" },
      count3Text: { type: String, default: "" },
      count4: { type: String, default: "" },
      count4Text: { type: String, default: "" },
    },
    logos: [{ type: String }],
    villaPlan: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      card1: {
        heading: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card2: {
        heading: { type: String, default: "" },
        image: { type: String, default: "" }
      }
    },
    chooseUs: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      card1: {
        heading: { type: String, default: "" },
        subheading: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card2: {
        heading: { type: String, default: "" },
        subheading: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card3: {
        heading: { type: String, default: "" },
        subheading: { type: String, default: "" },
        image: { type: String, default: "" }
      }
    },
    gallery: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      card1: {
        name: { type: String, default: "" },
        place: { type: String, default: "" },
        date: { type: String, default: "" },
        images: [{ type: String }]
      },
      card2: {
        name: { type: String, default: "" },
        place: { type: String, default: "" },
        date: { type: String, default: "" },
        images: [{ type: String }]
      },
      card3: {
        name: { type: String, default: "" },
        place: { type: String, default: "" },
        date: { type: String, default: "" },
        images: [{ type: String }]
      },
      card4: {
        name: { type: String, default: "" },
        place: { type: String, default: "" },
        date: { type: String, default: "" },
        images: [{ type: String }]
      },
      card5: {
        name: { type: String, default: "" },
        place: { type: String, default: "" },
        date: { type: String, default: "" },
        images: [{ type: String }]
      }
    },
    ourTeam: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      card1: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card2: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card3: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card4: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      card5: {
        name: { type: String, default: "" },
        designation: { type: String, default: "" },
        image: { type: String, default: "" }
      },
      separateCard: {
        heading: { type: String, default: "" }
      }
    },
    testimonial: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      cards: [homeTestimonialCardSchema]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeMain", homeMainSchema);
