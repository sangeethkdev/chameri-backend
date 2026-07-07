const mongoose = require("mongoose");

// Reuse the connection across serverless invocations instead of
// reconnecting on every cold start.
let connectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // fail fast if Atlas unreachable
    })
    .then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      console.error(`❌ MongoDB Connection Error: ${error.message}`);
      connectionPromise = null; // allow a retry on the next request
      throw error;
    });

  return connectionPromise;
};

module.exports = connectDB;
