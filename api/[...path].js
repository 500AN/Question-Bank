// Catch-all API route for Vercel
// Handles all /api/* requests with proper error handling

const app = require('../server/server.js');

module.exports = async (req, res) => {
  try {
    // Set proper headers for CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Remove /api prefix from the path since our server expects it
    const originalUrl = req.url;
    req.url = req.url.replace(/^\/api/, '') || '/';
    
    // Add timeout handling
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          message: 'Request timeout'
        });
      }
    }, 25000); // 25 seconds (less than Vercel's 30s limit)

    // Handle the request
    app(req, res);

    // Clear timeout if response is sent
    res.on('finish', () => {
      clearTimeout(timeout);
    });

  } catch (error) {
    console.error('API route error:', error);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};