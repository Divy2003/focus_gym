// models/Transformation.js
const mongoose = require('mongoose');

const transformationItemSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  duration: { type: String, default: '' },
  weightLost: { type: String, default: '' },
  beforeImage: { type: String, required: true }, // Cloudinary URL
  afterImage: { type: String, required: true },  // Cloudinary URL
}, { _id: false });

const transformationSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true }, // e.g., 'home'
  transformations: {
    type: [transformationItemSchema],
    validate: [arr => arr.length <= 3, 'Maximum of 3 transformations allowed']
  }
}, { timestamps: true });

module.exports = mongoose.model('Transformation', transformationSchema);
