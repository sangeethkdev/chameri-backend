require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

const seedAdmin = async () => {
  await connectDB();

  // Check if admin already exists
  const existing = await Admin.findOne({ email: "admin@chameri.com" });
  if (existing) {
    console.log("✅ Admin already exists! Email: admin@chameri.com");
    process.exit(0);
  }

  // Create default admin
  await Admin.create({
    name: "CHAMERI Admin",
    email: "admin@chameri.com",
    password: "chameri@123",
    plainPassword: "chameri@123",
    role: "admin",
  });

  console.log("✅ Admin created successfully!");
  console.log("   Email   : admin@chameri.com");
  console.log("   Password: chameri@123");
  console.log("   Role    : superadmin");
  console.log("\n⚠️  Change your password after first login!");
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
