const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // More lenient in development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Only count failed requests
  message: { 
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.' 
  },
  handler: (req, res, next, options) => {
    console.log('Rate limit exceeded for IP:', req.ip);
    res.status(429).json(options.message);
  }
});

// Rate limiting for password reset attempts
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: { 
    status: 'error',
    message: 'Too many password reset attempts. Please try again after 1 hour.' 
  }
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account and sends a verification email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already in use
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[A-Z])(?=.*[0-9])/)
      .withMessage('Password must contain at least 1 uppercase letter and 1 number')
  ],
  authController.register
);

/**
 * @swagger
 * /api/auth/verify/{token}:
 *   get:
 *     summary: Verify user email
 *     description: Verifies a user's email address using the token sent via email
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get(
  '/verify/:token',
  [
    param('token')
      .isString()
      .withMessage('Token must be a string')
      .isLength({ min: 40, max: 40 })
      .withMessage('Invalid token format')
  ],
  authController.verifyEmail
);

/**
 * Handle OPTIONS requests for login route (CORS preflight)
 */
router.options('/login', (req, res) => {
  console.log('Handling OPTIONS request for /login');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).send();
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns an access token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified
 *       500:
 *         description: Server error
 */
router.post(
  '/login',
  // Temporarily bypass rate limiter for debugging
  // loginLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 1 })
      .withMessage('Password is required')
  ],
  (req, res, next) => {
    // Log the request details
    console.log('Login request received:', {
      body: req.body,
      headers: req.headers,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl
    });
    next();
  },
  authController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Uses a refresh token to generate a new access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post(
  '/refresh',
  authMiddleware.verifyRefreshToken,
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the refresh token and clears the cookie
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post(
  '/logout',
  authMiddleware.verifyToken,
  authController.logout
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email to the user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists)
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/forgot-password',
  passwordResetLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
  ],
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset password
 *     description: Resets a user's password using a token
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/reset-password/:token',
  [
    param('token')
      .isString()
      .withMessage('Token must be a string')
      .isLength({ min: 40, max: 40 })
      .withMessage('Invalid token format'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[A-Z])(?=.*[0-9])/)
      .withMessage('Password must contain at least 1 uppercase letter and 1 number')
  ],
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the currently authenticated user's information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get(
  '/me',
  authMiddleware.verifyToken,
  authController.getCurrentUser
);

/**
 * Test endpoint to verify connectivity
 */
router.get('/test', (req, res) => {
  console.log('Test endpoint hit from:', req.ip);
  res.status(200).json({
    status: 'success',
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    ip: req.ip
  });
});

/**
 * Direct login endpoint that bypasses all middleware
 * FOR DEBUGGING ONLY - REMOVE IN PRODUCTION
 */
router.post('/direct-login', (req, res) => {
  console.log('Direct login attempt:', {
    body: req.body,
    headers: req.headers,
    ip: req.ip
  });
  
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }
    
    // For testing purposes, accept any credentials
    const accessToken = 'direct_test_token_' + Date.now();
    
    // Return success response
    return res.status(200).json({
      status: 'success',
      message: 'Direct login successful',
      accessToken,
      user: {
        id: 'direct_test_user',
        email: email,
        subscription_status: 'active'
      }
    });
  } catch (error) {
    console.error('Direct login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during direct login'
    });
  }
});

module.exports = router; 