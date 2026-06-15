require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

const fixPasswords = async () => {
  await connectDB();
  const db = mongoose.connection.db;
  const col = db.collection("admins");

  // Set known passwords directly (bypasses bcrypt hashing)
  const updates = [
    { email: "admin@chameri.com", plain: "chameri@123" },
  ];

  for (const { email, plain } of updates) {
    const result = await col.updateOne(
      { email },
      { $set: { plainPassword: plain } }
    );
    if (result.matchedCount) {
      console.log(`✅ Fixed plainPassword for ${email} → ${plain}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
  }

  // Show current state of all users
  console.log("\n📋 Current users & plainPasswords:");
  const users = await col.find({}, { projection: { name: 1, email: 1, role: 1, plainPassword: 1 } }).toArray();
  users.forEach(u => {
    const pw = u.plainPassword || "(empty)";
    console.log(`  ${u.role.padEnd(12)} ${u.email.padEnd(30)} → ${pw}`);
  });

  process.exit(0);
};

fixPasswords().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
