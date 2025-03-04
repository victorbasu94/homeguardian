require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { checkUpcomingTasks } = require('../services/reminderService');
const logger = require('../utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('MongoDB connected');
    
    try {
      // Run the reminder check
      logger.info('Running reminder check manually...');
      await checkUpcomingTasks();
      logger.info('Reminder check completed');
    } catch (error) {
      logger.error('Error running reminder check:', error);
    } finally {
      // Close the connection
      mongoose.connection.close();
      logger.info('MongoDB connection closed');
    }
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }); 