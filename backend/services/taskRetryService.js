const mongoose = require('mongoose');
const TaskGenerationRetry = require('../models/TaskGenerationRetry');
const Home = require('../models/Home');
const logger = require('../utils/logger');
const { generateMaintenancePlan } = require('./maintenanceService');

/**
 * Queue a task generation retry for a home
 * @param {string} homeId - The home ID
 * @returns {Promise<Object>} - The created retry object
 */
async function queueTaskGenerationRetry(homeId) {
  try {
    logger.info(`Queueing task generation retry for home ${homeId}`);
    return TaskGenerationRetry.create({
      home_id: homeId,
      status: 'pending',
      attempts: 0,
      createdAt: new Date()
    });
  } catch (error) {
    logger.error(`Error queueing task generation retry for home ${homeId}:`, error);
    throw error;
  }
}

/**
 * Process pending task generation retries
 * @param {number} limit - Maximum number of retries to process
 * @returns {Promise<number>} - Number of successfully processed retries
 */
async function processTaskGenerationRetries(limit = 10) {
  try {
    logger.info(`Processing up to ${limit} pending task generation retries`);
    
    // Find pending retries with fewer than 5 attempts
    const pendingRetries = await TaskGenerationRetry.find({ 
      status: 'pending',
      attempts: { $lt: 5 } // Max 5 attempts
    }).sort({ createdAt: 1 }).limit(limit);
    
    logger.info(`Found ${pendingRetries.length} pending retries to process`);
    
    let successCount = 0;
    
    for (const retry of pendingRetries) {
      try {
        // Find the home
        const home = await Home.findById(retry.home_id);
        if (!home) {
          logger.warn(`Home ${retry.home_id} not found for retry ${retry._id}`);
          await TaskGenerationRetry.findByIdAndUpdate(retry._id, { 
            status: 'failed', 
            error: 'Home not found' 
          });
          continue;
        }
        
        logger.info(`Processing retry for home ${home._id} (${home.name || 'Unnamed Home'})`);
        
        // Attempt to generate tasks
        const result = await generateMaintenancePlan(home, true, true);
        
        // Mark as successful
        await TaskGenerationRetry.findByIdAndUpdate(retry._id, { 
          status: 'completed',
          completedAt: new Date()
        });
        
        logger.info(`Successfully generated ${result.tasks.length} tasks for home ${home._id}`);
        successCount++;
      } catch (error) {
        // Increment attempt count and update error message
        await TaskGenerationRetry.findByIdAndUpdate(retry._id, {
          $inc: { attempts: 1 },
          lastAttempt: new Date(),
          error: error.message
        });
        
        logger.error(`Failed retry attempt for home ${retry.home_id}:`, error);
      }
    }
    
    logger.info(`Successfully processed ${successCount} out of ${pendingRetries.length} retries`);
    return successCount;
  } catch (error) {
    logger.error('Error processing task generation retries:', error);
    throw error;
  }
}

/**
 * Schedule task generation for homes that haven't had tasks generated in 3+ months
 * @returns {Promise<number>} - Number of homes scheduled for task generation
 */
async function scheduleTaskGenerationForOverdueHomes() {
  try {
    logger.info('Checking for homes that need task generation');
    
    // Find users that haven't had tasks generated in 3+ months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    // Find all users with homes
    const users = await mongoose.model('User').find({
      $or: [
        { last_tasks_generated_at: { $lt: threeMonthsAgo } },
        { last_tasks_generated_at: { $exists: false } }
      ]
    });
    
    logger.info(`Found ${users.length} users that may need task regeneration`);
    
    let scheduledCount = 0;
    
    for (const user of users) {
      // Find all homes for this user
      const homes = await Home.find({ user_id: user._id });
      
      for (const home of homes) {
        try {
          // Check if there's already a pending retry for this home
          const existingRetry = await TaskGenerationRetry.findOne({
            home_id: home._id,
            status: 'pending'
          });
          
          if (existingRetry) {
            logger.info(`Home ${home._id} already has a pending retry, skipping`);
            continue;
          }
          
          // Queue task generation for this home
          await queueTaskGenerationRetry(home._id);
          scheduledCount++;
          
          logger.info(`Scheduled task regeneration for home ${home._id}`);
        } catch (error) {
          logger.error(`Error scheduling task regeneration for home ${home._id}:`, error);
        }
      }
    }
    
    logger.info(`Scheduled task generation for ${scheduledCount} homes`);
    return scheduledCount;
  } catch (error) {
    logger.error('Error scheduling task generation for overdue homes:', error);
    throw error;
  }
}

module.exports = {
  queueTaskGenerationRetry,
  processTaskGenerationRetries,
  scheduleTaskGenerationForOverdueHomes
}; 