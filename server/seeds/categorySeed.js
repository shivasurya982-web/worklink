require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const connectDB = require('../config/db');
const { DEFAULT_CATEGORIES } = require('../utils/constants');

const seedCategories = async () => {
  try {
    await connectDB();

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
        console.log(`  + Category added: ${cat.name}`);
      }
    }

    console.log('✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    process.exit(1);
  }
};

seedCategories();
