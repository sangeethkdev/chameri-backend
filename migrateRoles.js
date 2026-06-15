require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

connectDB().then(async () => {
  const col = mongoose.connection.db.collection("admins");
  const r = await col.updateMany({ role: "superadmin" }, { $set: { role: "admin" } });
  console.log(`✅ Updated ${r.modifiedCount} superadmin user(s) → admin`);
  const users = await col.find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
  console.log("\n📋 All users after migration:");
  users.forEach(u => console.log(`  ${u.role.padEnd(10)} ${u.email}`));
  process.exit(0);
}).catch(e => { console.error("❌", e.message); process.exit(1); });
