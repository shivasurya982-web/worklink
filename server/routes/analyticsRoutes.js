const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');

router.get('/admin', protect, adminOnly, analyticsController.getAdminAnalytics);
router.get('/worker/:id?', protect, analyticsController.getWorkerAnalytics);

module.exports = router;
