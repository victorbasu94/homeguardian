const express = require('express');
const router = express.Router();

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

module.exports = router; 