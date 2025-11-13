// reset_admin.js - Script to reset admin password if needed
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function resetAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const mobile = process.env.ADMIN_MOBILE || '1234567890';
    const newPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    console.log(`🔍 Looking for admin with mobile: ${mobile}`);
    const admin = await Admin.findOne({ mobile });

    if (!admin) {
      console.log('❌ Admin not found. Run the seeder first: npm run seed');
      process.exit(1);
    }

    console.log('👤 Admin found. Resetting password...');
    admin.password = newPassword; // Let the pre-save hook handle hashing
    await admin.save();

    console.log('✅ Admin password reset successfully!');
    console.log(`📱 Mobile: ${mobile}`);
    console.log(`🔑 Password: ${newPassword}`);
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting admin:', error.message);
    process.exit(1);
  }
}

resetAdmin();