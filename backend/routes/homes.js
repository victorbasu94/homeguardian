const express = require('express');
const router = express.Router();
const { body, query, validationResult, param } = require('express-validator');
const sanitize = require('mongo-sanitize');
const { verifyToken } = require('../middleware/auth');
const Home = require('../models/Home');
const Task = require('../models/Task');
const User = require('../models/User');
const logger = require('../utils/logger');
const { generateMaintenancePlan } = require('../services/maintenanceService');
const mongoose = require('mongoose');

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
    body('name')
      .optional()
      .isString().withMessage('Name must be a string')
      .trim(),
    body('home_type')
      .notEmpty().withMessage('Home type is required')
      .isString().withMessage('Home type must be a string')
      .isIn(['single_family', 'apartment', 'townhouse', 'condo', 'mobile_home', 'other']).withMessage('Invalid home type'),
    body('number_of_stories')
      .isNumeric().withMessage('Number of stories must be a number')
      .isInt({ min: 1 }).withMessage('Number of stories must be at least 1'),
    body('roof_type')
      .notEmpty().withMessage('Roof type is required')
      .isString().withMessage('Roof type must be a string')
      .isIn(['asphalt_shingles', 'metal', 'tile', 'flat', 'slate', 'wood_shingles', 'other']).withMessage('Invalid roof type'),
    body('hvac_type')
      .notEmpty().withMessage('HVAC type is required')
      .isString().withMessage('HVAC type must be a string')
      .isIn(['central_hvac', 'radiator', 'window_ac', 'heat_pump', 'ductless_mini_split', 'boiler', 'other']).withMessage('Invalid HVAC type'),
    
    // Optional fields validation
    body('exterior_material')
      .optional()
      .isString().withMessage('Exterior material must be a string')
      .isIn(['brick', 'vinyl_siding', 'wood', 'stucco', 'fiber_cement', 'stone', 'aluminum', 'other']).withMessage('Invalid exterior material'),
    body('foundation_type')
      .optional()
      .isString().withMessage('Foundation type must be a string')
      .isIn(['slab', 'crawlspace', 'basement', 'pier_and_beam', 'other']).withMessage('Invalid foundation type'),
    body('windows.count')
      .optional()
      .isNumeric().withMessage('Window count must be a number')
      .isInt({ min: 0 }).withMessage('Window count must be a non-negative number'),
    body('windows.type')
      .optional()
      .isString().withMessage('Window type must be a string')
      .isIn(['single_pane', 'double_pane', 'triple_pane', 'other']).withMessage('Invalid window type'),
    body('windows.year_installed')
      .optional()
      .isNumeric().withMessage('Window installation year must be a number')
      .isInt({ min: 1800, max: new Date().getFullYear() }).withMessage(`Window installation year must be between 1800 and ${new Date().getFullYear()}`),
    body('plumbing.age')
      .optional()
      .isNumeric().withMessage('Plumbing age must be a number')
      .isInt({ min: 0 }).withMessage('Plumbing age must be a non-negative number'),
    body('plumbing.material')
      .optional()
      .isString().withMessage('Plumbing material must be a string')
      .isIn(['copper', 'pvc', 'pex', 'galvanized', 'cast_iron', 'other']).withMessage('Invalid plumbing material'),
    body('appliances')
      .optional()
      .isArray().withMessage('Appliances must be an array'),
    body('appliances.*.name')
      .optional()
      .isString().withMessage('Appliance name must be a string'),
    body('appliances.*.age')
      .optional()
      .isNumeric().withMessage('Appliance age must be a number')
      .isInt({ min: 0 }).withMessage('Appliance age must be a non-negative number'),
    body('yard_garden.exists')
      .optional()
      .isBoolean().withMessage('Yard/garden exists must be a boolean'),
    body('yard_garden.size')
      .optional()
      .isString().withMessage('Yard/garden size must be a string')
      .isIn(['small', 'medium', 'large']).withMessage('Invalid yard/garden size'),
    body('yard_garden.features')
      .optional()
      .isArray().withMessage('Yard/garden features must be an array'),
    body('garage.type')
      .optional()
      .isString().withMessage('Garage type must be a string')
      .isIn(['attached', 'detached', 'none']).withMessage('Invalid garage type'),
    body('garage.size')
      .optional()
      .isString().withMessage('Garage size must be a string')
      .isIn(['1_car', '2_car', '3_car', 'other']).withMessage('Invalid garage size'),
    body('recent_renovations')
      .optional()
      .isArray().withMessage('Recent renovations must be an array'),
    body('recent_renovations.*.type')
      .optional()
      .isString().withMessage('Renovation type must be a string'),
    body('recent_renovations.*.year')
      .optional()
      .isNumeric().withMessage('Renovation year must be a number')
      .isInt({ min: 1800, max: new Date().getFullYear() }).withMessage(`Renovation year must be between 1800 and ${new Date().getFullYear()}`),
    body('occupancy')
      .optional()
      .isString().withMessage('Occupancy must be a string')
      .isIn(['primary_residence', 'rental', 'vacation_home', 'other']).withMessage('Invalid occupancy type')
  ],
  async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Get user and check onboarding status
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Sanitize inputs
      const sanitizedInput = {
        year_built: sanitize(req.body.year_built),
        square_footage: sanitize(req.body.square_footage),
        location: sanitize(req.body.location),
        name: req.body.name ? sanitize(req.body.name) : undefined,
        home_type: sanitize(req.body.home_type),
        number_of_stories: sanitize(req.body.number_of_stories),
        roof_type: sanitize(req.body.roof_type),
        hvac_type: sanitize(req.body.hvac_type),
        user_id: req.user.id
      };

      // Add optional fields if provided
      if (req.body.exterior_material) sanitizedInput.exterior_material = sanitize(req.body.exterior_material);
      if (req.body.foundation_type) sanitizedInput.foundation_type = sanitize(req.body.foundation_type);
      
      // Handle nested objects
      if (req.body.windows) {
        sanitizedInput.windows = {};
        if (req.body.windows.count) sanitizedInput.windows.count = sanitize(req.body.windows.count);
        if (req.body.windows.type) sanitizedInput.windows.type = sanitize(req.body.windows.type);
        if (req.body.windows.year_installed) sanitizedInput.windows.year_installed = sanitize(req.body.windows.year_installed);
      }
      
      if (req.body.plumbing) {
        sanitizedInput.plumbing = {};
        if (req.body.plumbing.age) sanitizedInput.plumbing.age = sanitize(req.body.plumbing.age);
        if (req.body.plumbing.material) sanitizedInput.plumbing.material = sanitize(req.body.plumbing.material);
      }
      
      if (req.body.appliances && Array.isArray(req.body.appliances)) {
        sanitizedInput.appliances = req.body.appliances.map(appliance => ({
          name: sanitize(appliance.name),
          age: sanitize(appliance.age)
        }));
      }
      
      if (req.body.yard_garden) {
        sanitizedInput.yard_garden = {};
        if (req.body.yard_garden.exists !== undefined) sanitizedInput.yard_garden.exists = req.body.yard_garden.exists;
        if (req.body.yard_garden.size) sanitizedInput.yard_garden.size = sanitize(req.body.yard_garden.size);
        if (req.body.yard_garden.features && Array.isArray(req.body.yard_garden.features)) {
          sanitizedInput.yard_garden.features = req.body.yard_garden.features.map(feature => sanitize(feature));
        }
      }
      
      if (req.body.garage) {
        sanitizedInput.garage = {};
        if (req.body.garage.type) sanitizedInput.garage.type = sanitize(req.body.garage.type);
        if (req.body.garage.size) sanitizedInput.garage.size = sanitize(req.body.garage.size);
      }
      
      if (req.body.recent_renovations && Array.isArray(req.body.recent_renovations)) {
        sanitizedInput.recent_renovations = req.body.recent_renovations.map(renovation => ({
          type: sanitize(renovation.type),
          year: sanitize(renovation.year)
        }));
      }
      
      if (req.body.occupancy) sanitizedInput.occupancy = sanitize(req.body.occupancy);

      // Create new home within the transaction
      const home = new Home(sanitizedInput);
      await home.save({ session });

      // Update user's onboarding status to HOME_CREATED if they're still in REGISTERED state
      if (user.onboarding_status === 'REGISTERED') {
        await User.findByIdAndUpdate(
          req.user.id,
          { onboarding_status: 'HOME_CREATED' },
          { session }
        );
      }

      // Generate initial maintenance plan for the new home
      // Force generation since this is a new home
      const result = await generateMaintenancePlan(home, true, true);
      logger.info(`Generated initial maintenance plan for home ${home._id}`);

      // Update user's onboarding status to TASKS_GENERATED if tasks were created successfully
      if (result.tasks && result.tasks.length > 0) {
        await User.findByIdAndUpdate(
          req.user.id,
          { 
            onboarding_status: 'TASKS_GENERATED',
            last_tasks_generated_at: new Date()
          },
          { session }
        );
      }

      // Commit the transaction
      await session.commitTransaction();

      // Return success response with both home and tasks
      res.status(201).json({
        message: "Home created successfully with maintenance plan",
        data: {
          home: home,
          tasks: result.tasks
        }
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      logger.error('Error in home creation:', error);
      next(error);
    } finally {
      session.endSession();
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

/**
 * @swagger
 * /api/homes/{id}:
 *   put:
 *     summary: Update a home
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year_built:
 *                 type: number
 *               square_footage:
 *                 type: number
 *               location:
 *                 type: string
 *               name:
 *                 type: string
 *               home_type:
 *                 type: string
 *               number_of_stories:
 *                 type: number
 *               roof_type:
 *                 type: string
 *               hvac_type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Home updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - home does not belong to user
 *       404:
 *         description: Home not found
 */
router.put('/:id',
  verifyToken,
  [
    param('id')
      .isMongoId().withMessage('Invalid home ID format'),
    body('year_built')
      .optional()
      .isNumeric().withMessage('Year built must be a number')
      .isInt({ min: 1800, max: new Date().getFullYear() }).withMessage(`Year built must be between 1800 and ${new Date().getFullYear()}`),
    body('square_footage')
      .optional()
      .isNumeric().withMessage('Square footage must be a number')
      .isInt({ min: 1 }).withMessage('Square footage must be a positive number'),
    body('location')
      .optional()
      .isString().withMessage('Location must be a string')
      .trim(),
    body('name')
      .optional()
      .isString().withMessage('Name must be a string')
      .trim(),
    body('home_type')
      .optional()
      .isString().withMessage('Home type must be a string')
      .isIn(['single_family', 'apartment', 'townhouse', 'condo', 'mobile_home', 'other']).withMessage('Invalid home type'),
    body('number_of_stories')
      .optional()
      .isNumeric().withMessage('Number of stories must be a number')
      .isInt({ min: 1 }).withMessage('Number of stories must be at least 1'),
    body('roof_type')
      .optional()
      .isString().withMessage('Roof type must be a string')
      .isIn(['asphalt_shingles', 'metal', 'tile', 'flat', 'slate', 'wood_shingles', 'other']).withMessage('Invalid roof type'),
    body('hvac_type')
      .optional()
      .isString().withMessage('HVAC type must be a string')
      .isIn(['central_hvac', 'radiator', 'window_ac', 'heat_pump', 'ductless_mini_split', 'boiler', 'other']).withMessage('Invalid HVAC type'),
    
    // Optional fields validation
    body('exterior_material')
      .optional()
      .isString().withMessage('Exterior material must be a string')
      .isIn(['brick', 'vinyl_siding', 'wood', 'stucco', 'fiber_cement', 'stone', 'aluminum', 'other']).withMessage('Invalid exterior material'),
    body('foundation_type')
      .optional()
      .isString().withMessage('Foundation type must be a string')
      .isIn(['slab', 'crawlspace', 'basement', 'pier_and_beam', 'other']).withMessage('Invalid foundation type'),
    body('windows.count')
      .optional()
      .isNumeric().withMessage('Window count must be a number')
      .isInt({ min: 0 }).withMessage('Window count must be a non-negative number'),
    body('windows.type')
      .optional()
      .isString().withMessage('Window type must be a string')
      .isIn(['single_pane', 'double_pane', 'triple_pane', 'other']).withMessage('Invalid window type'),
    body('windows.year_installed')
      .optional()
      .isNumeric().withMessage('Window installation year must be a number')
      .isInt({ min: 1800, max: new Date().getFullYear() }).withMessage(`Window installation year must be between 1800 and ${new Date().getFullYear()}`),
    body('plumbing.age')
      .optional()
      .isNumeric().withMessage('Plumbing age must be a number')
      .isInt({ min: 0 }).withMessage('Plumbing age must be a non-negative number'),
    body('plumbing.material')
      .optional()
      .isString().withMessage('Plumbing material must be a string')
      .isIn(['copper', 'pvc', 'pex', 'galvanized', 'cast_iron', 'other']).withMessage('Invalid plumbing material'),
    body('appliances')
      .optional()
      .isArray().withMessage('Appliances must be an array'),
    body('yard_garden.exists')
      .optional()
      .isBoolean().withMessage('Yard/garden exists must be a boolean'),
    body('yard_garden.size')
      .optional()
      .isString().withMessage('Yard/garden size must be a string')
      .isIn(['small', 'medium', 'large']).withMessage('Invalid yard/garden size'),
    body('yard_garden.features')
      .optional()
      .isArray().withMessage('Yard/garden features must be an array'),
    body('garage.type')
      .optional()
      .isString().withMessage('Garage type must be a string')
      .isIn(['attached', 'detached', 'none']).withMessage('Invalid garage type'),
    body('garage.size')
      .optional()
      .isString().withMessage('Garage size must be a string')
      .isIn(['1_car', '2_car', '3_car', 'other']).withMessage('Invalid garage size'),
    body('recent_renovations')
      .optional()
      .isArray().withMessage('Recent renovations must be an array'),
    body('occupancy')
      .optional()
      .isString().withMessage('Occupancy must be a string')
      .isIn(['primary_residence', 'rental', 'vacation_home', 'other']).withMessage('Invalid occupancy type')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const homeId = sanitize(req.params.id);
      
      // Verify home exists and belongs to the authenticated user
      const home = await Home.findById(homeId);
      
      if (!home) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Prepare update object with sanitized inputs
      const updateData = {};
      
      // Basic fields
      if (req.body.year_built !== undefined) updateData.year_built = sanitize(req.body.year_built);
      if (req.body.square_footage !== undefined) updateData.square_footage = sanitize(req.body.square_footage);
      if (req.body.location !== undefined) updateData.location = sanitize(req.body.location);
      if (req.body.name !== undefined) updateData.name = sanitize(req.body.name);
      if (req.body.home_type !== undefined) updateData.home_type = sanitize(req.body.home_type);
      if (req.body.number_of_stories !== undefined) updateData.number_of_stories = sanitize(req.body.number_of_stories);
      if (req.body.roof_type !== undefined) updateData.roof_type = sanitize(req.body.roof_type);
      if (req.body.hvac_type !== undefined) updateData.hvac_type = sanitize(req.body.hvac_type);
      
      // Optional fields
      if (req.body.exterior_material !== undefined) updateData.exterior_material = sanitize(req.body.exterior_material);
      if (req.body.foundation_type !== undefined) updateData.foundation_type = sanitize(req.body.foundation_type);
      
      // Handle nested objects
      if (req.body.windows) {
        updateData.windows = {};
        if (req.body.windows.count !== undefined) updateData.windows.count = sanitize(req.body.windows.count);
        if (req.body.windows.type !== undefined) updateData.windows.type = sanitize(req.body.windows.type);
        if (req.body.windows.year_installed !== undefined) updateData.windows.year_installed = sanitize(req.body.windows.year_installed);
      }
      
      if (req.body.plumbing) {
        updateData.plumbing = {};
        if (req.body.plumbing.age !== undefined) updateData.plumbing.age = sanitize(req.body.plumbing.age);
        if (req.body.plumbing.material !== undefined) updateData.plumbing.material = sanitize(req.body.plumbing.material);
      }
      
      if (req.body.appliances !== undefined) {
        updateData.appliances = req.body.appliances.map(appliance => ({
          name: sanitize(appliance.name),
          age: sanitize(appliance.age)
        }));
      }
      
      if (req.body.yard_garden) {
        updateData.yard_garden = {};
        if (req.body.yard_garden.exists !== undefined) updateData.yard_garden.exists = req.body.yard_garden.exists;
        if (req.body.yard_garden.size !== undefined) updateData.yard_garden.size = sanitize(req.body.yard_garden.size);
        if (req.body.yard_garden.features !== undefined) {
          updateData.yard_garden.features = req.body.yard_garden.features.map(feature => sanitize(feature));
        }
      }
      
      if (req.body.garage) {
        updateData.garage = {};
        if (req.body.garage.type !== undefined) updateData.garage.type = sanitize(req.body.garage.type);
        if (req.body.garage.size !== undefined) updateData.garage.size = sanitize(req.body.garage.size);
      }
      
      if (req.body.recent_renovations !== undefined) {
        updateData.recent_renovations = req.body.recent_renovations.map(renovation => ({
          type: sanitize(renovation.type),
          year: sanitize(renovation.year)
        }));
      }
      
      if (req.body.occupancy !== undefined) updateData.occupancy = sanitize(req.body.occupancy);
      
      // Update home
      const updatedHome = await Home.findByIdAndUpdate(
        homeId,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      // Regenerate maintenance tasks based on updated home information
      const { regenerateTasksForHome } = require('../services/maintenanceService');
      await regenerateTasksForHome(updatedHome);
      
      // Return success response
      res.status(200).json({
        message: "Home updated successfully",
        data: updatedHome
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 