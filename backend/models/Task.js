const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  home_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Home", 
    required: true, 
    index: true 
  },
  task_name: { 
    type: String, 
    required: true 
  },
  description: {
    type: String,
    required: true
  },
  due_date: Date,
  frequency: String,
  why: String,
  estimated_time: {
    type: Number, // in minutes
    required: false
  },
  estimated_cost: {
    type: Number,
    required: false
  },
  category: {
    type: String,
    enum: ['maintenance', 'cleaning', 'safety', 'seasonal', 'repair', 'improvement', 'other'],
    default: 'maintenance'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  steps: [{
    step_number: Number,
    description: String
  }],
  completed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task; 