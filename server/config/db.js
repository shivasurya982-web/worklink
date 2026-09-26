const mongoose = require('mongoose');
const dns = require('dns');

// Configure Google Public DNS for SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore
}

const connectDB = async () => {
  const atlasUri = process.env.MONGO_URI;

  try {
    console.log('📡 [DB]: Connecting to MongoDB Atlas Cloud...');
    const conn = await mongoose.connect(atlasUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log(`✅ [DB]: Connected to MongoDB Atlas Cloud Cluster (${conn.connection.host})`);
    return conn;
  } catch (err) {
    console.error(`❌ [DB ERROR]: Could not connect to Atlas: ${err.message}`);
    return null;
  }
};

module.exports = connectDB;
