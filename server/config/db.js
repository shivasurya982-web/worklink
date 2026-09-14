const mongoose = require('mongoose');
const dns = require('dns');

/**
 * DEEP FIX FOR querySrv ECONNREFUSED:
 * We manually set the DNS servers for the current process to Google's Public DNS.
 * This bypasses your ISP's potentially broken or restrictive DNS resolvers.
 */
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  console.log('🌐 [DNS]: Bypassing ISP DNS. Using Google Public DNS (8.8.8.8).');
} catch (err) {
  console.warn('⚠️ [DNS]: Could not manually set DNS servers:', err.message);
}

const connectDB = async (maxRetries = 5, retryDelay = 2000) => {
  // If the SRV lookup still fails, we try to use the standard connection string format
  // but since we don't have the node list, we'll try to optimize the mongoose options.
  const uri = process.env.MONGO_URI;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 [DB]: Attempting connection (Attempt ${attempt}/${maxRetries})...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000, // Increase to 30s
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
      });

      console.log(`✅ [DB]: Successfully connected to Cluster: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ [DB ERROR] Attempt ${attempt}/${maxRetries} failed: ${error.message}`);

      if (attempt < maxRetries) {
        console.log(`⏳ [DB]: Retrying in ${retryDelay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error('--------------------------------------------------');
        console.error('❌ [FATAL]: NETWORK IS BLOCKING ATLAS CONNECTION');
        console.error('--------------------------------------------------');
        console.log('Your computer or Wi-Fi is strictly blocking MongoDB SRV queries.');
        console.log('FIX 1: Connect your computer to a MOBILE HOTSPOT.');
        console.log('FIX 2: Open "Control Panel" -> "Network and Sharing Center"');
        console.log('       -> "Change adapter settings" -> Right-click your Wi-Fi');
        console.log('       -> "Properties" -> "IPv4" -> "Properties"');
        console.log('       -> Use these DNS: 8.8.8.8 and 8.8.4.4');
        console.log('--------------------------------------------------');
        return null;
      }
    }
  }
};

module.exports = connectDB;
