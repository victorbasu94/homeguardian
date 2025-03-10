const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { generateMaintenancePlanWithAI } = require('../services/openaiService');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/maintenance/generate-plan:
 *   post:
 *     summary: Generate a maintenance plan for a home using AI
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - location
 *               - year_built
 *               - square_footage
 *     responses:
 *       200:
 *         description: Maintenance plan generated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/generate-plan', verifyToken, async (req, res, next) => {
  try {
    const homeDetails = req.body;
    
    // Validate required fields
    if (!homeDetails.id || !homeDetails.location || !homeDetails.year_built || !homeDetails.square_footage) {
      return res.status(400).json({ error: 'Missing required home details' });
    }
    
    // Format home details for the AI service
    const formattedHomeDetails = {
      address: { city: homeDetails.location.split(',')[0], state: homeDetails.location.split(',')[1]?.trim() },
      size: { totalSquareFeet: homeDetails.square_footage },
      yearBuilt: homeDetails.year_built,
      propertyType: 'residential',
      features: {
        roofType: homeDetails.roof_type,
        heatingSystem: homeDetails.hvac_type,
        coolingSystem: homeDetails.hvac_type
      }
    };
    
    // Generate maintenance plan using OpenAI
    const maintenancePlan = await generateMaintenancePlanWithAI(formattedHomeDetails);
    
    // Format the response to match what the frontend expects
    const formattedTasks = maintenancePlan.maintenancePlan.map(task => {
      // Determine category based on task content or use provided category
      let category = 'general';
      
      // Try to extract category from task data if available
      if (task.category) {
        category = task.category;
      } else {
        // Infer category from task name/description if not explicitly provided
        const taskText = (task.task + ' ' + task.taskDescription).toLowerCase();
        
        if (taskText.includes('roof') || taskText.includes('gutter') || taskText.includes('siding') || taskText.includes('exterior')) {
          category = 'exterior';
        } else if (taskText.includes('hvac') || taskText.includes('heating') || taskText.includes('cooling') || taskText.includes('air conditioning')) {
          category = 'hvac';
        } else if (taskText.includes('plumbing') || taskText.includes('water') || taskText.includes('leak') || taskText.includes('pipe')) {
          category = 'plumbing';
        } else if (taskText.includes('electric') || taskText.includes('wiring') || taskText.includes('circuit')) {
          category = 'electrical';
        } else if (taskText.includes('appliance') || taskText.includes('kitchen')) {
          category = 'appliances';
        } else if (taskText.includes('yard') || taskText.includes('lawn') || taskText.includes('garden') || taskText.includes('landscape')) {
          category = 'landscaping';
        } else if (taskText.includes('clean') || taskText.includes('dust') || taskText.includes('vacuum')) {
          category = 'cleaning';
        } else if (taskText.includes('safety') || taskText.includes('security') || taskText.includes('detector') || taskText.includes('alarm')) {
          category = 'safety';
        }
      }
      
      return {
        title: task.task,
        description: task.taskDescription,
        due_date: task.suggestedCompletionDate,
        category: category,
        estimated_time: task.estimatedTime,
        estimated_cost: task.estimatedCost,
        subtasks: task.subTasks || []
      };
    });
    
    // Return the formatted maintenance plan
    res.status(200).json({
      tasks: formattedTasks,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating maintenance plan:', error);
    res.status(500).json({ error: 'Failed to generate maintenance plan' });
  }
});

module.exports = router; 