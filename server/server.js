const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables');
  process.exit(1);
}

const app = express();

// Connect to database
connectDB();

// CORS configuration for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:3000', // For local development
      'https://localhost:3000'
    ].filter(Boolean);

    // Allow any vercel.app domain for your project
    const isVercelDomain = origin && origin.includes('vercel.app');
    
    // Allow same-origin requests (when client and server are on same domain)
    const isSameOrigin = !origin || origin === process.env.VERCEL_URL;

    console.log('🔍 CORS Check:', {
      origin,
      allowedOrigins,
      isVercelDomain,
      isSameOrigin,
      CLIENT_URL: process.env.CLIENT_URL,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      VERCEL_URL: process.env.VERCEL_URL
    });

    if (allowedOrigins.includes(origin) || isVercelDomain || isSameOrigin) {
      console.log('✅ CORS: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin blocked:', origin);
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MCQ Test Application API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      subjects: '/api/subjects',
      questions: '/api/questions',
      tests: '/api/tests',
      attempts: '/api/attempts',
      dashboard: '/api/dashboard'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`
  });
});

// Catch-all handler for non-API routes (let client handle routing)
app.use('*', (req, res) => {
  // In production, this should serve the client app
  if (process.env.NODE_ENV === 'production') {
    res.status(404).json({
      success: false,
      message: 'Route not found - this should be handled by client routing'
    });
  } else {
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// For Vercel deployment, export the app directly
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development, start the server
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    console.error('Shutting down the server due to unhandled promise rejection');
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error('Shutting down the server due to uncaught exception');
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully');
    server.close(() => {
      console.log('💤 Process terminated');
    });
  });
}