const AnalyticsService = require('../services/analyticsService');
const ApiResponse = require('../utils/apiResponse');

// @desc    Get admin analytics overview
// @route   GET /api/analytics/admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getDashboardStats();
    const bookingGrowth = await AnalyticsService.getBookingGrowth();
    const userGrowth = await AnalyticsService.getUserGrowth();
    const categoryStats = await AnalyticsService.getCategoryStats();

    ApiResponse.success(res, {
      stats,
      bookingGrowth,
      userGrowth,
      categoryStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get worker analytics
// @route   GET /api/analytics/worker/:id
exports.getWorkerAnalytics = async (req, res, next) => {
  try {
    const workerId = req.params.id || req.user._id;
    const analytics = await AnalyticsService.getWorkerAnalytics(workerId);

    ApiResponse.success(res, analytics);
  } catch (error) {
    next(error);
  }
};
