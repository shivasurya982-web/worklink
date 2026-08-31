const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Category = require('../models/Category');

class AnalyticsService {
  /**
   * Get public homepage statistics
   */
  static async getPublicStats() {
    try {
      const [
        totalCustomers,
        totalWorkers,
        totalCategories,
        avgRatingResult
      ] = await Promise.all([
        Customer.countDocuments().catch(() => 0),
        Worker.countDocuments({ approvalStatus: 'approved' }).catch(() => 0),
        Category.countDocuments().catch(() => 0),
        Review.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]).catch(() => [])
      ]);

      const averageRating = avgRatingResult && avgRatingResult.length > 0
        ? Math.round(avgRatingResult[0].avgRating * 10) / 10
        : 4.8;

      return {
        totalCustomers: totalCustomers || 0,
        totalWorkers: totalWorkers || 0,
        totalCategories: totalCategories || 0,
        averageRating: averageRating || 4.8
      };
    } catch (error) {
      console.error('getPublicStats error:', error);
      return { totalCustomers: 0, totalWorkers: 0, totalCategories: 0, averageRating: 4.8 };
    }
  }

  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats() {
    try {
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
        Customer.countDocuments().catch(() => 0),
        Worker.countDocuments({ approvalStatus: 'approved' }).catch(() => 0),
        Worker.countDocuments({ approvalStatus: 'pending' }).catch(() => 0),
        Worker.countDocuments({ isVerified: true }).catch(() => 0),
        Booking.countDocuments().catch(() => 0),
        Booking.countDocuments({ status: 'completed' }).catch(() => 0),
        Booking.countDocuments({ status: 'cancelled' }).catch(() => 0),
        Booking.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$finalCost' } } },
        ]).catch(() => []),
      ]);

      const revenue = revenueResult && revenueResult.length > 0 ? revenueResult[0].total : 0;

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
    } catch (error) {
      console.error('getDashboardStats error:', error);
      return { totalCustomers: 0, totalWorkers: 0, pendingWorkers: 0, verifiedWorkers: 0, totalBookings: 0, completedBookings: 0, cancelledBookings: 0, revenue: 0 };
    }
  }

  /**
   * Get booking growth data (last 12 months)
   */
  static async getBookingGrowth() {
    try {
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
    } catch (error) {
      console.error('getBookingGrowth error:', error);
      return [];
    }
  }

  /**
   * Get user growth data (last 12 months)
   */
  static async getUserGrowth() {
    try {
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
        ]).catch(() => []),
        Worker.aggregate([
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          {
            $group: {
              _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ]).catch(() => []),
      ]);

      return { customerGrowth, workerGrowth };
    } catch (error) {
      console.error('getUserGrowth error:', error);
      return { customerGrowth: [], workerGrowth: [] };
    }
  }

  /**
   * Get category-wise booking statistics
   */
  static async getCategoryStats() {
    try {
      return await Booking.aggregate([
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
      ]).catch(() => []);
    } catch (error) {
      console.error('getCategoryStats error:', error);
      return [];
    }
  }

  /**
   * Get worker-specific analytics
   */
  static async getWorkerAnalytics(workerId) {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate start and end of previous month
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      const [monthlyBookings, monthlyEarnings, prevMonthEarnings, reviewStats] = await Promise.all([
        Booking.countDocuments({
          worker: workerId,
          createdAt: { $gte: startOfMonth },
        }).catch(() => 0),
        Booking.aggregate([
          {
            $match: {
              worker: workerId,
              status: 'completed',
              completedAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$finalCost' } } },
        ]).catch(() => []),
        Booking.aggregate([
          {
            $match: {
              worker: workerId,
              status: 'completed',
              completedAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$finalCost' } } },
        ]).catch(() => []),
        Review.aggregate([
          { $match: { worker: workerId } },
          {
            $group: {
              _id: null,
              avgRating: { $avg: '$rating' },
              total: { $sum: 1 },
            },
          },
        ]).catch(() => []),
      ]);

      return {
        monthlyBookings: monthlyBookings || 0,
        monthlyEarnings: monthlyEarnings && monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0,
        prevMonthEarnings: prevMonthEarnings && prevMonthEarnings.length > 0 ? prevMonthEarnings[0].total : 0,
        averageRating: reviewStats && reviewStats.length > 0 ? Math.round(reviewStats[0].avgRating * 10) / 10 : 0,
        totalReviews: reviewStats && reviewStats.length > 0 ? reviewStats[0].total : 0,
      };
    } catch (error) {
      console.error('getWorkerAnalytics error:', error);
      return { monthlyBookings: 0, monthlyEarnings: 0, prevMonthEarnings: 0, averageRating: 0, totalReviews: 0 };
    }
  }
}

module.exports = AnalyticsService;
