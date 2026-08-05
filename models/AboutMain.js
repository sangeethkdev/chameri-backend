const mongoose = require("mongoose");

// Reusable subdocument shape for each special subsection
const specialItemSchema = {
  heading:    { type: String, default: "" },
  subheading: { type: String, default: "" },
  image:      { type: String, default: "" },
};

// Reusable subdocument shape for each board member
const boardMemberSchema = {
  name:        { type: String, default: "" },
  designation: { type: String, default: "" },
  image:       { type: String, default: "" },
};

// Reusable subdocument shape for each testimonial card
const testimonialCardSchema = new mongoose.Schema({
  quote:       { type: String, default: "" },
  name:        { type: String, default: "" },
  designation: { type: String, default: "" },
  image:       { type: String, default: "" },
  cardImage:   { type: String, default: "" },
});

const aboutMainSchema = new mongoose.Schema(
  {
    hero: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
    },
    story: {
      heading: { type: String, default: "" },
      // Rich text (sanitized HTML) authored in the admin editor.
      description: { type: String, default: "" },
    },
    founder: {
      image: { type: String, default: "" },
      quote: { type: String, default: "" },
      name: { type: String, default: "" },
      role: { type: String, default: "" },
      architectsName: { type: String, default: "" },
    },
    workLogos: [{ type: String }],
    vision: {
      title: { type: String, default: "" },
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    mission: {
      title: { type: String, default: "" },
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      image: { type: String, default: "" },
    },
    specialSection: {
      title:  { type: String, default: "" },
      first:  specialItemSchema,
      second: specialItemSchema,
      third:  specialItemSchema,
      fourth: specialItemSchema,
      fifth:  specialItemSchema,
    },
    boardSection: {
      title:  { type: String, default: "" },
      first:  boardMemberSchema,
      second: boardMemberSchema,
      third:  boardMemberSchema,
      fourth: boardMemberSchema,
    },
    testimonialSection: {
      heading:    { type: String, default: "" },
      subheading: { type: String, default: "" },
      cards:      [testimonialCardSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutMain", aboutMainSchema);

