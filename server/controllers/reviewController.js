const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create a review for a worker
// @route   POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { worker: workerId, booking: bookingId, rating, comment } = req.body;

    if (!workerId || !bookingId) {
      return ApiResponse.badRequest(res, 'Worker ID and Booking ID are required');
    }

    if (!rating || rating < 1 || rating > 5) {
      return ApiResponse.badRequest(res, 'Rating must be a number between 1 and 5');
    }

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId).populate('customer', 'name');
    if (!booking) {
      return ApiResponse.notFound(res, 'Booking record not found');
    }

    if (booking.customer._id.toString() !== req.user._id.toString()) {
      return ApiResponse.forbidden(res, 'You can only review your own bookings');
    }

    if (booking.status !== 'completed') {
      return ApiResponse.badRequest(res, 'You can only rate a worker after the service is marked as completed');
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return ApiResponse.badRequest(res, 'You have already reviewed this booking');
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const review = await Review.create({
      customer: req.user._id,
      worker: workerId,
      booking: bookingId,
      rating: parseInt(rating),
      comment: comment || '',
      images,
    });

    // Mark booking as reviewed
    booking.isReviewed = true;
    await booking.save();

    // Notify worker about the new review
    Notification.create({
      recipient: workerId,
      recipientModel: 'Worker',
      type: 'review',
      title: 'New Review Received! ⭐',
      message: `Customer ${booking.customer.name} gave you a ${rating}-star rating: "${comment?.slice(0, 50)}${comment?.length > 50 ? '...' : ''}"`,
      link: `/worker/profile`,
      data: { reviewId: review._id, rating },
    }).catch(err => console.error('Review notification failed:', err.message));

    // The rating update for worker is handled in Review model's post-save hook

    const populatedReview = await Review.findById(review._id).populate('customer', 'name avatar');

    ApiResponse.created(res, populatedReview, 'Review submitted successfully!');
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific worker
// @route   GET /api/reviews/worker/:workerId
exports.getWorkerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, reviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Worker reply to a review
// @route   POST /api/reviews/:id/reply
exports.replyToReview = async (req, res, next) => {
  try {
    const { reply } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return ApiResponse.notFound(res, 'Review not found');
    }

    if (review.worker.toString() !== req.user._id.toString()) {
      return ApiResponse.forbidden(res, 'You can only reply to reviews on your profile');
    }

    review.workerReply = reply;
    review.workerRepliedAt = new Date();
    await review.save();

    ApiResponse.success(res, review, 'Reply posted successfully');
  } catch (error) {
    next(error);
  }
};
