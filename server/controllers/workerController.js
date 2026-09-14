const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ApiResponse = require('../utils/apiResponse');
const AnalyticsService = require('../services/analyticsService');

// @desc    Get worker profile
// @route   GET /api/workers/profile
exports.getProfile = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.user._id)
      .populate('category', 'name slug icon')
      .select('-password');

    if (!worker) {
      return ApiResponse.notFound(res, 'Worker profile not found');
    }

    ApiResponse.success(res, { worker });
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker profile
// @route   PUT /api/workers/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name, email, phone, whatsapp, profession, category, suggestedCategory, experience,
      description, address, serviceRadius, workingHours, pricing, emergencyService,
      registerHint, securityHint
    } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (whatsapp) updates.whatsapp = whatsapp;
    if (profession) updates.profession = profession;
    if (category) {
      if (category === 'other') {
        updates.category = null;
        if (suggestedCategory) updates.suggestedCategory = suggestedCategory;
      } else {
        updates.category = category;
        updates.suggestedCategory = '';
      }
    }
    if (experience !== undefined) updates.experience = parseInt(experience);
    if (description) updates.description = description;
    if (registerHint !== undefined) updates.registerHint = registerHint;
    if (securityHint !== undefined) updates.securityHint = securityHint;
    if (registerHint !== undefined && securityHint === undefined) updates.securityHint = registerHint;

    // Handle email update with duplicate check
    if (email && email !== req.user.email) {
      const Customer = require('../models/Customer');
      const emailExists = await Worker.findOne({ email });
      const customerEmailExists = await Customer.findOne({ email });
      if (emailExists || customerEmailExists) {
        return ApiResponse.badRequest(res, 'This email is already registered to another account');
      }
      updates.email = email;
    }

    if (address) {
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      updates.address = parsedAddress;

      // Update coordinates if provided in address
      if (parsedAddress.coordinates) {
        updates['address.coordinates'] = parsedAddress.coordinates;
      }
    }
    if (serviceRadius !== undefined) updates.serviceRadius = parseInt(serviceRadius);
    if (workingHours) updates.workingHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
    if (pricing) updates.pricing = typeof pricing === 'string' ? JSON.parse(pricing) : pricing;
    if (emergencyService !== undefined) updates.emergencyService = emergencyService === 'true' || emergencyService === true;

    // Explicitly handle portfolio array updates/deletions
    if (req.body.portfolio) {
      try {
        const portfolioData = typeof req.body.portfolio === 'string'
          ? JSON.parse(req.body.portfolio)
          : req.body.portfolio;

        if (Array.isArray(portfolioData)) {
          updates.portfolio = portfolioData;
        }
      } catch (e) {
        console.error('Portfolio parsing error:', e);
      }
    }

    // Handle files if uploaded
    if (req.files) {
      if (req.files.avatar) updates.avatar = `/uploads/${req.files.avatar[0].filename}`;
      if (req.files.coverImage) updates.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
      if (req.files.identityProof) updates.identityProof = `/uploads/${req.files.identityProof[0].filename}`;
    } else if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const worker = await Worker.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug icon').select('-password');

    ApiResponse.success(res, { worker }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle availability
// @route   PUT /api/workers/availability
exports.toggleAvailability = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.user._id);
    worker.isAvailable = !worker.isAvailable;
    await worker.save();

    ApiResponse.success(res, { isAvailable: worker.isAvailable }, `Status updated to ${worker.isAvailable ? 'Available' : 'Unavailable'}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Update worker portfolio
// @route   PUT /api/workers/portfolio
exports.updatePortfolio = async (req, res, next) => {
  try {
    let newItems = [];
    if (req.files && req.files.length > 0) {
      newItems = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        title: req.body.title || '',
        description: req.body.description || '',
        createdAt: new Date()
      }));
    }

    const worker = await Worker.findById(req.user._id);
    if (req.body.replace === 'true' || req.body.replace === true) {
      worker.portfolio = newItems;
    } else {
      worker.portfolio = [...worker.portfolio, ...newItems];
    }

    await worker.save();
    ApiResponse.success(res, { portfolio: worker.portfolio }, 'Portfolio updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Get worker dashboard stats
// @route   GET /api/workers/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const workerId = req.user._id;

    const [
      todaysBookings,
      pendingRequests,
      completedJobsCount,
      notCompletedCount,
      totalJobsCount,
      recentBookings,
      analytics,
      recentReviews
    ] = await Promise.all([
      Booking.countDocuments({
        worker: workerId,
        scheduledDate: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lte: new Date().setHours(23, 59, 59, 999),
        },
      }),
      Booking.countDocuments({ worker: workerId, status: 'pending' }),
      Booking.countDocuments({ worker: workerId, status: 'completed' }),
      Booking.countDocuments({ worker: workerId, status: { $in: ['cancelled', 'rejected'] } }),
      Booking.countDocuments({ worker: workerId }),
      Booking.find({ worker: workerId })
        .populate('customer', 'name avatar phone address')
        .sort({ createdAt: -1 })
        .limit(5),
      AnalyticsService.getWorkerAnalytics(workerId),
      Review.find({ worker: workerId })
        .populate('customer', 'name avatar')
        .sort({ createdAt: -1 }),
    ]);

    const worker = await Worker.findById(workerId).select('rating totalReviews completedJobs profileViews isAvailable pricing totalEarnings');

    ApiResponse.success(res, {
      worker,
      stats: {
        todaysBookings,
        pendingRequests,
        completedJobs: completedJobsCount,
        notCompletedJobs: notCompletedCount,
        totalJobs: totalJobsCount,
        monthlyEarnings: analytics.monthlyEarnings,
        prevMonthEarnings: analytics.prevMonthEarnings,
        monthlyBookings: analytics.monthlyBookings,
        totalEarnings: worker.totalEarnings,
      },
      recentBookings,
      recentReviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public worker profile by ID
// @route   GET /api/workers/:id
exports.getWorkerById = async (req, res, next) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate('category', 'name slug icon')
      .select('-password -identityProof -adminNotes -rejectionReason');

    if (!worker || worker.approvalStatus !== 'approved') {
      return ApiResponse.notFound(res, 'Worker not found or not approved');
    }

    // Increment profile views
    worker.profileViews = (worker.profileViews || 0) + 1;
    await worker.save({ validateBeforeSave: false });

    // Fetch reviews
    const reviews = await Review.find({ worker: worker._id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    ApiResponse.success(res, { worker, reviews });
  } catch (error) {
    next(error);
  }
};
