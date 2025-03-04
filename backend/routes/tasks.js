const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const sanitize = require('mongo-sanitize');
const { verifyToken } = require('../middleware/auth');
const Task = require('../models/Task');
const Home = require('../models/Home');
const logger = require('../utils/logger');

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
 *             properties:
 *               home_id:
 *                 type: string
 *               task_name:
 *                 type: string
 *               due_date:
 *                 type: string
 *                 format: date
 *               frequency:
 *                 type: string
 *               why:
 *                 type: string
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
    body('due_date')
      .optional()
      .isISO8601().withMessage('Due date must be a valid date')
      .toDate(),
    body('frequency')
      .optional()
      .isString().withMessage('Frequency must be a string')
      .trim(),
    body('why')
      .optional()
      .isString().withMessage('Why must be a string')
      .trim()
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
        due_date: req.body.due_date ? sanitize(req.body.due_date) : undefined,
        frequency: req.body.frequency ? sanitize(req.body.frequency) : undefined,
        why: req.body.why ? sanitize(req.body.why) : undefined
      };
      
      // Create new task
      const task = new Task(sanitizedInput);
      await task.save();
      
      // Return success response
      res.status(201).json({
        id: task._id,
        message: "Task created"
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

module.exports = router; 