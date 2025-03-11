require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as a command line argument');
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  verifyUserEmail(email);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to verify a specific user's email
async function verifyUserEmail(email) {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      process.exit(1);
    }
    
    // Update the user to have email_verified set to true
    user.email_verified = true;
    await user.save();
    
    console.log(`Verified email for user: ${email}`);
    
    // Print user details
    console.log('User details:', {
      id: user._id,
      email: user.email,
      email_verified: user.email_verified,
      subscription_status: user.subscription_status
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying user email:', error);
    process.exit(1);
  }
} 