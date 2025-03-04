const cron = require('node-cron');
const { DateTime } = require('luxon');
const Task = require('../models/Task');
const User = require('../models/User');
const Home = require('../models/Home');
const emailService = require('./emailService');
const logger = require('../utils/logger');

/**
 * Send reminder email for a task
 * @param {Object} task - Task object
 * @param {Object} user - User object
 * @returns {Promise<boolean>} - True if email sent successfully
 */
const sendTaskReminderEmail = async (task, user) => {
  try {
    const transporter = await emailService.createTransporter();
    
    // Format the due date
    const dueDate = DateTime.fromJSDate(task.due_date).toFormat('MMMM dd, yyyy');
    
    // Email options
    const mailOptions = {
      from: `"HomeGuardian" <${process.env.EMAIL_FROM || 'noreply@homeguardian.com'}>`,
      to: user.email,
      subject: `HomeGuardian Reminder: ${task.task_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">HomeGuardian Task Reminder</h2>
          <p>Your task "${task.task_name}" is due on ${dueDate}.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Log in to mark it as complete</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${process.env.FRONTEND_URL}/dashboard</p>
          <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">HomeGuardian - Secure your home with confidence</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    logger.info(`Task reminder email sent to ${user.email} for task: ${task.task_name}`);
    return true;
  } catch (error) {
    logger.error('Error sending task reminder email:', error);
    return false;
  }
};

/**
 * Check for upcoming tasks and send reminder emails
 */
const checkUpcomingTasks = async () => {
  try {
    logger.info('Running scheduled task reminder check');
    
    // Calculate the date 7 days from now
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Find tasks due within the next 7 days that are not completed
    const upcomingTasks = await Task.find({
      due_date: { $lte: sevenDaysFromNow, $gte: new Date() },
      completed: false
    });
    
    logger.info(`Found ${upcomingTasks.length} upcoming tasks for reminders`);
    
    // Process each task
    for (const task of upcomingTasks) {
      // Get the home associated with the task
      const home = await Home.findById(task.home_id);
      
      if (!home) {
        logger.warn(`Home not found for task ${task._id}`);
        continue;
      }
      
      // Get the user associated with the home
      const user = await User.findById(home.user_id);
      
      if (!user) {
        logger.warn(`User not found for home ${home._id}`);
        continue;
      }
      
      // Send reminder email
      const emailSent = await sendTaskReminderEmail(task, user);
      
      if (emailSent) {
        logger.info(`Reminder sent for task: ${task.task_name} to user: ${user.email}`);
      } else {
        logger.error(`Failed to send reminder for task: ${task.task_name} to user: ${user.email}`);
      }
    }
    
    logger.info('Task reminder check completed');
  } catch (error) {
    logger.error('Error checking upcoming tasks:', error);
  }
};

/**
 * Initialize the reminder service with scheduled jobs
 */
const initReminderService = () => {
  // Schedule the task to run daily at 8 AM PST
  cron.schedule('0 8 * * *', checkUpcomingTasks, {
    scheduled: true,
    timezone: "America/Los_Angeles"
  });
  
  logger.info('Reminder service initialized with daily check at 8 AM PST');
};

module.exports = {
  initReminderService,
  checkUpcomingTasks, // Exported for testing purposes
  sendTaskReminderEmail // Exported for testing purposes
}; 