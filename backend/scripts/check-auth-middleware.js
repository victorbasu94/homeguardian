require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Path to the auth middleware
const authMiddlewarePath = path.join(__dirname, '..', 'middleware', 'auth.js');

// Read the auth middleware file
fs.readFile(authMiddlewarePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading auth middleware file:', err);
    process.exit(1);
  }
  
  // Check if the email verification check is present
  const hasVerificationCheck = data.includes('Please verify your email');
  
  console.log('Email verification check is present in middleware:', hasVerificationCheck);
  
  // Check if the auto-verification code is present
  const hasAutoVerification = data.includes('Auto-verifying email for user');
  
  console.log('Auto-verification code is present in middleware:', hasAutoVerification);
  
  process.exit(0);
}); 