const mongoose = require("mongoose");

/**
 * One stage of the Highlights construction timeline. Each month owns its own
 * media, so moving the timeline on the site swaps the large video and the
 * thumbnail strip together.
 *
 * `_id: false` keeps these as plain embedded objects — the array is always
 * replaced wholesale by the admin panel, never patched by sub-document id.
 */
const highlightMonthSchema = new mongoose.Schema(
  {
    // Timeline label, e.g. "MAY" — what the site prints under the strip.
    label: { type: String, default: "" },
    // Badge burned into the corner of the video, e.g. "May 2026".
    date: { type: String, default: "" },
    video: { type: String, default: "" },
    images: [{ type: String }],
  },
  { _id: false }
);

const kiwanoMainSchema = new mongoose.Schema(
  {
    heroSection: {
      video: { type: String, default: "" },
      heading: { type: String, default: "" },
    },
    luxuryVillasSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
    },
    featureSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      features: [
        {
          image: { type: String, default: "" },
          name: { type: String, default: "" },
        },
      ],
    },
    tour360Section: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      media: { type: String, default: "" }, // Can be video or image URL
    },
    gallerySection: {
      heading: { type: String, default: "" },
      exteriorImages: [{ type: String }],
      interiorImages: [{ type: String }],
      amenitiesImages: [{ type: String }],
    },
    amenitiesSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
    },
    otherProjectSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      image: { type: String, default: "" },
      // Overlay text rendered on top of the section image
      imageHeading: { type: String, default: "" },
      imageSubheading: { type: String, default: "" },
    },
    highlightsSection: {
      heading: { type: String, default: "" },
      subheading: { type: String, default: "" },
      // Per-month timeline cards — the source of truth for the section's media.
      months: [highlightMonthSchema],
      // Legacy single-stage fields, kept so documents saved before the
      // timeline existed still render. The site falls back to these when
      // `months` is empty, and the controller migrates them into the first
      // month the next time months are saved.
      video: { type: String, default: "" },
      images: [{ type: String }],
      date: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KiwanoMain", kiwanoMainSchema);
