const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique customer-worker pair
favoriteSchema.index({ customer: 1, worker: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
