// Main API route handler for Vercel deployment
// Provides health check and basic API information

const app = require('../server/server.js');

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // For root API requests, provide API information
    if (req.url === '/' || req.url === '/api' || req.url === '/api/') {
      res.status(200).json({
        message: 'MCQ Test Application API',
        version: '1.0.0',
        status: 'OK',
        timestamp: new Date().toISOString(),
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
      return;
    }

    // Handle other requests through the main app
    app(req, res);

  } catch (error) {
    console.error('API index error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'API service error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};