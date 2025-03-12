const cron = require('node-cron');
const logger = require('../utils/logger');
const { processTaskGenerationRetries, scheduleTaskGenerationForOverdueHomes } = require('./taskRetryService');

/**
 * Initialize all cron jobs
 */
function initCronJobs() {
  // Process pending task generation retries every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      logger.info('Running scheduled job: Process task generation retries');
      await processTaskGenerationRetries(20); // Process up to 20 retries at a time
    } catch (error) {
      logger.error('Error in task generation retry cron job:', error);
    }
  });

  // Check for homes that need task generation every day at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      logger.info('Running scheduled job: Schedule task generation for overdue homes');
      await scheduleTaskGenerationForOverdueHomes();
    } catch (error) {
      logger.error('Error in overdue homes cron job:', error);
    }
  });

  logger.info('Cron jobs initialized');
}

module.exports = {
  initCronJobs
}; 