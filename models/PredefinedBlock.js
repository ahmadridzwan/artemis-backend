const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const PredefinedBlockSchema = new mongoose.Schema({
  uuid: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  }, // File path or URL reference
  type: {
    type: String,
    enum: ['single', 'grouped'],
    required: true,
  },
});

module.exports = mongoose.model('PredefinedBlock', PredefinedBlockSchema);
