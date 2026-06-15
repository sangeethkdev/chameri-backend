const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const { cloudinary } = require("../config/cloudinary");

// ─── Generic image upload (any folder) ─────────────────────────────────────
const createUploader = (folder = "chameri") => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
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

module.exports = {
  createUploader,
  uploadProjectImage,
  uploadTeamImage,
  uploadServiceImage,
  uploadBlogImage,
  uploadTestimonialImage,
  uploadGeneralImage,
  uploadAboutImage,
};
