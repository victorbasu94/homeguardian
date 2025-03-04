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
 * @returns {Array} - Array of task objects
 */
async function generateMaintenancePlan(home) {
  try {
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
    }

    return tasks;
  } catch (error) {
    logger.error('Error generating maintenance plan:', error);
    throw error;
  }
}

/**
 * Regenerates tasks for a home after it has been updated
 * @param {Object} home - The updated home object
 * @returns {Array} - Array of new task objects
 */
async function regenerateTasksForHome(home) {
  try {
    // Generate new tasks based on updated home information
    const newTasks = await generateMaintenancePlan(home);
    
    return newTasks;
  } catch (error) {
    logger.error('Error regenerating tasks for home:', error);
    throw error;
  }
}

module.exports = {
  generateMaintenancePlan,
  regenerateTasksForHome
}; 