const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    images: {
      type: [String],
      default: [],
    },
    workerReply: {
      type: String,
      default: '',
      maxlength: 500,
    },
    workerRepliedAt: Date,
  },
  {
    timestamps: true,
  }
);

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ worker: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });

// After saving a review, update worker's rating
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { worker: this.worker } },
    {
      $group: {
        _id: '$worker',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    const Worker = mongoose.model('Worker');
    await Worker.findByIdAndUpdate(this.worker, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
