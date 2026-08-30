const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: false,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    broadcastArea: {
      city: String,
      state: String,
      zip: String
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'on_the_way', 'started', 'completed', 'cancelled'],
      default: 'pending',
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required'],
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    images: {
      type: [String],
      default: [],
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    finalCost: {
      type: Number,
      default: 0,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'worker', 'admin', ''],
      default: '',
    },
    completedAt: Date,
    timeline: [
      {
        status: {
          type: String,
          enum: ['pending', 'accepted', 'on_the_way', 'started', 'completed', 'cancelled'],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
    isReviewed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ worker: 1, status: 1 });
bookingSchema.index({ status: 1, scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Add initial timeline entry on create
bookingSchema.pre('save', function (next) {
  if (this.isNew) {
    this.timeline.push({
      status: 'pending',
      timestamp: new Date(),
      note: 'Booking request created',
    });
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
