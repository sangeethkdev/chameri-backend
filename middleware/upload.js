const multer = require("multer");
const heicConvert = require("heic-convert");
const { cloudinary } = require("../config/cloudinary");

// ─── HEIC/HEIF-aware Cloudinary storage engine ──────────────────────────────
// iPhones commonly upload photos as HEIC/HEIF, which Cloudinary's default
// plan cannot decode ("An unknown file format not allowed"). Any such file is
// converted to JPEG in-process before it reaches Cloudinary; everything else
// is streamed straight through exactly as before.
const isHeicFile = (file) =>
  /\.(heic|heif)$/i.test(file.originalname || "") || /heic|heif/i.test(file.mimetype || "");

class CloudinaryStorage {
  constructor({ folder, resourceType, formats }) {
    this.folder = folder;
    this.resourceType = resourceType;
    this.formats = formats;
  }

  _handleFile(req, file, cb) {
    const finish = (err, result) => {
      if (err) return cb(err);
      cb(null, { path: result.secure_url, size: result.bytes, filename: result.public_id });
    };

    if (!isHeicFile(file) || this.resourceType === "video") {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: this.folder,
          resource_type: this.resourceType,
          allowed_formats: this.formats,
          transformation: this.resourceType === "image" ? [{ quality: "auto", fetch_format: "auto" }] : undefined,
        },
        finish
      );
      file.stream.pipe(stream);
      return;
    }

    // HEIC/HEIF → buffer the whole file, convert to JPEG, then upload
    const chunks = [];
    file.stream.on("data", (chunk) => chunks.push(chunk));
    file.stream.on("error", cb);
    file.stream.on("end", async () => {
      try {
        const inputBuffer = Buffer.concat(chunks);
        const outputBuffer = await heicConvert({ buffer: inputBuffer, format: "JPEG", quality: 0.9 });
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: this.folder,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          finish
        );
        stream.end(outputBuffer);
      } catch (err) {
        cb(err);
      }
    });
  }

  _removeFile(req, file, cb) {
    cloudinary.uploader.destroy(file.filename, { invalidate: true }, cb);
  }
}

// ─── Generic image upload (any folder) ─────────────────────────────────────
const createUploader = (folder = "chameri", resourceType = "image", formats = ["jpg", "jpeg", "png", "webp", "svg", "gif", "bmp", "tiff", "ico", "heic", "heif", "avif"]) => {
  const storage = new CloudinaryStorage({ folder, resourceType, formats });
  return multer({ storage });
};

// ─── Pre-built uploaders for specific sections ──────────────────────────────
const uploadProjectImage = createUploader("chameri/projects");
const uploadTeamImage = createUploader("chameri/team");
const uploadServiceImage = createUploader("chameri/services");
const uploadServiceVideo = createUploader("chameri/services", "video", ["mp4", "mov", "avi", "webm"]);
const uploadBlogImage = createUploader("chameri/blogs");
const uploadTestimonialImage = createUploader("chameri/testimonials");
const uploadTestimonialMedia = createUploader("chameri/testimonials", "auto", ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "ico", "heic", "heif", "avif", "mp4", "mov", "avi", "webm"]);
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
  uploadServiceVideo,
  uploadBlogImage,
  uploadTestimonialImage,
  uploadTestimonialMedia,
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
