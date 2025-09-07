// models/DietPlan.js
const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled Diet Plan',
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
      default: 'Meal'
    },
    time: {
      type: String,
      default: ''
    },
    items: [{
      food: {
        type: String,
        default: 'Food item'
      },
      ingredients: {
        type: String,
        default: ''
      },
      quantity: {
        type: String,
        default: ''
      },
      calories: {
        type: Number,
        default: 0
      },
      protein: {
        type: Number,
        default: 0
      }
    }],
    instructions: {
      type: String,
      default: ''
    }
  }],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
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

// Pre-save middleware to calculate totals
dietPlanSchema.pre('save', function(next) {
  let totalCalories = 0;
  let totalProtein = 0;
  
  if (this.meals && this.meals.length > 0) {
    this.meals.forEach(meal => {
      if (meal.items && meal.items.length > 0) {
        meal.items.forEach(item => {
          totalCalories += item.calories || 0;
          totalProtein += item.protein || 0;
        });
      }
    });
  }
  
  this.totalCalories = totalCalories;
  this.totalProtein = Math.round(totalProtein * 10) / 10;
  next();
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);