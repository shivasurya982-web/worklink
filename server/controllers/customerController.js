const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');

// @desc    Get customer profile
// @route   GET /api/customers/profile
exports.getProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user._id).select('-password');
    if (!customer) {
      return ApiResponse.notFound(res, 'Customer not found');
    }
    ApiResponse.success(res, { customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer profile
// @route   PUT /api/customers/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, avatar, registerHint, securityHint } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;
    if (registerHint !== undefined) updates.registerHint = registerHint;
    if (securityHint !== undefined) updates.securityHint = securityHint;
    if (registerHint !== undefined && securityHint === undefined) updates.securityHint = registerHint;

    // Handle email update with duplicate check
    if (email && email !== req.user.email) {
      const emailExists = await Customer.findOne({ email });
      const workerEmailExists = await Worker.findOne({ email });
      if (emailExists || workerEmailExists) {
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
    if (avatar) updates.avatar = avatar;

    if (req.file) {
      updates.avatar = `/uploads/${req.file.filename}`;
    }

    const customer = await Customer.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    ApiResponse.success(res, { customer }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Change customer password
// @route   PUT /api/customers/password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.user._id).select('+password');

    const isMatch = await customer.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.badRequest(res, 'Incorrect current password');
    }

    customer.password = newPassword;
    await customer.save();

    ApiResponse.success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer dashboard data
// @route   GET /api/customers/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const [recentBookings, totalBookings, favoritesCount, unreadNotifications] = await Promise.all([
      Booking.find({ customer: customerId })
        .populate('worker', 'name profession avatar rating phone')
        .populate('category', 'name icon')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.countDocuments({ customer: customerId }),
      Favorite.countDocuments({ customer: customerId }),
      Notification.countDocuments({ recipient: customerId, isRead: false }),
    ]);

    // Recommended workers (using customer address if available)
    const customer = await Customer.findById(customerId);
    const coords = customer?.address?.coordinates?.coordinates;

    const AIService = require('../services/aiService');
    const recommendedWorkers = await AIService.getRecommendedWorkers({
      lat: coords ? coords[1] : null,
      lng: coords ? coords[0] : null,
      limit: 6,
    });

    ApiResponse.success(res, {
      stats: {
        totalBookings,
        favoritesCount,
        unreadNotifications,
      },
      recentBookings,
      recommendedWorkers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get favorite workers
// @route   GET /api/customers/favorites
exports.getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ customer: req.user._id })
      .populate({
        path: 'worker',
        select: '-password',
        populate: { path: 'category', select: 'name slug icon' },
      });

    const validFavorites = (favorites || []).filter(f => f && f.worker);
    ApiResponse.success(res, validFavorites);
  } catch (error) {
    next(error);
  }
};

// @desc    Add worker to favorites
// @route   POST /api/customers/favorites/:workerId
exports.addFavorite = async (req, res, next) => {
  try {
    const { workerId } = req.params;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return ApiResponse.notFound(res, 'Worker not found');
    }

    const existing = await Favorite.findOne({
      customer: req.user._id,
      worker: workerId,
    });

    if (existing) {
      return ApiResponse.badRequest(res, 'Worker is already in favorites');
    }

    const favorite = await Favorite.create({
      customer: req.user._id,
      worker: workerId,
    });

    ApiResponse.created(res, favorite, 'Added to favorites');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove worker from favorites
// @route   DELETE /api/customers/favorites/:workerId
exports.removeFavorite = async (req, res, next) => {
  try {
    const { workerId } = req.params;

    await Favorite.findOneAndDelete({
      customer: req.user._id,
      worker: workerId,
    });

    ApiResponse.success(res, null, 'Removed from favorites');
  } catch (error) {
    next(error);
  }
};
