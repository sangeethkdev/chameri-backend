require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { connectCloudinary } = require("./config/cloudinary");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// ─── Routes ─────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const projectRoutes = require("./routes/projectRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ─── Connect Services ────────────────────────────────────────────────────────
connectDB();
connectCloudinary();

const app = express();

// ─── Core Middleware ─────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "http://localhost:5173",
      "http://localhost:5174",
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

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);
// TODO: Add more routes as sections expand
app.use("/api/about", require("./routes/aboutRoutes"));
// app.use("/api/testimonials", require("./routes/testimonialRoutes"));
// app.use("/api/contacts", require("./routes/contactRoutes"));

// ─── Error Handling (must be LAST) ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
});
