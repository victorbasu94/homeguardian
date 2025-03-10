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
    
    // Return the maintenance plan
    res.status(200).json({
      tasks: maintenancePlan.maintenancePlan,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating maintenance plan:', error);
    res.status(500).json({ error: 'Failed to generate maintenance plan' });
  }
});

module.exports = router; 