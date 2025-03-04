const { DateTime } = require('luxon');
const Task = require('../models/Task');
const taskRules = require('../config/tasks.json');
const logger = require('winston');

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

  const propertyValue = home[condition.property];
  
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
  } else if (frequency.includes('years')) {
    const years = parseInt(frequency.split(' ')[0]);
    return now.plus({ years }).toISODate();
  } else {
    // Default to 1 year if frequency format is unknown
    logger.warn(`Unknown frequency format: ${frequency}, defaulting to 1 year`);
    return now.plus({ years: 1 }).toISODate();
  }
}

/**
 * Generates a maintenance plan for a home based on its characteristics
 * @param {Object} home - The home object
 * @returns {Array} - Array of task objects
 */
async function generateMaintenancePlan(home) {
  try {
    const tasks = [];
    const { rules } = taskRules;

    // Check each rule against the home
    for (const rule of rules) {
      if (evaluateCondition(rule.condition, home)) {
        // Check if this task already exists for this home
        const existingTask = await Task.findOne({
          home_id: home._id,
          task_name: rule.task.task_name
        });

        // Only add if no duplicate exists
        if (!existingTask) {
          const dueDate = calculateDueDate(rule.task.frequency);
          
          tasks.push({
            home_id: home._id,
            task_name: rule.task.task_name,
            frequency: rule.task.frequency,
            due_date: dueDate,
            why: rule.task.why,
            completed: false
          });
        }
      }
    }

    // Save all tasks to the database
    if (tasks.length > 0) {
      await Task.insertMany(tasks);
    }

    return tasks;
  } catch (error) {
    logger.error('Error generating maintenance plan:', error);
    throw error;
  }
}

module.exports = {
  generateMaintenancePlan
}; 