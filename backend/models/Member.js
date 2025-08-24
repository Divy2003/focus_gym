// models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  endingDate: {
    type: Date,
    
  },
  month: {
    type: Number,
    required: true,
    min: 1
  },
  fees: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'expired'],
    default: function() {
      return this.fees > 0 ? 'approved' : 'pending';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto calculate ending date
memberSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('joiningDate') || this.isModified('month')) {
    const endDate = new Date(this.joiningDate);
    endDate.setMonth(endDate.getMonth() + this.month);
    this.endingDate = endDate;
  }
  
  // Auto set status based on fees
  if (this.isModified('fees')) {
    this.status = this.fees > 0 ? 'approved' : 'pending';
  }
  
  next();
});

// Index for search
memberSchema.index({ name: 'text', mobile: 'text' });

module.exports = mongoose.model('Member', memberSchema);
