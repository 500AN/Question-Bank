// This file handles all API routes for Vercel deployment
// It imports and uses the existing Express server

const path = require('path');

// Set up environment for server
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import the Express app
const app = require('../server/server.js');

// Export the app as a Vercel function
module.exports = app;