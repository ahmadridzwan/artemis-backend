const mongoose = require('mongoose');

const UserBlockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blocks: [
    {
      blockId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PredefinedBlock',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
    },
  ],
  selectedType: { type: String, enum: ['single', 'grouped'], default: null }, // Tracks user selection mode
});

module.exports = mongoose.model('UserBlock', UserBlockSchema);
