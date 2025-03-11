/**
 * Script to set email_verified to true for all users in the PRODUCTION database
 * 
 * Usage: 
 * node scripts/verify-all-emails.js
 */

// Force NODE_ENV to production to use production database
process.env.NODE_ENV = 'production';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Production MongoDB URI - hardcoded for safety
const PRODUCTION_MONGODB_URI = 'mongodb+srv://victorbasu94:FY94esc4TbAstjeX@maintainmint.ae6pr.mongodb.net/?retryWrites=true&w=majority&appName=MaintainMint';

console.log('Starting script to verify all emails in PRODUCTION...');

// Connect to MongoDB using the production URI
mongoose.connect(PRODUCTION_MONGODB_URI)
  .then(() => {
    console.log('Connected to PRODUCTION MongoDB');
    verifyAllEmails();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to verify all users' emails
async function verifyAllEmails() {
  try {
    console.log('Starting email verification for all users in PRODUCTION...');
    
    // Find all users where email_verified is not true
    const users = await User.find({ email_verified: { $ne: true } });
    
    if (users.length === 0) {
      console.log('No users found with unverified emails in PRODUCTION.');
      process.exit(0);
    }
    
    console.log(`Found ${users.length} users with unverified emails in PRODUCTION.`);
    
    // Update all users to set email_verified to true
    const result = await User.updateMany(
      { email_verified: { $ne: true } },
      { 
        $set: { 
          email_verified: true 
        },
        $unset: { 
          verification_token: "",
          verification_token_expiry: ""
        }
      }
    );
    
    console.log(`Successfully verified ${result.modifiedCount} users' emails in PRODUCTION.`);
    
    // Log all verified users
    const verifiedUsers = await User.find({ email_verified: true });
    console.log(`Total verified users in PRODUCTION: ${verifiedUsers.length}`);
    
    // Log each verified user's email
    console.log('Verified users:');
    verifiedUsers.forEach(user => {
      console.log(`- ${user.email}`);
    });
    
    mongoose.connection.close();
    console.log('PRODUCTION database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error verifying all emails in PRODUCTION:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 