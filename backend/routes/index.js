const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

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

// Mount authentication routes
router.use('/api/auth', authRoutes);

module.exports = router; 