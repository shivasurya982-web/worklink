const Booking = require('../models/Booking');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const EmailService = require('../services/emailService');
const ApiResponse = require('../utils/apiResponse');
const { parsePaginationParams, getPagination } = require('../utils/helpers');
const mongoose = require('mongoose');

// @desc    Create a new booking request
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
  try {
    const {
      worker: workerId,
      category,
      bookingType,
      scheduledDate,
      endDate,
      scheduledTime,
      workingHours,
      address,
      description,
      estimatedCost,
    } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return ApiResponse.badRequest(res, 'Selected worker was not found');
    }

    // Check worker availability
    if (!worker.isAvailable) {
      return ApiResponse.badRequest(res, 'Worker is currently off-duty and not accepting new bookings');
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    // Safely resolve category ID if valid
    const mongoose = require('mongoose');
    let bookingCategory = category || worker.category;
    if (!bookingCategory || !mongoose.Types.ObjectId.isValid(bookingCategory)) {
      bookingCategory = undefined;
    }

    const booking = await Booking.create({
      customer: req.user._id,
      worker: workerId,
      category: bookingCategory,
      bookingType: bookingType || 'small',
      scheduledDate: scheduledDate || new Date(),
      endDate: bookingType === 'large' ? endDate : undefined,
      scheduledTime: scheduledTime || '10:00',
      workingHours: workingHours || '',
      address: address
        ? typeof address === 'string'
          ? JSON.parse(address)
          : address
        : {
            street: req.user.address?.street || 'No street provided',
            city: req.user.address?.city || 'No city provided',
            state: req.user.address?.state || 'No state provided',
            zip: req.user.address?.zip || '000000',
          },
      description: description || 'Service booking request',
      images,
      estimatedCost: estimatedCost || worker.pricing?.hourly || worker.pricing?.minimum || 350,
      status: 'pending',
    });

    // Notify worker (non-blocking for faster response)
    Notification.create({
      recipient: worker._id,
      recipientModel: 'Worker',
      type: 'booking',
      title: 'New Booking Request',
      message: `You have received a new service request for ${scheduledDate || 'upcoming date'}`,
      link: `/worker/bookings`,
      data: { bookingId: booking._id },
    }).catch(err => console.error('Notification creation failed:', err.message));

    EmailService.sendBookingNotification(booking, worker.email, worker.name, 'pending')
      .catch(err => console.error('Email send failed:', err.message));

    ApiResponse.created(res, { booking }, 'Booking request sent successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone avatar address')
      .populate('worker', 'name email phone whatsapp avatar profession rating address pricing')
      .populate('category', 'name icon');

    if (!booking) {
      return ApiResponse.notFound(res, 'Booking not found');
    }

    // Check authorization
    const isCustomer = booking.customer._id.toString() === req.user._id.toString();
    const isWorker = booking.worker._id.toString() === req.user._id.toString();
    const isAdmin = req.userRole === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return ApiResponse.forbidden(res, 'Not authorized to view this booking');
    }

    ApiResponse.success(res, { booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for logged in user (customer or worker)
// @route   GET /api/bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status } = req.query;

    const query = {};
    if (req.userRole === 'customer') {
      query.customer = req.user._id;
    } else if (req.userRole === 'worker') {
      query.worker = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customer', 'name email phone avatar address')
        .populate('worker', 'name email phone whatsapp avatar profession rating address pricing')
        .populate('category', 'name icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(query),
    ]);

    ApiResponse.paginated(res, bookings, getPagination(page, limit, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (accept, on_the_way, start, complete)
// @route   PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, finalCost, note } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return ApiResponse.notFound(res, 'Booking not found');
    }

    // Only worker or admin can update status (except cancellation which customer can also do)
    const isWorker = booking.worker.toString() === req.user._id.toString();
    const isAdmin = req.userRole === 'admin';

    if (!isWorker && !isAdmin) {
      return ApiResponse.forbidden(res, 'Only the assigned worker or admin can update status');
    }

    const validStatuses = ['accepted', 'on_the_way', 'started', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return ApiResponse.badRequest(res, 'Invalid status transition');
    }

    booking.status = status;
    if (finalCost !== undefined) booking.finalCost = finalCost;
    if (status === 'completed') {
      booking.completedAt = new Date();
      // Increment worker completed jobs & earnings
      await Worker.findByIdAndUpdate(booking.worker, {
        $inc: { completedJobs: 1, totalEarnings: finalCost || booking.estimatedCost },
      });
    }

    booking.timeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    await booking.save();

    // Notify customer (non-blocking)
    const customer = await Customer.findById(booking.customer);
    if (customer) {
      Notification.create({
        recipient: customer._id,
        recipientModel: 'Customer',
        type: 'booking',
        title: `Booking ${status.toUpperCase().replace(/_/g, ' ')}`,
        message: `Your booking status has been updated to ${status.replace(/_/g, ' ')}`,
        link: `/customer/bookings`,
      }).catch(err => console.error('Notification creation failed:', err.message));

      EmailService.sendBookingNotification(booking, customer.email, customer.name, status)
        .catch(err => console.error('Email send failed:', err.message));
    }

    ApiResponse.success(res, { booking }, `Booking status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return ApiResponse.notFound(res, 'Booking not found');
    }

    if (['completed', 'cancelled'].includes(booking.status)) {
      return ApiResponse.badRequest(res, `Cannot cancel a booking that is already ${booking.status}`);
    }

    booking.status = 'cancelled';
    booking.cancelledBy = req.userRole;
    booking.cancellationReason = reason || 'Cancelled by user';
    booking.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled by ${req.userRole}: ${reason || 'No reason provided'}`,
    });

    await booking.save();

    // Notify other party (non-blocking)
    const recipientId = req.userRole === 'customer' ? booking.worker : booking.customer;
    const recipientModel = req.userRole === 'customer' ? 'Worker' : 'Customer';

    Notification.create({
      recipient: recipientId,
      recipientModel,
      type: 'booking',
      title: 'Booking Cancelled',
      message: `Booking #${booking._id.toString().slice(-6)} was cancelled by the ${req.userRole}`,
      link: req.userRole === 'customer' ? `/worker/bookings` : `/customer/bookings`,
    }).catch(err => console.error('Notification creation failed:', err.message));

    ApiResponse.success(res, { booking }, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking (soft delete or remove from user view)
// @route   DELETE /api/bookings/:id
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return ApiResponse.notFound(res, 'Booking not found');
    }

    // Check authorization
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isWorker = booking.worker.toString() === req.user._id.toString();
    const isAdmin = req.userRole === 'admin';

    if (!isCustomer && !isWorker && !isAdmin) {
      return ApiResponse.forbidden(res, 'Not authorized to delete this booking');
    }

    // Optional: Only allow deleting cancelled or completed bookings
    if (!['completed', 'cancelled'].includes(booking.status) && !isAdmin) {
      return ApiResponse.badRequest(res, 'Only completed or cancelled bookings can be deleted');
    }

    await Booking.findByIdAndDelete(req.params.id);

    // Also delete any notifications related to this booking
    await Notification.deleteMany({ 'data.bookingId': req.params.id });

    ApiResponse.success(res, null, 'Booking history deleted');
  } catch (error) {
    next(error);
  }
};

// ==================== BROADCAST BOOKING FEATURES ====================

// @desc    Create a broadcast booking for all workers in a category + area
// @route   POST /api/bookings/broadcast
exports.createBroadcastBooking = async (req, res, next) => {
  try {
    const {
      category,
      scheduledDate,
      scheduledTime,
      address,
      description,
      estimatedCost,
      broadcastArea
    } = req.body;

    if (!category || !broadcastArea || !broadcastArea.city) {
      return ApiResponse.badRequest(res, 'Category and City area are required for broadcast bookings');
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const booking = await Booking.create({
      customer: req.user._id,
      worker: null, // No worker assigned yet
      category,
      isBroadcast: true,
      broadcastArea,
      scheduledDate: scheduledDate || new Date(),
      scheduledTime: scheduledTime || '10:00',
      address: address
        ? typeof address === 'string'
          ? JSON.parse(address)
          : address
        : {
            street: req.user.address?.street || 'No street provided',
            city: broadcastArea.city,
            state: broadcastArea.state || req.user.address?.state || '',
            zip: broadcastArea.zip || req.user.address?.zip || '',
          },
      description: description || 'Broadcast service request',
      images,
      estimatedCost: estimatedCost || 0,
      status: 'pending',
    });

    // Notify all available workers in this category and city (non-blocking)
    const eligibleWorkers = await Worker.find({
      category,
      'address.city': { $regex: new RegExp(broadcastArea.city, 'i') },
      isAvailable: true,
      approvalStatus: 'approved'
    });

    if (eligibleWorkers.length > 0) {
      const notifications = eligibleWorkers.map(worker => ({
        recipient: worker._id,
        recipientModel: 'Worker',
        type: 'booking',
        title: 'New Nearby Job Request',
        message: `A customer in ${broadcastArea.city} is looking for a ${booking.description.slice(0, 20)}...`,
        link: `/worker/available-jobs`,
        data: { bookingId: booking._id },
      }));
      await Notification.insertMany(notifications);
    }

    ApiResponse.created(res, { booking }, 'Broadcast booking request sent to all nearby workers');
  } catch (error) {
    next(error);
  }
};

// @desc    Get available broadcast bookings for worker's category and city
// @route   GET /api/bookings/available
exports.getAvailableBroadcasts = async (req, res, next) => {
  try {
    if (req.userRole !== 'worker') {
      return ApiResponse.forbidden(res, 'Only professionals can view available jobs');
    }

    const worker = await Worker.findById(req.user._id);
    if (!worker) return ApiResponse.notFound(res, 'Worker profile not found');

    const query = {
      isBroadcast: true,
      status: 'pending',
      worker: null,
      category: worker.category,
      'broadcastArea.city': { $regex: new RegExp(worker.address?.city || '', 'i') }
    };

    const bookings = await Booking.find(query)
      .populate('customer', 'name avatar address rating')
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, { bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Worker accepts a broadcast booking
// @route   PUT /api/bookings/:id/accept
exports.acceptBroadcastBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return ApiResponse.notFound(res, 'Booking not found');
    }

    if (!booking.isBroadcast || booking.status !== 'pending' || booking.worker !== null) {
      return ApiResponse.badRequest(res, 'This job is no longer available or has already been accepted');
    }

    if (req.userRole !== 'worker') {
      return ApiResponse.forbidden(res, 'Only professionals can accept jobs');
    }

    // Assign worker and update status
    booking.worker = req.user._id;
    booking.status = 'accepted';
    booking.timeline.push({
      status: 'accepted',
      timestamp: new Date(),
      note: `Job accepted by professional: ${req.user.name}`,
    });

    await booking.save();

    // Notify customer
    const customer = await Customer.findById(booking.customer);
    if (customer) {
      Notification.create({
        recipient: customer._id,
        recipientModel: 'Customer',
        type: 'booking',
        title: 'Professional Assigned!',
        message: `${req.user.name} has accepted your request and is assigned to your booking.`,
        link: `/customer/bookings`,
        data: { bookingId: booking._id }
      }).catch(err => console.error(err));

      EmailService.sendBookingNotification(booking, customer.email, customer.name, 'accepted')
        .catch(err => console.error(err));
    }

    // Delete broadcast notifications for other workers regarding this booking
    await Notification.deleteMany({
      'data.bookingId': booking._id,
      recipientModel: 'Worker',
      recipient: { $ne: req.user._id }
    });

    ApiResponse.success(res, { booking }, 'You have successfully accepted this job');
  } catch (error) {
    next(error);
  }
};
