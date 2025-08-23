// models/DietPlan.js
const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetAudience: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'muscle_building', 'maintenance', 'general'],
    default: 'general'
  },
  meals: [{
    name: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    items: [{
      food: String,
      quantity: String,
      calories: Number
    }],
    instructions: String
  }],
  totalCalories: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: '1 week'
  },
  notes: {
    type: String
  },
  pdfUrl: {
    type: String
  },
  cloudinaryPublicId: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
