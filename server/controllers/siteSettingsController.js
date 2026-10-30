const SiteSettings = require('../models/SiteSettings');
const ApiResponse = require('../utils/apiResponse');

const defaultSteps = [
  { step: '01', title: 'AI Smart Search', description: 'Enter what service you need or your location.' },
  { step: '02', title: 'Compare & Book', description: 'View ratings, pricing, and portfolio.' },
  { step: '03', title: 'Real-Time Updates', description: 'Track status live and chat.' },
  { step: '04', title: 'Service Done', description: 'Pay after completion and review.' },
];

const defaultAIFeatures = [
  { title: 'Intelligent Matchmaking', description: 'Algorithm weighing distance and ratings.' },
  { title: 'Natural Language Search', description: 'Search using plain English phrases.' },
  { title: 'Google Maps Geo-Spatial', description: 'Interactive map with live pins.' },
];

const defaultStats = [
  { num: '50K+', label: 'Happy Customers' },
  { num: '5K+', label: 'Verified Workers' },
];

let cachedSettings = null;
let settingsCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// @desc    Get site settings (Public)
// @route   GET /api/settings
exports.getSettings = async (req, res, next) => {
  try {
    const now = Date.now();
    if (cachedSettings && now - settingsCacheTime < CACHE_TTL) {
      return ApiResponse.success(res, cachedSettings);
    }

    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      // Try to create but handle if it fails
      try {
        settings = await SiteSettings.create({
          siteName: 'Worklyn AI',
          howItWorksSteps: defaultSteps,
          aiFeaturesList: defaultAIFeatures,
          statsCounters: defaultStats,
        });
        if (settings && settings.toObject) settings = settings.toObject();
      } catch (err) {
         console.warn('Initial settings creation failed, using fallback.');
      }
    }

    // Safety fallback object if DB didn't return anything
    const finalData = settings || {
        siteName: 'Worklyn AI',
        announcementText: 'Verified Local Service Marketplace',
        heroTitle: 'Find & Book Trusted Local Experts',
        heroSubtitle: 'Worklyn AI connects you with verified experts nearby.',
        statsCounters: defaultStats
    };

    cachedSettings = finalData;
    settingsCacheTime = now;

    ApiResponse.success(res, finalData);
  } catch (error) {
    console.error('getSettings error:', error);
    // Return a 200 with fallback instead of 500 to keep UI alive
    return res.status(200).json({
      success: true,
      data: cachedSettings || {
        siteName: 'Worklyn AI',
        announcementText: 'Verified Local Service Marketplace',
        heroTitle: 'Find & Book Trusted Local Experts',
        heroSubtitle: 'Worklyn AI connects you with verified experts nearby.',
        statsCounters: defaultStats
      }
    });
  }
};

// @desc    Update site settings (Admin only)
// @route   PUT /api/admin/settings
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    cachedSettings = settings.toObject ? settings.toObject() : settings;
    settingsCacheTime = Date.now();
    ApiResponse.success(res, settings, 'Site settings updated');
  } catch (error) {
    next(error);
  }
};
