const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const { workerOnly } = require('../middleware/roleAuth');
const { uploadWorkerFiles, uploadMultiple } = require('../middleware/upload');

// Public route to view worker profile
router.get('/:id/public', workerController.getWorkerById);

// Protected worker routes
router.use(protect, workerOnly);

router.get('/profile', workerController.getProfile);
router.put('/profile', uploadWorkerFiles, workerController.updateProfile);
router.put('/availability', workerController.toggleAvailability);
router.put('/portfolio', uploadMultiple, workerController.updatePortfolio);
router.get('/dashboard', workerController.getDashboardData);

module.exports = router;
