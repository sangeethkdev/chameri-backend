const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Admin = require("../models/Admin");

// ─── Protect: verify JWT ────────────────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized — no token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      res.status(401);
      throw new Error("Admin not found");
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized — invalid token");
  }
});

// ─── Admin only ─────────────────────────────────────────────────────────────
const superAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied — admin role required");
  }
};

module.exports = { protect, superAdmin };
