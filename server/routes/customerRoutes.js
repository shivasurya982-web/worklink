const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { customerOnly } = require('../middleware/roleAuth');
const { uploadSingle } = require('../middleware/upload');
const { validateProfileUpdate } = require('../middleware/validate');

router.use(protect, customerOnly);

router.get('/profile', customerController.getProfile);
router.put('/profile', uploadSingle, validateProfileUpdate, customerController.updateProfile);
router.put('/password', customerController.changePassword);
router.get('/dashboard', customerController.getDashboardData);

// Favorites
router.get('/favorites', customerController.getFavorites);
router.post('/favorites/:workerId', customerController.addFavorite);
router.delete('/favorites/:workerId', customerController.removeFavorite);

module.exports = router;
