const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Analytics = require('../models/Analytics');

const Category = require('../models/Category');

class AnalyticsService {
  /**
   * Get public homepage statistics
   */
  static async getPublicStats() {
    const [
      totalCustomers,
      totalWorkers,
      totalCategories,
      avgRatingResult
    ] = await Promise.all([
      Customer.countDocuments(),
      Worker.countDocuments({ approvalStatus: 'approved' }),
      Category.countDocuments(),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const averageRating = avgRatingResult.length > 0 ? Math.round(avgRatingResult[0].avgRating * 10) / 10 : 4.8;

    return {
      totalCustomers,
      totalWorkers,
      totalCategories,
      averageRating: averageRating || 4.8
    };
  }

  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats() {
    const [
      totalCustomers,
      totalWorkers,
      pendingWorkers,
      verifiedWorkers,
      totalBookings,
      completedBookings,
      cancelledBookings,
      revenueResult,
    ] = await Promise.all([
      Customer.countDocuments(),
      Worker.countDocuments({ approvalStatus: 'approved' }),
      Worker.countDocuments({ approvalStatus: 'pending' }),
      Worker.countDocuments({ isVerified: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$finalCost' } } },
      ]),
    ]);

    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return {
      totalCustomers,
      totalWorkers,
      pendingWorkers,
      verifiedWorkers,
      totalBookings,
      completedBookings,
      cancelledBookings,
      revenue,
    };
  }

  /**
   * Get booking growth data (last 12 months)
   */
  static async getBookingGrowth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const data = await Booking.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalCost', 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return data.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      bookings: item.count,
      revenue: item.revenue,
    }));
  }

  /**
   * Get user growth data (last 12 months)
   */
  static async getUserGrowth() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [customerGrowth, workerGrowth] = await Promise.all([
      Customer.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Worker.aggregate([
        { $match: { createdAt: { $gte: twelveMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    return { customerGrowth, workerGrowth };
  }

  /**
   * Get category-wise booking statistics
   */
  static async getCategoryStats() {
    return Booking.aggregate([
      {
        $group: {
          _id: '$category',
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$finalCost', 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          totalBookings: 1,
          completedBookings: 1,
          revenue: 1,
        },
      },
      { $sort: { totalBookings: -1 } },
    ]);
  }

  /**
   * Get worker-specific analytics
   */
  static async getWorkerAnalytics(workerId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate start and end of previous month
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [monthlyBookings, monthlyEarnings, prevMonthEarnings, reviewStats] = await Promise.all([
      Booking.countDocuments({
        worker: workerId,
        createdAt: { $gte: startOfMonth },
      }),
      Booking.aggregate([
        {
          $match: {
            worker: workerId,
            status: 'completed',
            completedAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$finalCost' } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            worker: workerId,
            status: 'completed',
            completedAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$finalCost' } } },
      ]),
      Review.aggregate([
        { $match: { worker: workerId } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            total: { $sum: 1 },
          },
        },
      ]),
    ]);

    return {
      monthlyBookings,
      monthlyEarnings: monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0,
      prevMonthEarnings: prevMonthEarnings.length > 0 ? prevMonthEarnings[0].total : 0,
      averageRating: reviewStats.length > 0 ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0,
      totalReviews: reviewStats.length > 0 ? reviewStats[0].total : 0,
    };
  }
}

module.exports = AnalyticsService;
