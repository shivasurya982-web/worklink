const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel',
    },
    userModel: {
      type: String,
      required: true,
      enum: ['Customer', 'Worker'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    subject: {
      type: String,
      required: [true, 'Complaint subject is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Service Issue',
        'Payment Problem',
        'Worker Conduct',
        'Customer Behavior',
        'App Bug',
        'Other',
      ],
      default: 'Service Issue',
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
    },
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'rejected'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
