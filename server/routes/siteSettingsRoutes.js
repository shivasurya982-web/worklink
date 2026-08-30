const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/siteSettingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/settings', getSettings);
router.put('/site-settings', protect, authorize('admin'), updateSettings);

module.exports = router;
