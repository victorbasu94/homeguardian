const mongoose = require('mongoose');

const HomeSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    index: true 
  },
  name: {
    type: String,
    required: false
  },
  // Mandatory fields
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
  home_type: {
    type: String,
    required: true,
    enum: ['single_family', 'apartment', 'townhouse', 'condo', 'mobile_home', 'other']
  },
  number_of_stories: {
    type: Number,
    required: true
  },
  roof_type: {
    type: String,
    required: true,
    enum: ['asphalt_shingles', 'metal', 'tile', 'flat', 'slate', 'wood_shingles', 'other']
  },
  hvac_type: {
    type: String,
    required: true,
    enum: ['central_hvac', 'radiator', 'window_ac', 'heat_pump', 'ductless_mini_split', 'boiler', 'other']
  },
  
  // Optional fields
  exterior_material: {
    type: String,
    enum: ['brick', 'vinyl_siding', 'wood', 'stucco', 'fiber_cement', 'stone', 'aluminum', 'other'],
    required: false
  },
  foundation_type: {
    type: String,
    enum: ['slab', 'crawlspace', 'basement', 'pier_and_beam', 'other'],
    required: false
  },
  windows: {
    count: Number,
    type: {
      type: String,
      enum: ['single_pane', 'double_pane', 'triple_pane', 'other']
    },
    year_installed: Number
  },
  plumbing: {
    age: Number,
    material: {
      type: String,
      enum: ['copper', 'pvc', 'pex', 'galvanized', 'cast_iron', 'other']
    }
  },
  appliances: [{
    name: String,
    age: Number
  }],
  yard_garden: {
    exists: Boolean,
    size: {
      type: String,
      enum: ['small', 'medium', 'large']
    },
    features: [String]
  },
  garage: {
    type: {
      type: String,
      enum: ['attached', 'detached', 'none']
    },
    size: {
      type: String,
      enum: ['1_car', '2_car', '3_car', 'other']
    }
  },
  recent_renovations: [{
    type: String,
    year: Number
  }],
  occupancy: {
    type: String,
    enum: ['primary_residence', 'rental', 'vacation_home', 'other'],
    required: false
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Home = mongoose.model('Home', HomeSchema);

module.exports = Home; 