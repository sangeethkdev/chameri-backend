const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");

// ─── Generic image upload (any folder) ─────────────────────────────────────
const createUploader = (folder = "chameri", resourceType = "image", formats = ["jpg", "jpeg", "png", "webp", "svg"]) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: formats,
      resource_type: resourceType,
      transformation: resourceType === "image" ? [{ quality: "auto", fetch_format: "auto" }] : undefined,
    },
  });
  return multer({ storage });
};

// ─── Pre-built uploaders for specific sections ──────────────────────────────
const uploadProjectImage = createUploader("chameri/projects");
const uploadTeamImage = createUploader("chameri/team");
const uploadServiceImage = createUploader("chameri/services");
const uploadBlogImage = createUploader("chameri/blogs");
const uploadTestimonialImage = createUploader("chameri/testimonials");
const uploadGeneralImage = createUploader("chameri/general");
const uploadAboutImage = createUploader("chameri/about");
const uploadHomeImage = createUploader("chameri/home");
const uploadKiwanoImage = createUploader("chameri/kiwano");
const uploadKiwanoVideo = createUploader("chameri/kiwano", "video", ["mp4", "mov", "avi", "webm"]);
const uploadKiwanoMedia = createUploader("chameri/kiwano", "auto", ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi", "webm"]);
const uploadKiwanoVillamentImage = createUploader("chameri/kiwano-villament");
const uploadKiwanoVillamentVideo = createUploader("chameri/kiwano-villament", "video", ["mp4", "mov", "avi", "webm"]);
const uploadKiwanoVillamentMedia = createUploader("chameri/kiwano-villament", "auto", ["jpg", "jpeg", "png", "webp", "mp4", "mov", "avi", "webm"]);

module.exports = {
  createUploader,
  uploadProjectImage,
  uploadTeamImage,
  uploadServiceImage,
  uploadBlogImage,
  uploadTestimonialImage,
  uploadGeneralImage,
  uploadAboutImage,
  uploadHomeImage,
  uploadKiwanoImage,
  uploadKiwanoVideo,
  uploadKiwanoMedia,
  uploadKiwanoVillamentImage,
  uploadKiwanoVillamentVideo,
  uploadKiwanoVillamentMedia,
};
