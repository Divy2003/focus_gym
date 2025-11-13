// seeders/adminSeeder.js
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

// Get admin credentials from environment variables with validation
const getAdminConfig = () => {
  const config = {
    name: process.env.ADMIN_NAME || 'Admin',
    mobile: process.env.ADMIN_MOBILE,
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
  };

  if (!config.mobile) {
    throw new Error('ADMIN_MOBILE environment variable is required');
  }

  return config;
};

/**
 * Seed or update admin user
 * @returns {Promise<Object>} Result object with success status and admin details
 */
const seedAdmin = async () => {
  const DEFAULT_ADMIN = getAdminConfig();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('🔍 Checking for existing admin user...');
    
    // Check if admin already exists using transaction
    const existingAdmin = await Admin.findOne({ mobile: DEFAULT_ADMIN.mobile })
      .session(session);
    
    let adminData;
    let isNew = false;
    let message = 'Admin already exists';

    if (!existingAdmin) {
      // Create new admin - let the model's pre-save hook handle password hashing
      console.log('👤 Creating new admin user...');
      
      const admin = new Admin({
        name: DEFAULT_ADMIN.name,
        mobile: DEFAULT_ADMIN.mobile,
        password: DEFAULT_ADMIN.password, // Don't hash here, let the model do it
        isActive: true,
        lastLogin: new Date()
      });
      
      await admin.save({ session });
      adminData = admin;
      isNew = true;
      message = 'Admin created successfully';
      
      console.log('✅ Admin seeded successfully');
    } 
    // Update existing admin if no password set (migrating from OTP)
    else if (!existingAdmin.password) {
      console.log('🔄 Updating existing admin with password...');
      existingAdmin.password = DEFAULT_ADMIN.password; // Don't hash here, let the model do it
      existingAdmin.lastLogin = new Date();
      await existingAdmin.save({ session });
      
      adminData = existingAdmin;
      message = 'Updated existing admin with password';
      console.log('✅ Updated existing admin with password');
    } else {
      adminData = existingAdmin;
      console.log('ℹ️  Admin already exists');
    }

    await session.commitTransaction();
    
    // Don't log sensitive data in production
    if (isNew || !existingAdmin.password) {
      console.log(`📱 Mobile: ${DEFAULT_ADMIN.mobile}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔑 Default password: ${DEFAULT_ADMIN.password}`);
      }
      console.log('⚠️  IMPORTANT: Change this password after first login!');
    }
    
    return {
      success: true,
      message,
      admin: {
        id: adminData._id,
        mobile: adminData.mobile,
        name: adminData.name,
        isNew
      }
    };
    
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Admin seeding error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Self-executing function for direct script execution
const runAsScript = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('🔌 Connected to MongoDB for admin seeding');
    const result = await seedAdmin();
    console.log(result.message);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin:', error.message);
    process.exit(1);
  }
};

// Run if this file is executed directly (not required)
if (require.main === module) {
  runAsScript();
}

module.exports = seedAdmin;
