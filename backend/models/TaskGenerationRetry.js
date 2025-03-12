const mongoose = require('mongoose');

const TaskGenerationRetrySchema = new mongoose.Schema({
  home_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Home", 
    required: true, 
    index: true 
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date
  },
  error: {
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: {
    type: Date
  }
});

// Add index for finding pending retries
TaskGenerationRetrySchema.index({ status: 1, attempts: 1, createdAt: 1 });

const TaskGenerationRetry = mongoose.model('TaskGenerationRetry', TaskGenerationRetrySchema);

module.exports = TaskGenerationRetry; 