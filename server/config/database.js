const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI provided' : 'URI missing');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Provide specific error messages for common issues
    if (error.message.includes('authentication failed')) {
      console.error('❌ Authentication failed. Please check your username and password.');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('❌ Network error. Please check your internet connection and cluster URL.');
    } else if (error.message.includes('bad auth')) {
      console.error('❌ Invalid credentials. Please verify your MongoDB username and password.');
    } else if (error.message.includes('IP')) {
      console.error('❌ IP not whitelisted. Please add your IP address to MongoDB Atlas whitelist.');
    }
    
    console.error('Full error details:', error);
    
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;