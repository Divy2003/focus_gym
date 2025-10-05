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

// Non-fatal check for Cloudinary env vars (PDF generation will rely on these)
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
const cron = require('node-cron');
const serverless = require('serverless-http');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const dietRoutes = require('./routes/dietRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const transformationsRoutes = require('./routes/transformationsRoutes');
const Member = require('./models/Member');

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
  // Custom key generator to handle API Gateway proxy
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
           req.headers['x-real-ip'] || 
           req.ip || 
           'unknown';
  },
  // Skip failed requests
  skipFailedRequests: true
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://focus-gym.onrender.com',
  'https://focus-gym-api.onrender.com',
  'http://localhost:3000',
  'https://main.d2s7d4hmm9cork.amplifyapp.com',
  'https://o5gqinqhb4.execute-api.us-east-1.amazonaws.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
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
    
    // Setup cron job for daily member expiry check (only in non-Lambda environment)
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
      cron.schedule('5 0 * * *', async () => {
        try {
          console.log('Running daily member expiry check...');
          const result = await Member.updateExpiredMembers();
          const modified = result?.modifiedCount ?? result?.nModified ?? 0;
          console.log(`Expired members updated: ${modified}`);
        } catch (error) {
          console.error('Cron job error:', error);
        }
      }, {
        timezone: "Asia/Kolkata"
      });
      
      console.log('Daily expiry cron job scheduled for 12:05 AM IST');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
};

// Connect to database on startup
connectDB().catch(err => console.error('Initial connection failed:', err));

// Lambda handler with connection reuse
module.exports.handler = async (event, context) => {
  // Prevent Lambda from waiting for event loop to be empty (allows connection reuse)
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Ensure database connection before handling request
  await connectDB();
  
  // Use serverless-http to handle the request
  const handler = serverless(app);
  return handler(event, context);
};
