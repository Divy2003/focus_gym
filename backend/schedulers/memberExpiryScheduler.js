// schedulers/memberExpiryScheduler.js
require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');

let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('⚡ Using existing MongoDB connection');
    return;
  }

  console.log('🔄 Connecting to MongoDB for scheduled task...');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    isConnected = true;
    console.log('✅ MongoDB connected for scheduler');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

module.exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for event loop to be empty
  context.callbackWaitsForEmptyEventLoop = false;

  console.log('🕐 Member expiry scheduler triggered at:', new Date().toISOString());
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    // Connect to database
    await connectDB();

    // Run the expiry maintenance
    const result = await Member.updateExpiredMembers();
    
    // Handle different Mongoose result formats
    const matched = result?.matchedCount ?? result?.n ?? 0;
    const modified = result?.modifiedCount ?? result?.nModified ?? 0;

    console.log(`✅ Expiry maintenance completed. Matched: ${matched}, Modified: ${modified}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Member expiry check completed successfully',
        timestamp: new Date().toISOString(),
        details: {
          matched,
          modified
        }
      })
    };
  } catch (error) {
    console.error('❌ Scheduler error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Failed to run expiry maintenance',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
