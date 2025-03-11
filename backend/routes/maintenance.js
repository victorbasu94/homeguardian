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
router.post('/generate-plan', verifyToken, async (req, res) => {
  try {
    logger.info('Received maintenance plan generation request:', {
      body: req.body,
      user: req.user?.id
    });

    // Validate required fields
    const requiredFields = ['id', 'location', 'year_built', 'square_footage'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      logger.warn('Missing required fields:', { missingFields });
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: 'VALIDATION_ERROR'
      });
    }

    // Generate maintenance plan using OpenAI
    logger.info('Calling OpenAI service with home details');
    
    // First, delete any existing tasks for this home to avoid duplicates or old data
    try {
      const Task = require('../models/Task');
      const homeId = req.body.id;
      
      // Convert string ID to MongoDB ObjectId if needed
      const mongoose = require('mongoose');
      const homeObjectId = mongoose.Types.ObjectId.isValid(homeId) 
        ? new mongoose.Types.ObjectId(homeId) 
        : homeId;
      
      // Delete all existing tasks for this home
      const deleteResult = await Task.deleteMany({ home_id: homeObjectId });
      logger.info(`Deleted ${deleteResult.deletedCount} existing tasks for home ${homeId} before generating new plan`);
    } catch (deleteError) {
      logger.warn('Error deleting existing tasks:', {
        error: deleteError.message,
        stack: deleteError.stack
      });
      // Continue with plan generation even if deletion fails
    }
    
    const maintenancePlan = await generateMaintenancePlanWithAI(req.body);
    
    logger.info('Successfully generated maintenance plan');
    
    // Return the maintenance plan directly since it's already in the correct format
    res.status(200).json(maintenancePlan);
  } catch (error) {
    logger.error('Error generating maintenance plan:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    
    res.status(500).json({ 
      message: 'Failed to generate maintenance plan', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 