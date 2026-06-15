require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("./models/Admin");
const connectDB = require("./config/db");

const patchPasswords = async () => {
  await connectDB();

  // Find users missing plainPassword
  const users = await Admin.find({ $or: [{ plainPassword: null }, { plainPassword: "" }, { plainPassword: { $exists: false } }] });

  if (users.length === 0) {
    console.log("✅ All users already have plainPassword set.");
    process.exit(0);
  }

  console.log(`Found ${users.length} user(s) without plainPassword. Setting placeholder...`);

  for (const user of users) {
    // We cannot recover already-hashed passwords, so set a placeholder
    // The superadmin can then reset them individually
    user.plainPassword = "(set via reset)";
    await Admin.updateOne({ _id: user._id }, { $set: { plainPassword: "(set via reset)" } });
    console.log(`  → Patched: ${user.email}`);
  }

  console.log("\n✅ Done! Existing users show '(set via reset)' as password.");
  console.log("   Use the Reset Password button in User Management to set new passwords.\n");
  process.exit(0);
};

patchPasswords().catch((err) => {
  console.error("❌ Patch failed:", err.message);
  process.exit(1);
});
