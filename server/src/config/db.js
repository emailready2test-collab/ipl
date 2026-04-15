const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] No MONGODB_URI found in .env! Running securely in memory-only mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Atlas Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`[MongoDB] Atlas Connection Error: ${error.message}`);
    console.warn('[MongoDB] Falling back to memory-only mode.');
    return false;
  }
};

module.exports = connectDB;
