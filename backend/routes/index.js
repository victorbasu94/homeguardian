const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const homesRoutes = require('./homes');
const tasksRoutes = require('./tasks');
const subscriptionsRoutes = require('./subscriptions');
const vendorsRoutes = require('./vendors');
const maintenanceRoutes = require('./maintenance');
const userRoutes = require('./user');

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the status of the API
 *     responses:
 *       200:
 *         description: API is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: HomeGuardian Backend v1
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HomeGuardian Backend v1'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Mount authentication routes
router.use('/auth', authRoutes);

// Mount homes routes
router.use('/homes', homesRoutes);

// Mount tasks routes
router.use('/tasks', tasksRoutes);

// Mount subscriptions routes
router.use('/subscriptions', subscriptionsRoutes);

// Mount vendors routes
router.use('/vendors', vendorsRoutes);

// Mount maintenance routes
router.use('/maintenance', maintenanceRoutes);

// Mount user routes
router.use('/users', userRoutes);

module.exports = router; 