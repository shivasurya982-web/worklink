const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      newCustomers: { type: Number, default: 0 },
      newWorkers: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      completedBookings: { type: Number, default: 0 },
      cancelledBookings: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      activeWorkers: { type: Number, default: 0 },
      activeCustomers: { type: Number, default: 0 },
    },
    categoryBreakdown: [
      {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        bookings: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ type: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
