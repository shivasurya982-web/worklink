require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const connectDB = require('../config/db');
const { DEFAULT_CATEGORIES } = require('../utils/constants');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting Worklyn AI database seeding...');

    // 1. Seed Categories
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const cat = DEFAULT_CATEGORIES[i];
      const existing = await Category.findOne({ name: cat.name });
      if (!existing) {
        await Category.create({
          name: cat.name,
          description: cat.description,
          icon: cat.icon,
          order: i + 1,
        });
        console.log(`  + Category: ${cat.name}`);
      }
    }
    const categories = await Category.find();
    const electricianCat = categories.find((c) => c.name.toLowerCase().includes('electric'))?._id || (categories[0] ? categories[0]._id : null);
    const plumberCat = categories.find((c) => c.name.toLowerCase().includes('plumb'))?._id || (categories[0] ? categories[0]._id : null);

    // 2. Seed Admin
    const adminEmail = 'admin@worklynai.com';
    const adminPassword = 'admin';

    // Find and update or create
    const admin = await Admin.findOne({ email: adminEmail });
    if (admin) {
      admin.password = adminPassword;
      await admin.save();
      console.log(`  + Admin Password Reset successfully for: ${adminEmail}`);
    } else {
      await Admin.create({
        name: 'Worklyn Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true,
      });
      console.log(`  + Admin Account Created: ${adminEmail} / ${adminPassword}`);
    }

    // 3. Seed Demo Customer
    const customerEmail = 'customer@worklynai.com';
    const existingCustomer = await Customer.findOne({ email: customerEmail });
    if (!existingCustomer) {
      await Customer.create({
        name: 'Rahul Sharma',
        email: customerEmail,
        password: 'Password123',
        phone: '+919876543210',
        address: {
          street: '123 MG Road',
          city: 'Tiruchendur',
          state: 'Maharashtra',
          zip: '400001',
          coordinates: { lat: 19.076, lng: 72.8777 },
        },
        isEmailVerified: true,
        securityHint: 'Tommy',
      });
      console.log('  + Demo Customer Created: customer@worklynai.com / Password123');
    }

    // 4. Seed Demo Workers
    const worker1Email = 'electrician@worklynai.com';
    const existingWorker1 = await Worker.findOne({ email: worker1Email });
    if (!existingWorker1 && electricianCat) {
      await Worker.create({
        name: 'Ramesh Sharma',
        email: worker1Email,
        password: 'Password123',
        phone: '+919811122233',
        profession: 'Master Electrician',
        category: electricianCat,
        experience: 8,
        description: 'Certified master electrician with 8+ years experience.',
        pricing: { hourly: 350, minimum: 200, currency: '₹' },
        approvalStatus: 'approved',
        isVerified: true,
        isAvailable: true,
        rating: 4.9,
        totalReviews: 48,
        completedJobs: 120,
        securityHint: 'St Marys',
        address: {
          street: '45 Bandra West',
          city: 'Tiruchendur',
          state: 'Maharashtra',
          zip: '400050',
          coordinates: { type: 'Point', coordinates: [72.83, 19.05] },
        },
      });
      console.log('  + Demo Worker 1 Created: electrician@worklynai.com / Password123');
    }

    console.log('\n🎉 ALL DATA SEEDED SUCCESSFULLY FOR WORKLYN AI!');
    console.log('--------------------------------------------------');
    console.log('🔑 LOGIN DETAILS:');
    console.log('1. Admin:    admin@worklynai.com     / admin');
    console.log('2. Customer: customer@worklynai.com  / Password123');
    console.log('3. Worker:   electrician@worklynai.com / Password123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
