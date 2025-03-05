const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const sanitize = require('mongo-sanitize');
const { verifyToken } = require('../middleware/auth');
const Task = require('../models/Task');
const Home = require('../models/Home');
const logger = require('../utils/logger');
const { generateMaintenancePlan } = require('../services/maintenanceService');
const { generateMaintenancePlanWithAI } = require('../services/openaiService');

/**
 * @swagger
 * /api/tasks/{homeId}:
 *   get:
 *     summary: Get all tasks for a specific home
 *     tags: [Tasks]
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
 *         description: List of tasks for the home
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - home does not belong to user
 *       404:
 *         description: Home not found
 */
router.get('/:homeId',
  verifyToken,
  [
    param('homeId')
      .isMongoId().withMessage('Invalid home ID format')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const homeId = sanitize(req.params.homeId);
      
      // Verify home exists and belongs to the authenticated user
      const home = await Home.findById(homeId);
      
      if (!home) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Fetch tasks for the home
      const tasks = await Task.find({ home_id: homeId }).sort({ due_date: 1 });
      
      // Return tasks
      res.status(200).json({ data: tasks });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task for a home
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - home_id
 *               - task_name
 *               - description
 *             properties:
 *               home_id:
 *                 type: string
 *               task_name:
 *                 type: string
 *               description:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               frequency:
 *                 type: string
 *               why:
 *                 type: string
 *               estimated_time:
 *                 type: number
 *               estimated_cost:
 *                 type: number
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - home does not belong to user
 *       404:
 *         description: Home not found
 */
router.post('/',
  verifyToken,
  [
    body('home_id')
      .isMongoId().withMessage('Invalid home ID format'),
    body('task_name')
      .notEmpty().withMessage('Task name is required')
      .isString().withMessage('Task name must be a string')
      .trim(),
    body('description')
      .notEmpty().withMessage('Description is required')
      .isString().withMessage('Description must be a string')
      .trim(),
    body('due_date')
      .optional()
      .isISO8601().withMessage('Due date must be a valid date in ISO 8601 format'),
    body('frequency')
      .optional()
      .isString().withMessage('Frequency must be a string')
      .trim(),
    body('why')
      .optional()
      .isString().withMessage('Why must be a string')
      .trim(),
    body('estimated_time')
      .optional()
      .isNumeric().withMessage('Estimated time must be a number')
      .isInt({ min: 0 }).withMessage('Estimated time must be a non-negative number'),
    body('estimated_cost')
      .optional()
      .isNumeric().withMessage('Estimated cost must be a number')
      .isFloat({ min: 0 }).withMessage('Estimated cost must be a non-negative number'),
    body('category')
      .optional()
      .isString().withMessage('Category must be a string')
      .isIn(['maintenance', 'cleaning', 'safety', 'seasonal', 'repair', 'improvement', 'other']).withMessage('Invalid category'),
    body('priority')
      .optional()
      .isString().withMessage('Priority must be a string')
      .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('steps')
      .optional()
      .isArray().withMessage('Steps must be an array'),
    body('steps.*.step_number')
      .optional()
      .isNumeric().withMessage('Step number must be a number')
      .isInt({ min: 1 }).withMessage('Step number must be a positive number'),
    body('steps.*.description')
      .optional()
      .isString().withMessage('Step description must be a string')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const homeId = sanitize(req.body.home_id);
      
      // Verify home exists and belongs to the authenticated user
      const home = await Home.findById(homeId);
      
      if (!home) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Sanitize inputs
      const sanitizedInput = {
        home_id: homeId,
        task_name: sanitize(req.body.task_name),
        description: sanitize(req.body.description),
        due_date: req.body.due_date ? sanitize(req.body.due_date) : undefined,
        frequency: req.body.frequency ? sanitize(req.body.frequency) : undefined,
        why: req.body.why ? sanitize(req.body.why) : undefined,
        estimated_time: req.body.estimated_time ? sanitize(req.body.estimated_time) : undefined,
        estimated_cost: req.body.estimated_cost ? sanitize(req.body.estimated_cost) : undefined,
        category: req.body.category ? sanitize(req.body.category) : undefined,
        priority: req.body.priority ? sanitize(req.body.priority) : undefined
      };
      
      // Handle steps array
      if (req.body.steps && Array.isArray(req.body.steps)) {
        sanitizedInput.steps = req.body.steps.map(step => ({
          step_number: sanitize(step.step_number),
          description: sanitize(step.description)
        }));
      }
      
      // Create new task
      const task = new Task(sanitizedInput);
      await task.save();
      
      // Return success response
      res.status(201).json({
        message: "Task created successfully",
        data: task
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/{taskId}:
 *   patch:
 *     summary: Update a task (completed status or due date)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *               due_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - task's home does not belong to user
 *       404:
 *         description: Task not found
 */
router.patch('/:taskId',
  verifyToken,
  [
    param('taskId')
      .isMongoId().withMessage('Invalid task ID format'),
    body('completed')
      .optional()
      .isBoolean().withMessage('Completed must be a boolean'),
    body('due_date')
      .optional()
      .isISO8601().withMessage('Due date must be a valid date')
      .toDate()
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const taskId = sanitize(req.params.taskId);
      
      // Find task
      const task = await Task.findById(taskId);
      
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
      
      // Verify the task's home belongs to the authenticated user
      const home = await Home.findById(task.home_id);
      
      if (!home) {
        return res.status(404).json({ error: "Home not found" });
      }
      
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Update fields
      if (req.body.completed !== undefined) {
        task.completed = sanitize(req.body.completed);
      }
      
      if (req.body.due_date !== undefined) {
        task.due_date = sanitize(req.body.due_date);
      }
      
      // Save changes
      await task.save();
      
      // Return success response
      res.status(200).json({
        message: "Task updated"
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/tasks/generate-ai-plan/{homeId}:
 *   post:
 *     summary: Generate a maintenance plan for a home using AI
 *     tags: [Tasks]
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
 *         description: AI-generated maintenance plan
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - home does not belong to user
 *       404:
 *         description: Home not found
 *       500:
 *         description: Server error
 */
router.post('/generate-ai-plan/:homeId',
  verifyToken,
  [
    param('homeId')
      .isMongoId().withMessage('Invalid home ID format')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const homeId = sanitize(req.params.homeId);
      
      // Check if home exists and belongs to user
      const home = await Home.findById(homeId);
      if (!home) {
        return res.status(404).json({ message: 'Home not found' });
      }
      
      if (home.user_id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You do not have permission to access this home' });
      }
      
      // Generate AI-powered maintenance plan
      const tasks = await generateMaintenancePlan(home, true);
      
      res.status(200).json({
        message: 'AI-powered maintenance plan generated successfully',
        tasks
      });
    } catch (error) {
      logger.error('Error generating AI maintenance plan:', error);
      res.status(500).json({ message: 'Failed to generate AI maintenance plan', error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/tasks/test-ai-plan:
 *   post:
 *     summary: Test AI maintenance plan generation with raw home details
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               homeDetails:
 *                 type: string
 *                 description: Description of the home (e.g., "A 2000 sq ft home built in 1990 in Seattle, WA")
 *     responses:
 *       200:
 *         description: AI-generated maintenance plan
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/test-ai-plan',
  verifyToken,
  [
    body('homeDetails')
      .isString().withMessage('Home details must be a string')
      .notEmpty().withMessage('Home details are required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const homeDetails = sanitize(req.body.homeDetails);
      
      // Generate AI-powered maintenance plan with raw home details
      const plan = await generateMaintenancePlanWithAI(homeDetails);
      
      res.status(200).json(plan);
    } catch (error) {
      logger.error('Error testing AI maintenance plan:', error);
      res.status(500).json({ message: 'Failed to generate test AI maintenance plan', error: error.message });
    }
  }
);

module.exports = router; 