require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

const resetAdmin = async () => {
  await connectDB();

  const admin = await Admin.findOne({ email: "admin@chameri.com" });

  if (!admin) {
    console.log("❌ No admin found with email: admin@chameri.com");
    console.log("👉 Run: node seed.js  — to create the admin first.");
    process.exit(1);
  }

  // Set new password (will be hashed by the model's pre-save hook)
  admin.password = "chameri@123";
  admin.plainPassword = "chameri@123";
  await admin.save();

  console.log("✅ Admin password has been reset successfully!");
  console.log("   Email   : admin@chameri.com");
  console.log("   Password: chameri@123");
  console.log("\n⚠️  Please change your password after logging in!");
  process.exit(0);
};

resetAdmin().catch((err) => {
  console.error("❌ Reset failed:", err.message);
  process.exit(1);
});
