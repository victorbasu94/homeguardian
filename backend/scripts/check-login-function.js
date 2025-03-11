require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Path to the auth controller
const authControllerPath = path.join(__dirname, '..', 'controllers', 'authController.js');

// Read the auth controller file
fs.readFile(authControllerPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading auth controller file:', err);
    process.exit(1);
  }
  
  // Check if the email verification check is present
  const hasVerificationCheck = data.includes('Please verify your email before logging in');
  
  console.log('Email verification check is present:', hasVerificationCheck);
  
  // Check if the auto-verification code is present
  const hasAutoVerification = data.includes('Auto-verifying email for user');
  
  console.log('Auto-verification code is present:', hasAutoVerification);
  
  // Print the login function
  const loginFunctionMatch = data.match(/exports\.login\s*=\s*async\s*\(req,\s*res\)\s*=>\s*{[\s\S]*?};/);
  
  if (loginFunctionMatch) {
    console.log('Login function:');
    console.log(loginFunctionMatch[0]);
  } else {
    console.log('Login function not found');
  }
  
  process.exit(0);
}); 