require('dotenv').config();
const Admin = require('../models/Admin');
const connectDB = require('../config/db');

const updatePassword = async () => {
  try {
    await connectDB();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@worklinkai.com';
    let admin = await Admin.findOne({ email: adminEmail });

    if (!admin) {
      admin = new Admin({
        name: 'WorkLink Admin',
        email: adminEmail,
        password: 'admin',
        role: 'admin',
        isActive: true,
      });
      await admin.save();
      console.log('✅ Created Admin with email:', adminEmail, 'and password: admin');
    } else {
      admin.password = 'admin';
      await admin.save();
      console.log('✅ Updated Admin password to: admin for', adminEmail);
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin password:', err);
    process.exit(1);
  }
};

updatePassword();
