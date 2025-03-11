/**
 * Script to list all verified users in the PRODUCTION database
 * 
 * Usage: 
 * node scripts/list-verified-users.js
 */

// Force NODE_ENV to production to use production database
process.env.NODE_ENV = 'production';

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Production MongoDB URI - hardcoded for safety
const PRODUCTION_MONGODB_URI = 'mongodb+srv://victorbasu94:FY94esc4TbAstjeX@maintainmint.ae6pr.mongodb.net/?retryWrites=true&w=majority&appName=MaintainMint';

console.log('Starting script to list all verified users in PRODUCTION...');

// Connect to MongoDB using the production URI
mongoose.connect(PRODUCTION_MONGODB_URI)
  .then(() => {
    console.log('Connected to PRODUCTION MongoDB');
    listVerifiedUsers();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to list all verified users
async function listVerifiedUsers() {
  try {
    console.log('Retrieving all verified users from PRODUCTION...');
    
    // Find all users where email_verified is true
    const verifiedUsers = await User.find({ email_verified: true });
    
    if (verifiedUsers.length === 0) {
      console.log('No verified users found in PRODUCTION.');
      process.exit(0);
    }
    
    console.log(`Found ${verifiedUsers.length} verified users in PRODUCTION.`);
    
    // Log each verified user's email and creation date
    console.log('Verified users:');
    verifiedUsers.forEach(user => {
      const createdAt = user.created_at || user.createdAt || 'Unknown';
      console.log(`- ${user.email} (Created: ${createdAt})`);
    });
    
    // Also find any unverified users
    const unverifiedUsers = await User.find({ email_verified: { $ne: true } });
    
    if (unverifiedUsers.length > 0) {
      console.log(`\nFound ${unverifiedUsers.length} UNVERIFIED users in PRODUCTION:`);
      unverifiedUsers.forEach(user => {
        const createdAt = user.created_at || user.createdAt || 'Unknown';
        console.log(`- ${user.email} (Created: ${createdAt})`);
      });
    } else {
      console.log('\nAll users are verified!');
    }
    
    mongoose.connection.close();
    console.log('PRODUCTION database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error listing verified users in PRODUCTION:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 