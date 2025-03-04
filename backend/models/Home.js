const mongoose = require('mongoose');

const HomeSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  year_built: { 
    type: Number, 
    required: true 
  },
  square_footage: { 
    type: Number, 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
  roof_type: String,
  hvac_type: String,
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for faster queries by user_id
HomeSchema.index({ user_id: 1 });

const Home = mongoose.model('Home', HomeSchema);

module.exports = Home; 