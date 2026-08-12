require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { connectCloudinary } = require("./config/cloudinary");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { revalidateOnWrite } = require("./middleware/revalidateOnWrite");

// ─── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ─── Connect Services ────────────────────────────────────────────────────────
connectDB().catch((err) => {
  console.error("❌ Initial MongoDB connection failed:", err.message);
});
connectCloudinary();

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://chameri-admin-dashboard.vercel.app",
      "https://cb-admin.chameribuilders.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "CHAMERI API is running 🚀" });
});

// ─── Ensure a DB connection before hitting any route ──────────────────────────
// The initial connectDB() call above only runs once at boot. If it failed (or a
// later connection ever drops) nothing retries it, so every DB-backed route would
// hang until Mongoose's buffering timeout and return a 500. This makes every
// request retry the connection (cheap — connectDB() reuses an existing one).
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ success: false, message: "Database unavailable. Please try again shortly." });
  }
});

// ─── Push content changes to the public site (must precede the routes) ───────
app.use(revalidateOnWrite);

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
// TODO: Add more routes as sections expand
app.use("/api/about", require("./routes/aboutRoutes"));
app.use("/api/home", require("./routes/homeRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/kiwano", require("./routes/kiwanoRoutes"));
app.use("/api/kiwano-villament", require("./routes/kiwanoVillamentRoutes"));
app.use("/api/services", require("./routes/serviceMainRoutes"));
app.use("/api/projects-main", require("./routes/projectsMainRoutes"));
app.use("/api/testimonials-main", require("./routes/testimonialsMainRoutes"));
// app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/contact-main", require("./routes/contactMainRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));

// ─── Error Handling (must be LAST) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
