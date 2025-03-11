require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  verifyAllEmails();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to verify all emails
async function verifyAllEmails() {
  try {
    // Find all users with email_verified set to false
    const users = await User.find({ email_verified: false });
    
    if (users.length === 0) {
      console.log('No users found with unverified emails');
      process.exit(0);
    }
    
    console.log(`Found ${users.length} users with unverified emails`);
    
    // Update all users to have email_verified set to true
    const result = await User.updateMany(
      { email_verified: false },
      { $set: { email_verified: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to have verified emails`);
    
    // Also update specific user if email is provided
    const email = process.argv[2];
    if (email) {
      const user = await User.findOne({ email });
      if (user) {
        user.email_verified = true;
        await user.save();
        console.log(`Verified email for user: ${email}`);
      } else {
        console.log(`User not found with email: ${email}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error verifying all emails:', error);
    process.exit(1);
  }
} 