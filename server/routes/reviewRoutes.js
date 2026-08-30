const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { customerOnly, workerOnly } = require('../middleware/roleAuth');
const { uploadMultiple } = require('../middleware/upload');
const { validateReview } = require('../middleware/validate');

// Public route to view worker reviews
router.get('/worker/:workerId', reviewController.getWorkerReviews);

// Protected routes
router.post('/', protect, customerOnly, uploadMultiple, validateReview, reviewController.createReview);
router.post('/:id/reply', protect, workerOnly, reviewController.replyToReview);

module.exports = router;
