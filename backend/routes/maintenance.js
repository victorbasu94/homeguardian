const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { generateMaintenancePlanWithAI } = require('../services/openaiService');
const logger = require('../utils/logger');
const maintenanceService = require('../services/maintenanceService');

// Timeout middleware for long-running operations
const extendedTimeout = (req, res, next) => {
  // Set timeout to 60 seconds
  req.setTimeout(60000);
  res.setTimeout(60000);
  next();
};

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
router.post('/generate-plan', verifyToken, extendedTimeout, async (req, res) => {
  try {
    logger.info('Received maintenance plan generation request:', {
      body: req.body,
      user: req.user?.id
    });

    // Log environment mode
    logger.info(`Running in ${process.env.NODE_ENV || 'development'} mode`);
    
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

    // Verify that the home belongs to the authenticated user
    let home;
    try {
      const Home = require('../models/Home');
      const homeId = req.body.id;
      
      // Convert string ID to MongoDB ObjectId if needed
      const mongoose = require('mongoose');
      const homeObjectId = mongoose.Types.ObjectId.isValid(homeId) 
        ? new mongoose.Types.ObjectId(homeId) 
        : homeId;
      
      // Find the home
      home = await Home.findById(homeObjectId);
      
      if (!home) {
        logger.warn(`Home not found: ${homeId}`);
        return res.status(404).json({
          message: 'Home not found',
          error: 'NOT_FOUND'
        });
      }
      
      // Verify that the home belongs to the authenticated user
      if (home.user_id.toString() !== req.user.id) {
        logger.warn(`Access denied: Home ${homeId} does not belong to user ${req.user.id}`);
        return res.status(403).json({
          message: 'Access denied',
          error: 'FORBIDDEN'
        });
      }
      
      logger.info(`Verified home ${homeId} belongs to user ${req.user.id}`);
    } catch (verifyError) {
      logger.error('Error verifying home ownership:', {
        error: verifyError.message,
        stack: verifyError.stack
      });
      return res.status(500).json({
        message: 'Error verifying home ownership',
        error: verifyError.message
      });
    }

    // Check if we should generate tasks based on the 3-month rule
    const shouldGenerate = await maintenanceService.shouldGenerateTasks(req.user.id, req.body.id);
    
    // If force=true is provided in the query, generate tasks regardless of the 3-month rule
    const forceGeneration = req.query.force === 'true' || !shouldGenerate;
    
    if (!shouldGenerate && !forceGeneration) {
      logger.info(`Skipping task generation for user ${req.user.id} - less than 3 months since last generation`);
      
      // Return existing tasks instead
      const Task = require('../models/Task');
      const existingTasks = await Task.find({ home_id: req.body.id });
      
      return res.status(200).json({
        tasks: existingTasks,
        message: 'Using existing maintenance plan (less than 3 months since last generation)',
        generated_at: new Date().toISOString()
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
      // We've already verified that the home belongs to the authenticated user above
      const deleteResult = await Task.deleteMany({ home_id: homeObjectId });
      logger.info(`Deleted ${deleteResult.deletedCount} existing tasks for home ${homeId} before generating new plan`);
    } catch (deleteError) {
      logger.warn('Error deleting existing tasks:', {
        error: deleteError.message,
        stack: deleteError.stack
      });
      // Continue with plan generation even if deletion fails
    }
    
    // Use our maintenanceService instead of directly calling OpenAI
    const result = await maintenanceService.generateMaintenancePlan(home, true, forceGeneration);
    
    logger.info('Successfully generated maintenance plan');
    
    // Return the maintenance plan
    res.status(200).json(result);
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