const mongoose = require('mongoose');
const dns = require('dns');

// Configure reliable DNS servers to avoid SRV query ECONNREFUSED issues on ISP/Windows networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (err) {
  console.warn('⚠️ [DB]: Could not override default DNS servers:', err.message);
}

const connectDB = async (maxRetries = 5, retryDelay = 2000) => {
  const uri = process.env.MONGO_URI;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 [DB]: Attempting connection to MongoDB Atlas (Attempt ${attempt}/${maxRetries})...`);

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15000,
        heartbeatFrequencyMS: 2000,
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
        console.error('❌ [DB ERROR]: ATLAS REJECTED ALL CONNECTION ATTEMPTS');
        console.error(`Message: ${error.message}`);
        console.error('--------------------------------------------------');
        console.log('👉 PLEASE VERIFY IN MONGODB ATLAS DASHBOARD:');
        console.log('1. Network Access: Ensure "0.0.0.0/0" is ACTIVE.');
        console.log('2. User Access: User "shivasurya982_db_user" must have "Read/Write" permissions.');
        console.log('3. Firewall: If you are on Office/School Wi-Fi, they might block port 27017.');
        console.log('--------------------------------------------------');
        return null;
      }
    }
  }
};

module.exports = connectDB;
