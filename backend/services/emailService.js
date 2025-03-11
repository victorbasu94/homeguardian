const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create a transporter object
const createTransporter = async () => {
  // For production, use OAuth2 with Gmail or other email service
  // For development, we can use a test account or a simple SMTP configuration
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
      }
    });
  } else {
    // For development, use a simpler configuration
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

// Export the createTransporter function
exports.createTransporter = createTransporter;

/**
 * Send password reset email to user
 * @param {Object} user - User object
 * @param {string} resetToken - Token for password reset
 * @returns {Promise<boolean>} - True if email sent successfully
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = await createTransporter();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Email options
    const mailOptions = {
      from: `"HomeGuardian" <${process.env.EMAIL_FROM || 'noreply@homeguardian.com'}>`,
      to: user.email,
      subject: 'HomeGuardian - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Password Reset Request</h2>
          <p>You are receiving this email because you (or someone else) has requested to reset the password for your HomeGuardian account.</p>
          <p>Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
          <p>${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: 1px solid #f0f0f0; margin: 20px 0;">
          <p style="color: #777; font-size: 12px;">HomeGuardian - Secure your home with confidence</p>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${user.email}`);
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return false;
  }
}; 