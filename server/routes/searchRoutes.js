const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public search endpoints
router.get('/workers', searchController.searchWorkers);
router.get('/suggestions', searchController.getSuggestions);
router.get('/areas', searchController.getDistinctAreas);
router.get('/nearby', searchController.getNearbyWorkers);
router.get('/stats', searchController.getPublicStats);
router.get('/ai', searchController.aiSearch);
router.post('/ai-assistant', searchController.aiAssistant);

module.exports = router;
