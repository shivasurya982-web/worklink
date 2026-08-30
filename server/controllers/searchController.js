const Worker = require('../models/Worker');
const Category = require('../models/Category');
const AIService = require('../services/aiService');
const LocationService = require('../services/locationService');
const ApiResponse = require('../utils/apiResponse');
const { parsePaginationParams, getPagination } = require('../utils/helpers');

const AnalyticsService = require('../services/analyticsService');

// @desc    Search workers with filters
// @route   GET /api/search/workers
exports.searchWorkers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePaginationParams(req.query);
    const {
      category, query, area, lat, lng, radius,
      rating, minPrice, maxPrice, experience,
      verified, openNow, emergency, sortBy,
    } = req.query;

    const filter = {
      approvalStatus: 'approved',
    };

    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const catObj = await Category.findOne({ slug: category });
        if (catObj) {
          filter.category = catObj._id;
        } else {
          // If category slug not found, return empty results
          return ApiResponse.paginated(res, [], getPagination(page, limit, 0));
        }
      }
    }

    const andConditions = [];

    if (query && query.trim()) {
      andConditions.push({
        $or: [
          { name: { $regex: query.trim(), $options: 'i' } },
          { profession: { $regex: query.trim(), $options: 'i' } },
          { description: { $regex: query.trim(), $options: 'i' } },
          { 'address.city': { $regex: query.trim(), $options: 'i' } },
          { 'address.street': { $regex: query.trim(), $options: 'i' } },
        ],
      });
    }

    if (area && area.trim()) {
      const areaRegex = new RegExp(area.trim(), 'i');
      andConditions.push({
        $or: [
          { 'address.city': areaRegex },
          { 'address.street': areaRegex },
          { 'address.state': areaRegex },
          { 'address.zip': areaRegex },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    if (rating) filter.rating = { $gte: parseFloat(rating) || 0 };
    if (experience) filter.experience = { $gte: parseInt(experience) || 0 };
    if (verified === 'true') filter.isVerified = true;
    if (emergency === 'true') filter.emergencyService = true;

    if (minPrice || maxPrice) {
      filter['pricing.hourly'] = {};
      if (minPrice) filter['pricing.hourly'].$gte = parseInt(minPrice) || 0;
      if (maxPrice) filter['pricing.hourly'].$lte = parseInt(maxPrice) || 10000;
    }

    // Sort order
    let sortOptions = {};
    if (sortBy === 'rating') sortOptions.rating = -1;
    else if (sortBy === 'price_low') sortOptions['pricing.hourly'] = 1;
    else if (sortBy === 'price_high') sortOptions['pricing.hourly'] = -1;
    else if (sortBy === 'experience') sortOptions.experience = -1;
    else sortOptions.completedJobs = -1;

    let workers = await Worker.find(filter)
      .populate('category', 'name slug icon')
      .select('-password')
      .sort(sortOptions)
      .lean();

    // Distance filtering if coords provided
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      workers = LocationService.filterByDistance(workers, parseFloat(lat), parseFloat(lng), parseFloat(radius) || 50);
    }

    // Open now filter
    if (openNow === 'true') {
      workers = workers.filter((w) => w.isAvailable === true);
    }

    const total = workers.length;
    const paginatedWorkers = workers.slice(skip, skip + limit);

    ApiResponse.paginated(res, paginatedWorkers, getPagination(page, limit, total));
  } catch (error) {
    console.error('searchWorkers error:', error);
    next(error);
  }
};

// @desc    Get distinct worker areas/cities
// @route   GET /api/search/areas
exports.getDistinctAreas = async (req, res, next) => {
  try {
    const workers = await Worker.find({ approvalStatus: 'approved' }).select('address').lean();
    const areaSet = new Set();

    workers.forEach((w) => {
      if (w.address?.city) areaSet.add(w.address.city.trim());
      if (w.address?.street) areaSet.add(w.address.street.trim());
      if (w.address?.state) areaSet.add(w.address.state.trim());
    });

    const areas = Array.from(areaSet).filter(Boolean);
    ApiResponse.success(res, areas);
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby workers based on geolocation
// @route   GET /api/search/nearby
exports.getNearbyWorkers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 25, category, limit = 10 } = req.query;

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return ApiResponse.badRequest(res, 'Latitude and longitude are required for nearby search');
    }

    const query = { approvalStatus: 'approved', isAvailable: true };
    if (category) query.category = category;

    const workers = await Worker.find(query)
      .populate('category', 'name slug icon')
      .select('-password')
      .lean();

    const filtered = LocationService.filterByDistance(
      workers,
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    ).slice(0, parseInt(limit) || 10);

    ApiResponse.success(res, filtered);
  } catch (error) {
    next(error);
  }
};

// @desc    AI Smart Search
// @route   GET /api/search/ai
exports.aiSearch = async (req, res, next) => {
  try {
    const { q, lat, lng } = req.query;

    if (!q) {
      return ApiResponse.badRequest(res, 'Search query is required');
    }

    const parsedParams = await AIService.parseSearchQuery(q);

    // Find category if detected
    let categoryId = null;
    if (parsedParams.categoryName) {
      const cat = await Category.findOne({
        name: { $regex: new RegExp(parsedParams.categoryName, 'i') },
      });
      if (cat) categoryId = cat._id;
    }

    const query = { approvalStatus: 'approved' };
    if (categoryId) query.category = categoryId;
    if (parsedParams.maxPrice) query['pricing.hourly'] = { $lte: parsedParams.maxPrice };

    let workers = await Worker.find(query)
      .populate('category', 'name slug icon')
      .select('-password')
      .lean();

    // Distance filtering if coords provided
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      workers = LocationService.filterByDistance(workers, parseFloat(lat), parseFloat(lng), 50);
    }

    const recommended = await AIService.matchWorkers(parsedParams, workers);

    ApiResponse.success(res, {
      parsedParams,
      workers: recommended.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live search suggestions (Categories & Workers)
// @route   GET /api/search/suggestions
exports.getSuggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return ApiResponse.success(res, { categories: [], workers: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [categories, workers] = await Promise.all([
      Category.find({ name: regex }).limit(5).select('name slug icon'),
      Worker.find({
        approvalStatus: 'approved',
        $or: [
          { name: regex },
          { profession: regex }
        ]
      }).limit(5).select('name profession avatar')
    ]);

    ApiResponse.success(res, { categories, workers });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Assistant queries
// @route   POST /api/search/ai-assistant
exports.aiAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return ApiResponse.badRequest(res, 'Message is required');
    }

    const response = AIService.generateAssistantResponse(message);
    ApiResponse.success(res, response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get public homepage stats
// @route   GET /api/search/stats
exports.getPublicStats = async (req, res, next) => {
  try {
    const stats = await AnalyticsService.getPublicStats();
    ApiResponse.success(res, stats);
  } catch (error) {
    next(error);
  }
};
