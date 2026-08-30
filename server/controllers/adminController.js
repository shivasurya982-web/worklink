const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const AnalyticsService = require('../services/analyticsService');
const EmailService = require('../services/emailService');
const { parsePaginationParams, getPagination } = require('../utils/helpers');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getDashboardStats();
    const bookingGrowth = await AnalyticsService.getBookingGrowth();
    const userGrowth = await AnalyticsService.getUserGrowth();
    const categoryStats = await AnalyticsService.getCategoryStats();

    // Recent activity
    const [recentWorkers, recentCustomers, pendingWorkers, recentReviews] = await Promise.all([
      Worker.find().sort({ createdAt: -1 }).limit(5).select('name email profession approvalStatus createdAt avatar'),
      Customer.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt avatar'),
      Worker.find({ approvalStatus: 'pending' })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email profession phone createdAt avatar identityProof certificates suggestedCategory'),
      Review.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'name').populate('worker', 'name'),
    ]);

    ApiResponse.success(res, {
      stats,
      charts: { bookingGrowth, userGrowth, categoryStats },
      recentActivity: { recentWorkers, recentCustomers, pendingWorkers, recentReviews },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== WORKER MANAGEMENT ====================

// @desc    Get all workers
// @route   GET /api/admin/workers
exports.getWorkers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { status, category, search, verified } = req.query;

    const query = {};
    if (status) query.approvalStatus = status;
    if (category) query.category = category;
    if (verified === 'true') query.isVerified = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
      ];
    }

    const [workers, total] = await Promise.all([
      Worker.find(query)
        .populate('category', 'name slug')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Worker.countDocuments(query),
    ]);

    ApiResponse.paginated(res, workers, getPagination(page, limit, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending workers
// @route   GET /api/admin/workers/pending
exports.getPendingWorkers = async (req, res, next) => {
  try {
    const workers = await Worker.find({ approvalStatus: 'pending' })
      .populate('category', 'name slug')
      .select('-password')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, workers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker details
// @route   GET /api/admin/workers/:id
exports.getWorkerDetails = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('category', 'name slug')
      .select('-password');

    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    // Get worker's booking stats
    const bookingStats = await Booking.aggregate([
      { $match: { worker: worker._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    ApiResponse.success(res, { worker, bookingStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve worker
// @route   PUT /api/admin/workers/:id/approve
exports.approveWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    worker.approvalStatus = 'approved';
    worker.isVerified = true;
    worker.adminNotes = req.body.notes || '';
    await worker.save();

    // Update category worker count
    await Category.findByIdAndUpdate(worker.category, { $inc: { workerCount: 1 } });

    // Send approval email (non-blocking)
    EmailService.sendWorkerApprovalEmail(worker, true).catch(err => console.error('Email send failed:', err.message));

    // Create notification (non-blocking)
    Notification.create({
      recipient: worker._id,
      recipientModel: 'Worker',
      type: 'approval',
      title: 'Application Approved!',
      message: 'Your professional application has been approved. You can now start receiving bookings.',
      link: '/worker/dashboard',
    }).catch(err => console.error('Notification creation failed:', err.message));

    ApiResponse.success(res, { worker }, 'Worker approved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Reject worker
// @route   PUT /api/admin/workers/:id/reject
exports.rejectWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    worker.approvalStatus = 'rejected';
    worker.rejectionReason = req.body.reason || 'Application did not meet our requirements';
    worker.adminNotes = req.body.notes || '';
    await worker.save();

    // Send rejection email (non-blocking)
    EmailService.sendWorkerApprovalEmail(worker, false).catch(err => console.error('Email send failed:', err.message));

    // Create notification (non-blocking)
    Notification.create({
      recipient: worker._id,
      recipientModel: 'Worker',
      type: 'approval',
      title: 'Application Rejected',
      message: `Your application was rejected. ${worker.rejectionReason}`,
    }).catch(err => console.error('Notification creation failed:', err.message));

    ApiResponse.success(res, { worker }, 'Worker rejected');
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend worker
// @route   PUT /api/admin/workers/:id/suspend
exports.suspendWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    worker.approvalStatus = 'suspended';
    worker.adminNotes = req.body.reason || 'Account suspended by admin';
    await worker.save();

    ApiResponse.success(res, { worker }, 'Worker suspended');
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker details (admin)
// @route   PUT /api/admin/workers/:id
exports.updateWorker = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'name', 'phone', 'whatsapp', 'profession', 'category', 'experience',
      'description', 'address', 'serviceRadius', 'workingHours', 'pricing',
      'isVerified', 'emergencyService', 'adminNotes',
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const worker = await Worker.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    ApiResponse.success(res, { worker }, 'Worker updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete worker
// @route   DELETE /api/admin/workers/:id
exports.deleteWorker = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    // Decrement category count
    if (worker.approvalStatus === 'approved') {
      await Category.findByIdAndUpdate(worker.category, { $inc: { workerCount: -1 } });
    }

    await Worker.findByIdAndDelete(req.params.id);
    ApiResponse.success(res, null, 'Worker deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ==================== CUSTOMER MANAGEMENT ====================

// @desc    Get all customers
// @route   GET /api/admin/customers
exports.getCustomers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const { search, suspended } = req.query;

    const query = {};
    if (suspended === 'true') query.isSuspended = true;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Customer.countDocuments(query),
    ]);

    ApiResponse.paginated(res, customers, getPagination(page, limit, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer (admin)
// @route   PUT /api/admin/customers/:id
exports.updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, isSuspended, suspendReason } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (isSuspended !== undefined) {
      updates.isSuspended = isSuspended;
      updates.suspendReason = suspendReason || '';
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!customer) {
      return ApiResponse.notFound(res, 'Customer not found');
    }

    ApiResponse.success(res, { customer }, 'Customer updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend customer
// @route   PUT /api/admin/customers/:id/suspend
exports.suspendCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isSuspended: true, suspendReason: req.body.reason || 'Suspended by admin' },
      { new: true }
    ).select('-password');

    if (!customer) {
      return ApiResponse.notFound(res, 'Customer not found');
    }

    ApiResponse.success(res, { customer }, 'Customer suspended');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return ApiResponse.notFound(res, 'Customer not found');
    }
    ApiResponse.success(res, null, 'Customer deleted');
  } catch (error) {
    next(error);
  }
};

// ==================== BOOKING MANAGEMENT (REMOVED) ====================

// ==================== COMPLAINT MANAGEMENT ====================

// @desc    Get all complaints
// @route   GET /api/admin/complaints
exports.getComplaints = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone avatar role profession')
      .populate('booking')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve complaint
// @route   PUT /api/admin/complaints/:id
exports.resolveComplaint = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status: status || 'resolved',
        resolutionNotes,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
      },
      { new: true }
    );

    if (!complaint) {
      return ApiResponse.notFound(res, 'Complaint not found');
    }

    ApiResponse.success(res, { complaint }, 'Complaint updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Admin only)
// @route   DELETE /api/admin/complaints/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return ApiResponse.notFound(res, 'Complaint not found');
    }
    ApiResponse.success(res, null, 'Complaint deleted successfully');
  } catch (error) {
    next(error);
  }
};
