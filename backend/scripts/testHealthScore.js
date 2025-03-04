require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Home = require('../models/Home');
const Task = require('../models/Task');
const logger = require('../utils/logger');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    logger.info('MongoDB connected');
    
    try {
      // Get all homes
      const homes = await Home.find();
      logger.info(`Found ${homes.length} homes`);
      
      // Calculate health score for each home
      for (const home of homes) {
        const tasks = await Task.find({ home_id: home._id });
        
        let score = 0;
        if (tasks.length > 0) {
          const completedTasks = tasks.filter(task => task.completed).length;
          score = Math.round((completedTasks / tasks.length) * 100);
        }
        
        logger.info(`Home ${home._id}: ${tasks.length} tasks, ${score}% health score`);
      }
    } catch (error) {
      logger.error('Error calculating health scores:', error);
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