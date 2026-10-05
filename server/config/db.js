const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to resolve IPv4 addresses first for MongoDB Atlas SRV lookups on Windows/Node 18+
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Configure Public DNS for reliable SRV resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore DNS override errors
}

const connectDB = async () => {
  // Only connect to MongoDB Atlas (no local fallback)
  const atlasUris = [
    process.env.MONGO_URI,
    process.env.MONGO_URI_ATLAS_DIRECT
  ].filter(Boolean);

  for (const uri of atlasUris) {
    try {
      const connectionType = uri.startsWith('mongodb+srv') ? 'Atlas SRV' : 'Atlas Direct';
      console.log(`📡 [DB]: Connecting to MongoDB (${connectionType})...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        family: 4, // Force IPv4 connection to Atlas cluster
      });

      console.log(`✅ [DB]: Connected successfully to MongoDB Atlas (${conn.connection.host})`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ [DB]: Atlas connection attempt failed for ${uri.substring(0, 35)}... (${err.message})`);
    }
  }

  console.error('❌ [DB ERROR]: Could not connect to MongoDB Atlas cluster.');
  process.exit(1);
};

module.exports = connectDB;
