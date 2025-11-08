// Load environment variables first
require('dotenv').config({ path: '.env' });

// Verify required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const cloudinaryEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Non-fatal check for Cloudinary env vars
const missingCloudinary = cloudinaryEnvVars.filter(varName => !process.env[varName]);
if (missingCloudinary.length > 0) {
  console.warn(
    `Warning: Missing Cloudinary environment variables: ${missingCloudinary.join(', ')}. ` +
    `PDF upload will fail until these are set.`
  );
} else {
  console.log('Cloudinary environment variables detected.');
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const serverless = require('serverless-http');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const dietRoutes = require('./routes/dietRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const transformationsRoutes = require('./routes/transformationsRoutes');

const app = express();

// CRITICAL: Trust proxy for API Gateway - must come first
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting - Lambda-friendly configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
           req.headers['x-real-ip'] || 
           req.ip || 
           'unknown';
  },
  skipFailedRequests: true
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://focus-gym.onrender.com',
  'https://focus-gym-api.onrender.com',
  'http://localhost:5000',
  'http://localhost:3000',
  'https://main.d2s7d4hmm9cork.amplifyapp.com',
  'https://aws.d2s7d4hmm9cork.amplifyapp.com',
  'https://o5gqinqhb4.execute-api.us-east-1.amazonaws.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Focus Gym API is live 🚀',
    time: new Date().toISOString(),
    environment: process.env.AWS_LAMBDA_FUNCTION_NAME ? 'AWS Lambda' : 'Local/Server'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/transformations', transformationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// MongoDB connection with connection pooling for Lambda
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('⚡ Using existing MongoDB connection');
    return;
  }

  console.log('🔄 Attempting to connect to MongoDB...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'Not found');
  console.log('Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'set' : 'missing',
    api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
  });

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
    console.log('✅ Successfully connected to MongoDB');
    
    // Run admin seeder
    require('./seeders/adminSeeder');
    
    // REMOVED: node-cron setup (now handled by EventBridge)
    console.log('ℹ️ Member expiry check is managed by AWS EventBridge scheduler');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

// Connect to database on startup
connectDB().catch(err => console.error('Initial connection failed:', err));

// ============================================
// LOCAL SERVER SETUP (for development/testing)
// ============================================
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⚠️ Note: In local mode, run manual expiry checks via API endpoint`);
  });
}

// ============================================
// LAMBDA HANDLER (for AWS Lambda deployment)
// ============================================
module.exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  const handler = serverless(app);
  return handler(event, context);
};
