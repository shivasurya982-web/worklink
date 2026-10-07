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
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ [DB ERROR]: MONGO_URI is missing in .env file.');
    process.exit(1);
  }

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 [DB]: Connecting to MongoDB Atlas (Attempt ${attempt}/${maxRetries})...`);

      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4 connection to Atlas cluster
        maxPoolSize: 25, // Maintain up to 25 socket connections
        minPoolSize: 5,  // Keep at least 5 connections open for instant queries
      });

      console.log(`✅ [DB]: Connected successfully to MongoDB Atlas (${conn.connection.host})`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ [DB]: Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log('⏳ [DB]: Retrying connection in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.error('❌ [DB ERROR]: Could not connect to MongoDB Atlas cluster after multiple attempts.');
  process.exit(1);
};

module.exports = connectDB;
