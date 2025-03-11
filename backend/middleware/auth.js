const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT access token
 * Extracts token from Authorization header and verifies it
 * Sets req.user if token is valid
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required. No token provided.' 
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required. Invalid token format.' 
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'The user belonging to this token no longer exists.' 
      });
    }
    
    // If email is not verified, verify it automatically
    if (!user.email_verified) {
      console.log(`Auto-verifying email for user: ${user.email}`);
      user.email_verified = true;
      await user.save();
    }
    
    // Set user on request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid token. Please log in again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Your token has expired. Please log in again.' 
      });
    }
    
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error during authentication.' 
    });
  }
};

/**
 * Middleware to verify refresh token
 * Extracts token from HttpOnly cookie and verifies it
 * Sets req.user if token is valid
 */
exports.verifyRefreshToken = async (req, res, next) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Refresh token not found. Please log in again.' 
      });
    }
    
    // Verify the token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find the user
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        message: 'The user belonging to this token no longer exists.' 
      });
    }
    
    // Check if the refresh token matches the one stored in the database
    if (user.refresh_token !== refreshToken) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid refresh token. Please log in again.' 
      });
    }
    
    // Set user on request object
    req.user = user;
    next();
  } catch (error) {
    logger.error('Refresh token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Invalid refresh token. Please log in again.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error',
        message: 'Your refresh token has expired. Please log in again.' 
      });
    }
    
    return res.status(500).json({ 
      status: 'error',
      message: 'Internal server error during refresh token verification.' 
    });
  }
}; 