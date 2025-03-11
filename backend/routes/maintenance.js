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
      user: req.user?.id,
      force: req.query.force
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

    // Force generation if explicitly requested via query param or if shouldGenerate is true
    const shouldGenerate = await maintenanceService.shouldGenerateTasks(req.user.id, req.body.id);
    const forceGeneration = req.query.force === 'true' || shouldGenerate;
    
    logger.info(`Generation decision - shouldGenerate: ${shouldGenerate}, forceGeneration: ${forceGeneration}`);
    
    // Use our maintenanceService to generate or retrieve the plan
    const result = await maintenanceService.generateMaintenancePlan(home, true, forceGeneration);
    
    // Return the maintenance plan
    return res.status(200).json(result);
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