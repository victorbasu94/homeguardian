const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Update all users to have email_verified set to true
      const result = await User.updateMany(
        {}, // Match all users
        { $set: { email_verified: true } }
      );
      
      console.log(`Updated ${result.modifiedCount} users to have email_verified set to true`);
      
      // Find any users that still have email_verified set to false
      const unverifiedUsers = await User.find({ email_verified: false });
      
      if (unverifiedUsers.length > 0) {
        console.log(`Found ${unverifiedUsers.length} users that still have email_verified set to false:`);
        unverifiedUsers.forEach(user => {
          console.log(`- ${user.email}`);
        });
      } else {
        console.log('All users now have email_verified set to true');
      }
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      // Disconnect from MongoDB
      mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }); 