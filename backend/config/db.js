const mongoose = require('mongoose');
const winston = require('winston');

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10
};

// Retry configuration
const MAX_RETRIES = 5;
let retryCount = 0;
let retryDelay = 1000; // Start with 1 second delay

/**
 * Connect to MongoDB with retry logic
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    winston.info(`MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // Reset retry count on successful connection
    retryDelay = 1000; // Reset retry delay
    return conn;
  } catch (error) {
    winston.error(`MongoDB connection error: ${error.message}`);
    
    // Implement retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      winston.info(`Retrying connection (${retryCount}/${MAX_RETRIES}) in ${retryDelay}ms...`);
      
      // Wait for the delay period
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Exponential backoff: double the delay for next retry
      retryDelay *= 2;
      
      // Try to connect again
      return connectDB();
    } else {
      winston.error('Failed to connect to MongoDB after maximum retry attempts');
      process.exit(1);
    }
  }
};

module.exports = connectDB; 