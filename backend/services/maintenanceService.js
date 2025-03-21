const { DateTime } = require('luxon');
const Task = require('../models/Task');
const User = require('../models/User');
const taskRules = require('../config/tasks.json');
const logger = require('winston');
const { generateMaintenancePlanWithAI } = require('./openaiService');
const Home = require('../models/Home');
const mongoose = require('mongoose');

/**
 * Checks if tasks should be generated for a user based on the 3-month rule
 * @param {String} userId - The user ID
 * @param {String} homeId - The home ID
 * @returns {Boolean} - Whether tasks should be generated
 */
async function shouldGenerateTasks(userId, homeId) {
  try {
    logger.info(`Checking if tasks should be generated for user ${userId}, home ${homeId}`);
    
    // First verify that the home belongs to the user
    const home = await Home.findById(homeId);
    
    if (!home) {
      logger.error(`Home ${homeId} not found`);
      return false;
    }
    
    if (home.user_id.toString() !== userId) {
      logger.error(`Home ${homeId} does not belong to user ${userId}`);
      return false;
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      logger.error(`User not found: ${userId}`);
      return false;
    }

    // Always generate tasks if user is in REGISTERED or HOME_CREATED state
    if (user.onboarding_status === 'REGISTERED' || user.onboarding_status === 'HOME_CREATED') {
      logger.info(`User ${userId} is in ${user.onboarding_status} state - generating initial tasks`);
      return true;
    }

    // If user has just completed onboarding (no last_tasks_generated_at or it's null),
    // we should always generate tasks
    if (!user.last_tasks_generated_at || user.last_tasks_generated_at === null) {
      logger.info(`User ${userId} has no last_tasks_generated_at or it's null - generating initial tasks`);
      return true;
    }

    // Check when the user completed onboarding
    const onboardingCompletedAt = user.onboarding_completed_at;
    if (!onboardingCompletedAt) {
      // If no onboarding completion date, treat as if just completed
      return true;
    }

    const threeMonthsFromOnboarding = new Date(onboardingCompletedAt);
    threeMonthsFromOnboarding.setMonth(threeMonthsFromOnboarding.getMonth() + 3);
    const now = new Date();

    // If it's been less than 3 months since onboarding, always generate new tasks
    if (now < threeMonthsFromOnboarding) {
      logger.info(`Less than 3 months since onboarding - generating new tasks`);
      return true;
    }
    
    // Check if there are any existing tasks for this home
    const existingTasks = await Task.find({ home_id: homeId });
    
    // If no existing tasks, we should generate
    if (!existingTasks || existingTasks.length === 0) {
      logger.info(`No existing tasks found for home ${homeId} - generating tasks`);
      return true;
    }

    // If it's been more than 3 months since last generation, generate new tasks
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    if (new Date(user.last_tasks_generated_at) < threeMonthsAgo) {
      logger.info(`More than 3 months since last task generation - generating new tasks`);
      return true;
    }

    logger.info(`Using existing tasks - less than 3 months since last generation`);
    return false;
  } catch (error) {
    logger.error('Error in shouldGenerateTasks:', error);
    // In case of error, default to generating tasks
    return true;
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
 * @param {Object} existingSession - Optional: existing MongoDB session from parent function
 * @returns {Array} - Array of task objects
 */
async function generateMaintenancePlan(home, useAI = false, forceGeneration = false, existingSession = null) {
  // If an existing session was provided, use it instead of creating a new one
  const session = existingSession || await mongoose.startSession();
  
  // Only start a transaction if we created a new session
  const shouldManageTransaction = !existingSession;
  if (shouldManageTransaction) {
    session.startTransaction();
  }
  
  try {
    // Get user to check onboarding status
    const user = await User.findById(home.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    // Check for existing tasks
    const existingTasks = await Task.find({ home_id: home._id });

    // If we're not forcing generation and there are existing tasks, return them
    if (!forceGeneration && existingTasks.length > 0) {
      return {
        tasks: existingTasks,
        message: 'Using existing maintenance plan (less than 3 months since last generation)',
        generated_at: new Date().toISOString()
      };
    }

    // Otherwise, proceed with generating new tasks
    let generatedTasks = [];
    
    // Check if we're in development mode - if so, use mock data instead of calling OpenAI
    const isDevelopment = process.env.NODE_ENV !== 'production';
    logger.info(`Current environment: ${process.env.NODE_ENV}, isDevelopment: ${isDevelopment}`);
    
    if (isDevelopment) {
      logger.info('Using mock data for maintenance plan in development mode');
      const mockResult = generateMockMaintenancePlan(home);
      
      // Save mock tasks within the transaction
      await Task.deleteMany({ home_id: home._id }, { session });
      await Task.insertMany(mockResult.tasks, { session });
      await updateTaskGenerationTimestamp(home.user_id);
      
      // Update user's onboarding status if in onboarding flow
      if (user.onboarding_status === 'HOME_CREATED' || user.onboarding_status === 'REGISTERED') {
        await User.findByIdAndUpdate(
          home.user_id,
          { onboarding_status: 'TASKS_GENERATED' },
          { session }
        );
      }
      
      // Only commit if we started our own transaction
      if (shouldManageTransaction) {
        await session.commitTransaction();
      }
      
      return {
        ...mockResult,
        message: 'New maintenance plan generated successfully'
      };
    }
    
    // If we're in production, proceed with AI-powered plan generation
    logger.info('In production mode, attempting AI-powered plan generation');
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured in production mode');
      throw new Error('OpenAI API key is required in production mode');
    }
    
    const aiPlan = await generateMaintenancePlanWithAI(home);
    
    // Convert AI-generated plan to our task format
    if (aiPlan && aiPlan.tasks && Array.isArray(aiPlan.tasks)) {
      generatedTasks = aiPlan.tasks.map(item => {
        // Map category to valid enum value
        let category = 'maintenance';
        if (item.category) {
          const categoryMap = {
            'hvac': 'maintenance',
            'plumbing': 'maintenance',
            'electrical': 'maintenance',
            'cleaning': 'cleaning',
            'safety': 'safety',
            'seasonal': 'seasonal',
            'repair': 'repair',
            'improvement': 'improvement'
          };
          category = categoryMap[item.category.toLowerCase()] || 'maintenance';
        }

        // Format steps as objects with step_number and description
        const steps = (item.subtasks || item.subTasks || []).map((step, index) => ({
          step_number: index + 1,
          description: typeof step === 'string' ? step : step.description || ''
        }));

        return {
          home_id: home._id,
          task_name: item.title || item.task,
          description: item.description || item.taskDescription || `Maintenance task: ${item.title || item.task}`,
          frequency: 'custom', // AI doesn't specify frequency directly
          due_date: item.due_date || item.suggestedCompletionDate,
          why: "AI-recommended maintenance task",
          estimated_time: parseEstimatedTime(item.estimated_time || item.estimatedTime),
          estimated_cost: item.estimated_cost || item.estimatedCost || 0,
          category: category,
          priority: item.priority || determinePriority(item.due_date || item.suggestedCompletionDate),
          steps: steps,
          completed: false,
          ai_generated: true
        };
      });
      
      // Delete existing tasks and save new ones within the transaction
      await Task.deleteMany({ home_id: home._id }, { session });
      await Task.insertMany(generatedTasks, { session });
      await updateTaskGenerationTimestamp(home.user_id);
      
      // Update user's onboarding status if in onboarding flow
      if (user.onboarding_status === 'HOME_CREATED' || user.onboarding_status === 'REGISTERED') {
        await User.findByIdAndUpdate(
          home.user_id,
          { onboarding_status: 'TASKS_GENERATED' },
          { session }
        );
      }
      
      // Only commit if we started our own transaction
      if (shouldManageTransaction) {
        await session.commitTransaction();
      }
      
      return {
        tasks: generatedTasks,
        message: 'AI-powered maintenance plan generated successfully',
        generated_at: aiPlan.generated_at || new Date().toISOString()
      };
    }
    
    // Original rule-based logic if AI generation failed or wasn't requested
    const { rules } = taskRules;
    
    // Delete existing tasks within the transaction
    await Task.deleteMany({ home_id: home._id }, { session });
    
    // Generate new tasks
    for (const rule of rules) {
      if (evaluateCondition(rule.condition, home)) {
        const dueDate = calculateDueDate(rule.task.frequency);
        
        const taskData = {
          home_id: home._id,
          task_name: rule.task.task_name,
          description: rule.task.description || `Maintenance task: ${rule.task.task_name}`,
          frequency: rule.task.frequency,
          due_date: dueDate,
          why: rule.task.why,
          estimated_time: rule.task.estimated_time || 30,
          estimated_cost: rule.task.estimated_cost || 0,
          category: rule.task.category || 'maintenance',
          priority: rule.task.priority || 'medium',
          steps: rule.task.steps || [],
          completed: false
        };
        
        generatedTasks.push(taskData);
      }
    }
    
    // Save all tasks within the transaction
    if (generatedTasks.length > 0) {
      await Task.insertMany(generatedTasks, { session });
      await updateTaskGenerationTimestamp(home.user_id);
      
      // Update user's onboarding status if in onboarding flow
      if (user.onboarding_status === 'HOME_CREATED' || user.onboarding_status === 'REGISTERED') {
        await User.findByIdAndUpdate(
          home.user_id,
          { onboarding_status: 'TASKS_GENERATED' },
          { session }
        );
      }
    }
    
    // Only commit if we started our own transaction
    if (shouldManageTransaction) {
      await session.commitTransaction();
    }
    
    return {
      tasks: generatedTasks,
      message: 'Rule-based maintenance plan generated successfully',
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    // Only abort if we started our own transaction
    if (shouldManageTransaction && session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error('Error generating maintenance plan:', error);
    throw error;
  } finally {
    // Only end session if we created it
    if (shouldManageTransaction) {
      session.endSession();
    }
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

/**
 * Generate mock maintenance tasks for development mode
 * @param {Object} home - The home object
 * @returns {Object} - Mock maintenance plan
 */
function generateMockMaintenancePlan(home) {
  const now = new Date();
  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(now.getMonth() + 1);
  
  const twoMonthsLater = new Date(now);
  twoMonthsLater.setMonth(now.getMonth() + 2);
  
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(now.getMonth() + 3);
  
  const mockTasks = [
    {
      home_id: home._id,
      task_name: "Inspect roof",
      description: "Check for damaged shingles, leaks, and clean gutters",
      frequency: "yearly",
      due_date: oneMonthLater.toISOString().split('T')[0],
      why: "Regular roof maintenance prevents water damage and extends roof life",
      estimated_time: 120, // 2 hours
      estimated_cost: 150,
      category: "exterior",
      priority: "medium",
      steps: [
        { step_number: 1, description: "Check shingles for damage" },
        { step_number: 2, description: "Look for signs of water damage" },
        { step_number: 3, description: "Clean gutters and downspouts" }
      ],
      completed: false,
      ai_generated: true
    },
    {
      home_id: home._id,
      task_name: "HVAC maintenance",
      description: "Service heating and cooling systems before seasonal use",
      frequency: "biannual",
      due_date: twoMonthsLater.toISOString().split('T')[0],
      why: "Regular HVAC maintenance improves efficiency and extends system life",
      estimated_time: 180, // 3 hours
      estimated_cost: 200,
      category: "hvac",
      priority: "high",
      steps: [
        { step_number: 1, description: "Replace air filters" },
        { step_number: 2, description: "Clean condenser coils" },
        { step_number: 3, description: "Check refrigerant levels" },
        { step_number: 4, description: "Test system operation" }
      ],
      completed: false,
      ai_generated: true
    },
    {
      home_id: home._id,
      task_name: "Check plumbing",
      description: "Inspect for leaks and water damage throughout the home",
      frequency: "quarterly",
      due_date: oneMonthLater.toISOString().split('T')[0],
      why: "Regular plumbing checks prevent water damage and mold growth",
      estimated_time: 60, // 1 hour
      estimated_cost: 100,
      category: "plumbing",
      priority: "medium",
      steps: [
        { step_number: 1, description: "Check under sinks for leaks" },
        { step_number: 2, description: "Inspect water heater" },
        { step_number: 3, description: "Test water pressure" },
        { step_number: 4, description: "Look for signs of water damage" }
      ],
      completed: false,
      ai_generated: true
    },
    {
      home_id: home._id,
      task_name: "Clean dryer vent",
      description: "Remove lint buildup to prevent fire hazards",
      frequency: "yearly",
      due_date: threeMonthsLater.toISOString().split('T')[0],
      why: "Lint buildup in dryer vents is a fire hazard",
      estimated_time: 60, // 1 hour
      estimated_cost: 80,
      category: "appliances",
      priority: "low",
      steps: [
        { step_number: 1, description: "Disconnect dryer from power" },
        { step_number: 2, description: "Disconnect vent from dryer" },
        { step_number: 3, description: "Clean vent pipe with brush" },
        { step_number: 4, description: "Check exterior vent opening" }
      ],
      completed: false,
      ai_generated: true
    },
    {
      home_id: home._id,
      task_name: "Test smoke detectors",
      description: "Ensure all smoke and carbon monoxide detectors are working",
      frequency: "monthly",
      due_date: oneMonthLater.toISOString().split('T')[0],
      why: "Functional smoke detectors are essential for home safety",
      estimated_time: 30, // 30 minutes
      estimated_cost: 30,
      category: "safety",
      priority: "high",
      steps: [
        { step_number: 1, description: "Test all detector units" },
        { step_number: 2, description: "Replace batteries if needed" },
        { step_number: 3, description: "Replace any faulty detectors" }
      ],
      completed: false,
      ai_generated: true
    }
  ];
  
  // Return the mock data without saving to database
  return {
    tasks: mockTasks,
    message: 'Mock maintenance plan generated for development',
    generated_at: new Date().toISOString()
  };
}

module.exports = {
  generateMaintenancePlan,
  regenerateTasksForHome,
  shouldGenerateTasks,
  updateTaskGenerationTimestamp
}; 