const asyncHandler = require("express-async-handler");
const { cloudinary } = require("../config/cloudinary");

// Cloudinary folders always live under this namespace — validated so a
// caller can only write inside the app's own storage tree, never an
// arbitrary path, even though the folder name itself comes from the client.
const FOLDER_RE = /^chameri\/[a-z0-9-]+$/;
const RESOURCE_TYPES = new Set(["image", "video", "auto"]);

// ─── Issue a signature for a direct browser -> Cloudinary upload ─────────────
// Lets the file go straight from the browser to Cloudinary instead of
// through this server, which sidesteps Vercel's ~4.5MB serverless function
// body limit that otherwise rejects larger photos/videos before our app
// (and its CORS headers) ever runs — surfacing in the browser as a
// misleading "CORS error" instead of the real cause.
// @route  POST /api/uploads/signature
// @access Private (admin or editor)
const getUploadSignature = asyncHandler(async (req, res) => {
  const { folder, resourceType = "image" } = req.body;

  if (!folder || !FOLDER_RE.test(folder)) {
    res.status(400);
    throw new Error("Invalid or missing folder");
  }
  if (!RESOURCE_TYPES.has(resourceType)) {
    res.status(400);
    throw new Error("Invalid resourceType");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = { folder, timestamp };

  // Match the auto-optimization the old server-side upload pipeline applied
  if (resourceType === "image") {
    paramsToSign.transformation = "q_auto,f_auto";
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    success: true,
    data: {
      ...paramsToSign,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      resourceType,
    },
  });
});

module.exports = { getUploadSignature };
