const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const sanitize = require('mongo-sanitize');
const { verifyToken } = require('../middleware/auth');
const Home = require('../models/Home');
const Task = require('../models/Task');
const logger = require('../utils/logger');
const { generateMaintenancePlan } = require('../services/maintenanceService');

/**
 * @swagger
 * /api/homes:
 *   post:
 *     summary: Create a new home
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year_built
 *               - square_footage
 *               - location
 *             properties:
 *               year_built:
 *                 type: number
 *               square_footage:
 *                 type: number
 *               location:
 *                 type: string
 *               roof_type:
 *                 type: string
 *               hvac_type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Home created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', 
  verifyToken,
  [
    body('year_built')
      .isNumeric().withMessage('Year built must be a number')
      .isInt({ min: 1800, max: new Date().getFullYear() }).withMessage(`Year built must be between 1800 and ${new Date().getFullYear()}`),
    body('square_footage')
      .isNumeric().withMessage('Square footage must be a number')
      .isInt({ min: 1 }).withMessage('Square footage must be a positive number'),
    body('location')
      .notEmpty().withMessage('Location is required')
      .isString().withMessage('Location must be a string')
      .trim(),
    body('roof_type')
      .optional()
      .isString().withMessage('Roof type must be a string')
      .trim(),
    body('hvac_type')
      .optional()
      .isString().withMessage('HVAC type must be a string')
      .trim()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Sanitize inputs
      const sanitizedInput = {
        year_built: sanitize(req.body.year_built),
        square_footage: sanitize(req.body.square_footage),
        location: sanitize(req.body.location),
        roof_type: req.body.roof_type ? sanitize(req.body.roof_type) : undefined,
        hvac_type: req.body.hvac_type ? sanitize(req.body.hvac_type) : undefined,
        user_id: req.user.id // Set from authenticated user
      };

      // Create new home
      const home = new Home(sanitizedInput);
      await home.save();

      // Generate maintenance plan for the new home
      await generateMaintenancePlan(home);

      // Return success response
      res.status(201).json({
        id: home._id,
        message: "Home created with maintenance plan"
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/homes:
 *   get:
 *     summary: Get all homes for the authenticated user
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of homes
 *       401:
 *         description: Unauthorized
 */
router.get('/',
  verifyToken,
  [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer')
      .toInt(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
      .toInt()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Query homes for the authenticated user
      const total = await Home.countDocuments({ user_id: req.user.id });
      const homes = await Home.find({ user_id: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Calculate total pages
      const pages = Math.ceil(total / limit);

      // Return paginated results
      res.status(200).json({
        data: homes,
        total,
        page,
        pages
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/homes/{id}:
 *   get:
 *     summary: Get a specific home by ID
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Home ID
 *     responses:
 *       200:
 *         description: Home details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - home does not belong to user
 *       404:
 *         description: Home not found
 */
router.get('/:id',
  verifyToken,
  async (req, res, next) => {
    try {
      const homeId = sanitize(req.params.id);
      
      // Find home
      const home = await Home.findById(homeId);
      
      // Check if home exists
      if (!home) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      // Check if home belongs to authenticated user
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Return home details
      res.status(200).json({ data: home });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/homes/{homeId}/health:
 *   get:
 *     summary: Get health score for a specific home
 *     tags: [Homes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: homeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Home ID
 *     responses:
 *       200:
 *         description: Health score for the home
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - home does not belong to user
 *       404:
 *         description: Home not found
 */
router.get('/:homeId/health',
  verifyToken,
  async (req, res, next) => {
    try {
      const homeId = sanitize(req.params.homeId);
      
      // Verify home exists and belongs to the authenticated user
      const home = await Home.findById(homeId);
      
      if (!home) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get all tasks for the home
      const tasks = await Task.find({ home_id: homeId });
      
      // Calculate health score
      let score = 0;
      
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.completed).length;
        score = Math.round((completedTasks / tasks.length) * 100);
      }
      
      // Return health score
      res.status(200).json({ score });
    } catch (error) {
      logger.error('Error calculating health score:', error);
      next(error);
    }
  }
);

module.exports = router; 