const crypto = require('crypto');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  });
};

// Helper function to generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Helper function to set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  
  res.cookie('refreshToken', token, cookieOptions);
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'Email already in use'
      });
    }
    
    // Create new user with email_verified set to true
    const user = new User({
      email,
      password,
      email_verified: true // Set to true by default
    });
    
    // Save user to database
    await user.save();
    
    // Auto-login: Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token to database
    user.refresh_token = refreshToken;
    await user.save();
    
    // Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);
    
    // Return success response with access token
    res.status(201).json({
      status: 'success',
      message: 'Registration successful.',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        subscription_status: user.subscription_status
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during registration. Please try again.'
    });
  }
};

/**
 * Verify user email
 * @route GET /api/auth/verify/:token
 * @access Public
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with the verification token
    const user = await User.findOne({
      verification_token: token,
      verification_token_expiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }
    
    // Update user
    user.email_verified = true;
    user.verification_token = undefined;
    user.verification_token_expiry = undefined;
    
    await user.save();
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during email verification. Please try again.'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    console.log('Login controller called with body:', req.body);
    
    // Check if the request body is empty or missing required fields
    if (!req.body || !req.body.email || !req.body.password) {
      console.error('Missing required fields in request body');
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }
    
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      console.log('Incorrect password for user:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }
    
    // Always set email_verified to true
    if (!user.email_verified) {
      console.log(`Setting email_verified to true for user: ${email}`);
      user.email_verified = true;
      // No need to await this save, we can do it in the background
      user.save().catch(err => console.error('Error saving user:', err));
    }
    
    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    
    // Save refresh token to database
    user.refresh_token = refreshToken;
    await user.save();
    
    // Set refresh token as HttpOnly cookie
    setRefreshTokenCookie(res, refreshToken);
    
    console.log('Login successful for user:', email);
    
    // Return success response with access token
    return res.status(200).json({
      status: 'success',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        subscription_status: user.subscription_status
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during login. Please try again.'
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 * @access Public (with refresh token)
 */
exports.refreshToken = async (req, res) => {
  try {
    // User is already attached to req by verifyRefreshToken middleware
    const user = req.user;
    
    // Generate new access token
    const accessToken = generateToken(user._id);
    
    // Return success response with new access token
    res.status(200).json({
      status: 'success',
      accessToken
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during token refresh. Please log in again.'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
exports.logout = async (req, res) => {
  try {
    // Clear refresh token in database
    const user = req.user;
    user.refresh_token = undefined;
    await user.save();
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during logout. Please try again.'
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    // If user not found, still return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'If your email is registered, you will receive a password reset link'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token to user
    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    await user.save();
    
    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(user, resetToken);
    
    if (!emailSent) {
      logger.warn(`Failed to send password reset email to ${email}`);
    }
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred. Please try again.'
    });
  }
};

/**
 * Reset password
 * @route POST /api/auth/reset-password/:token
 * @access Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }
    
    const { token } = req.params;
    const { password } = req.body;
    
    // Find user with the reset token
    const user = await User.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      });
    }
    
    // Update password and clear reset token fields
    user.password = password;
    user.reset_token = undefined;
    user.reset_token_expiry = undefined;
    
    await user.save();
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Password reset successful. You can now log in with your new password.'
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during password reset. Please try again.'
    });
  }
};

/**
 * Get current user
 * @route GET /api/auth/me
 * @access Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by verifyToken middleware
    const user = req.user;
    
    // Return user data
    res.status(200).json({
      status: 'success',
      user: {
        id: user._id,
        email: user.email,
        subscription_status: user.subscription_status
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred. Please try again.'
    });
  }
};

/**
 * Update all users to have email_verified set to true
 * This function is called when the server starts
 */
exports.verifyAllEmails = async () => {
  try {
    // Find all users with email_verified set to false
    const users = await User.find({ email_verified: false });
    
    if (users.length === 0) {
      console.log('No users found with unverified emails');
      return;
    }
    
    console.log(`Found ${users.length} users with unverified emails`);
    
    // Update all users to have email_verified set to true
    const result = await User.updateMany(
      { email_verified: false },
      { $set: { email_verified: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to have verified emails`);
  } catch (error) {
    console.error('Error verifying all emails:', error);
  }
}; 