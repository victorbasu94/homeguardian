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
  due_date: Date,
  frequency: String,
  why: String,
  completed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index for faster queries by home_id
TaskSchema.index({ home_id: 1 });

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task; 