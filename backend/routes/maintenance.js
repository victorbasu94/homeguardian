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
    // Generate maintenance plan using OpenAI
    const maintenancePlan = await generateMaintenancePlanWithAI(req.body);
    
    // Return the maintenance plan directly since it's already in the correct format
    res.status(200).json(maintenancePlan);
  } catch (error) {
    logger.error('Error generating maintenance plan:', error);
    res.status(500).json({ 
      message: 'Failed to generate maintenance plan', 
      error: error.message 
    });
  }
});

module.exports = router; 