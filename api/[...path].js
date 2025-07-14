// Catch-all API route for Vercel
// Handles all /api/* requests

const app = require('../server/server.js');

module.exports = (req, res) => {
  // Remove /api prefix from the path since our server expects it
  req.url = req.url.replace(/^\/api/, '') || '/';
  
  return app(req, res);
};