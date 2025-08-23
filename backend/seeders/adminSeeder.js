// seeders/adminSeeder.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ mobile: process.env.ADMIN_MOBILE });
    
    if (!existingAdmin) {
      const admin = new Admin({
        name: 'Gym Admin',
        mobile: process.env.ADMIN_MOBILE,
        isActive: true
      });
      
      await admin.save();
      console.log('Admin seeded successfully:', process.env.ADMIN_MOBILE);
    } else {
      console.log('Admin already exists:', process.env.ADMIN_MOBILE);
    }
  } catch (error) {
    console.error('Admin seeding error:', error);
  }
};

// Auto-seed when the file is required
if (mongoose.connection.readyState === 1) {
  seedAdmin();
} else {
  mongoose.connection.once('open', seedAdmin);
}

module.exports = seedAdmin;
