const { DateTime } = require('luxon');
const Task = require('../models/Task');
const User = require('../models/User');
const taskRules = require('../config/tasks.json');
const logger = require('winston');
const { generateMaintenancePlanWithAI } = require('./openaiService');

/**
 * Checks if tasks should be generated for a user based on the 3-month rule
 * @param {String} userId - The user ID
 * @returns {Boolean} - Whether tasks should be generated
 */
async function shouldGenerateTasks(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      logger.error(`User not found: ${userId}`);
      return false;
    }
    
    // If tasks have never been generated, generate them
    if (!user.last_tasks_generated_at) {
      return true;
    }
    
    // Check if it's been more than 3 months since the last generation
    const lastGenerated = DateTime.fromJSDate(user.last_tasks_generated_at);
    const threeMonthsAgo = DateTime.now().minus({ months: 3 });
    
    return lastGenerated < threeMonthsAgo;
  } catch (error) {
    logger.error('Error checking if tasks should be generated:', error);
    // Default to false to prevent unnecessary task generation
    return false;
  }
}

/**
 * Updates the last_tasks_generated_at timestamp for a user
 * @param {String} userId - The user ID
 */
async function updateTaskGenerationTimestamp(userId) {
  try {
    await User.findByIdAndUpdate(userId, {
      last_tasks_generated_at: new Date()
    });
  } catch (error) {
    logger.error('Error updating task generation timestamp:', error);
  }
}

/**
 * Evaluates a condition against a home property
 * @param {Object} condition - The condition to evaluate
 * @param {Object} home - The home object
 * @returns {Boolean} - Whether the condition is met
 */
function evaluateCondition(condition, home) {
  // Handle "always true" conditions
  if (condition.property === 'always' && condition.operator === 'true') {
    return true;
  }

  // Handle nested properties (e.g., windows.type)
  let propertyValue;
  if (condition.property.includes('.')) {
    const parts = condition.property.split('.');
    let current = home;
    for (const part of parts) {
      if (current && current[part] !== undefined) {
        current = current[part];
      } else {
        return false; // Property path doesn't exist
      }
    }
    propertyValue = current;
  } else {
    propertyValue = home[condition.property];
  }
  
  // If property doesn't exist, condition is not met
  if (propertyValue === undefined) {
    return false;
  }

  switch (condition.operator) {
    case '<':
      return propertyValue < condition.value;
    case '>':
      return propertyValue > condition.value;
    case '<=':
      return propertyValue <= condition.value;
    case '>=':
      return propertyValue >= condition.value;
    case '===':
    case '==':
      return propertyValue === condition.value;
    case '!==':
    case '!=':
      return propertyValue !== condition.value;
    case 'includes':
      return Array.isArray(propertyValue) && propertyValue.includes(condition.value);
    case 'exists':
      return propertyValue !== undefined && propertyValue !== null;
    default:
      logger.warn(`Unknown operator ${condition.operator} in task rule`);
      return false;
  }
}

/**
 * Calculate due date based on frequency
 * @param {String} frequency - The frequency string (e.g., "yearly", "6 months")
 * @returns {String} - ISO date string for the due date
 */
function calculateDueDate(frequency) {
  const now = DateTime.now();
  
  if (frequency === 'yearly' || frequency === '1 year') {
    return now.plus({ years: 1 }).toISODate();
  } else if (frequency === '6 months') {
    return now.plus({ months: 6 }).toISODate();
  } else if (frequency === '3 months' || frequency === 'quarterly') {
    return now.plus({ months: 3 }).toISODate();
  } else if (frequency === 'monthly' || frequency === '1 month') {
    return now.plus({ months: 1 }).toISODate();
  } else if (frequency === 'seasonal' || frequency === 'seasonally') {
    // Calculate next season change
    const month = now.month;
    if (month >= 3 && month < 6) {
      // Spring -> Summer (June)
      return now.set({ month: 6, day: 1 }).toISODate();
    } else if (month >= 6 && month < 9) {
      // Summer -> Fall (September)
      return now.set({ month: 9, day: 1 }).toISODate();
    } else if (month >= 9 && month < 12) {
      // Fall -> Winter (December)
      return now.set({ month: 12, day: 1 }).toISODate();
    } else {
      // Winter -> Spring (March)
      return now.set({ month: 3, day: 1 }).plus(month < 3 ? { years: 0 } : { years: 1 }).toISODate();
    }
  } else if (frequency.includes('years')) {
    const years = parseInt(frequency.split(' ')[0]);
    return now.plus({ years }).toISODate();
  } else if (frequency.includes('months')) {
    const months = parseInt(frequency.split(' ')[0]);
    return now.plus({ months }).toISODate();
  } else if (frequency.includes('weeks')) {
    const weeks = parseInt(frequency.split(' ')[0]);
    return now.plus({ weeks }).toISODate();
  } else {
    // Default to 1 year if frequency format is unknown
    logger.warn(`Unknown frequency format: ${frequency}, defaulting to 1 year`);
    return now.plus({ years: 1 }).toISODate();
  }
}

/**
 * Generates a maintenance plan for a home based on its characteristics
 * @param {Object} home - The home object
 * @param {Boolean} useAI - Whether to use AI for generating the plan
 * @param {Boolean} forceGeneration - Whether to force generation regardless of the 3-month rule
 * @returns {Array} - Array of task objects
 */
async function generateMaintenancePlan(home, useAI = false, forceGeneration = false) {
  try {
    // Check if tasks should be generated based on the 3-month rule
    if (!forceGeneration) {
      const shouldGenerate = await shouldGenerateTasks(home.user_id);
      
      if (!shouldGenerate) {
        logger.info(`Skipping task generation for user ${home.user_id} - less than 3 months since last generation`);
        
        // Return existing tasks instead
        const existingTasks = await Task.find({ home_id: home._id });
        
        // Include a message indicating we're using existing tasks
        return {
          tasks: existingTasks,
          message: 'Using existing maintenance plan (less than 3 months since last generation)',
          generated_at: new Date().toISOString()
        };
      }
    }
    
    // Check if we're in development mode - if so, use mock data instead of calling OpenAI
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Using mock data for maintenance plan in development mode');
      return generateMockMaintenancePlan(home);
    }
    
    // If AI-powered plan generation is requested and we're in production
    if (useAI && process.env.OPENAI_API_KEY) {
      try {
        const aiPlan = await generateMaintenancePlanWithAI(home);
        const tasks = [];
        
        // Convert AI-generated plan to our task format
        if (aiPlan && aiPlan.tasks && Array.isArray(aiPlan.tasks)) {
          for (const item of aiPlan.tasks) {
            // Create task with AI-generated details
            const taskData = {
              home_id: home._id,
              task_name: item.title || item.task,
              description: item.description || item.taskDescription || `Maintenance task: ${item.title || item.task}`,
              frequency: 'custom', // AI doesn't specify frequency directly
              due_date: item.due_date || item.suggestedCompletionDate,
              why: "AI-recommended maintenance task",
              estimated_time: parseEstimatedTime(item.estimated_time || item.estimatedTime), // Convert time string to minutes
              estimated_cost: item.estimated_cost || item.estimatedCost || 0,
              category: item.category || 'maintenance',
              priority: item.priority || determinePriority(item.due_date || item.suggestedCompletionDate),
              steps: item.subtasks || item.subTasks || [],
              completed: false,
              ai_generated: true
            };
            
            tasks.push(taskData);
          }
          
          // Save all tasks to the database
          if (tasks.length > 0) {
            await Task.insertMany(tasks);
            
            // Update the last_tasks_generated_at timestamp
            await updateTaskGenerationTimestamp(home.user_id);
          }
          
          return {
            tasks,
            message: 'AI-powered maintenance plan generated successfully',
            generated_at: aiPlan.generated_at || new Date().toISOString()
          };
        }
      } catch (error) {
        logger.error('Error generating AI maintenance plan, falling back to rule-based:', error);
        // Fall back to rule-based if AI fails
      }
    }
    
    // Original rule-based logic
    const tasks = [];
    const { rules } = taskRules;

    // Check each rule against the home
    for (const rule of rules) {
      // If there are multiple conditions, all must be met
      let conditionsMet = true;
      
      if (Array.isArray(rule.conditions)) {
        for (const condition of rule.conditions) {
          if (!evaluateCondition(condition, home)) {
            conditionsMet = false;
            break;
          }
        }
      } else if (rule.condition) {
        // Backward compatibility for single condition
        conditionsMet = evaluateCondition(rule.condition, home);
      }

      if (conditionsMet) {
        // Check if this task already exists for this home
        const existingTask = await Task.findOne({
          home_id: home._id,
          task_name: rule.task.task_name
        });

        // Only add if no duplicate exists
        if (!existingTask) {
          const dueDate = calculateDueDate(rule.task.frequency);
          
          // Create task with enhanced details
          const taskData = {
            home_id: home._id,
            task_name: rule.task.task_name,
            description: rule.task.description || `Maintenance task: ${rule.task.task_name}`,
            frequency: rule.task.frequency,
            due_date: dueDate,
            why: rule.task.why,
            estimated_time: rule.task.estimated_time || 30, // Default 30 minutes
            estimated_cost: rule.task.estimated_cost || 0,
            category: rule.task.category || 'maintenance',
            priority: rule.task.priority || 'medium',
            steps: rule.task.steps || [],
            completed: false
          };
          
          tasks.push(taskData);
        }
      }
    }

    // Save all tasks to the database
    if (tasks.length > 0) {
      await Task.insertMany(tasks);
      
      // Update the last_tasks_generated_at timestamp
      await updateTaskGenerationTimestamp(home.user_id);
    }

    return {
      tasks,
      message: 'Rule-based maintenance plan generated successfully',
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Error generating maintenance plan:', error);
    throw error;
  }
}

/**
 * Regenerates tasks for a home after it has been updated
 * @param {Object} home - The updated home object
 * @param {Boolean} useAI - Whether to use AI for generating the plan
 * @returns {Array} - Array of new task objects
 */
async function regenerateTasksForHome(home, useAI = false) {
  try {
    // Generate new tasks based on updated home information
    // Force generation regardless of the 3-month rule
    const result = await generateMaintenancePlan(home, useAI, true);
    
    return result;
  } catch (error) {
    logger.error('Error regenerating tasks for home:', error);
    throw error;
  }
}

/**
 * Parse estimated time string to minutes
 * @param {String} timeString - Time string (e.g., "2 hours", "30 minutes")
 * @returns {Number} - Time in minutes
 */
function parseEstimatedTime(timeString) {
  if (!timeString) return 30; // Default 30 minutes
  
  const lowerTimeString = timeString.toLowerCase();
  
  if (lowerTimeString.includes('hour')) {
    const hours = parseFloat(lowerTimeString.replace(/[^0-9.]/g, ''));
    return Math.round(hours * 60);
  } else if (lowerTimeString.includes('minute')) {
    return Math.round(parseFloat(lowerTimeString.replace(/[^0-9.]/g, '')));
  } else if (lowerTimeString.includes('day')) {
    const days = parseFloat(lowerTimeString.replace(/[^0-9.]/g, ''));
    return Math.round(days * 8 * 60); // Assuming 8-hour workdays
  }
  
  // If format is unknown, default to 30 minutes
  return 30;
}

/**
 * Determine task priority based on due date
 * @param {String} dueDate - ISO date string
 * @returns {String} - Priority level (high, medium, low)
 */
function determinePriority(dueDate) {
  const now = DateTime.now();
  const due = DateTime.fromISO(dueDate);
  const diff = due.diff(now, 'days').days;
  
  if (diff < 30) {
    return 'high';
  } else if (diff < 90) {
    return 'medium';
  } else {
    return 'low';
  }
}

module.exports = {
  generateMaintenancePlan,
  regenerateTasksForHome,
  shouldGenerateTasks,
  updateTaskGenerationTimestamp
}; 