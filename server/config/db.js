const mongoose = require('mongoose');
const dns = require('dns');

// Configure Google Public DNS for SRV lookups on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore
}

const connectDB = async () => {
  const uris = [
    process.env.MONGO_URI,
    process.env.MONGO_URI_ATLAS_DIRECT,
    process.env.MONGO_LOCAL_URI || 'mongodb://127.0.0.1:27017/worklink-ai'
  ].filter(Boolean);

  for (const uri of uris) {
    try {
      console.log(`📡 [DB]: Connecting to MongoDB (${uri.startsWith('mongodb+srv') ? 'Atlas SRV' : uri.includes('mongodb.net') ? 'Atlas Direct' : 'Local Host'})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
      });
      console.log(`✅ [DB]: Connected successfully to MongoDB (${conn.connection.host})`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ [DB]: Connection attempt failed for ${uri.substring(0, 35)}... (${err.message})`);
    }
  }

  console.error('❌ [DB ERROR]: Could not connect to any MongoDB instance.');
  return null;
};

module.exports = connectDB;
