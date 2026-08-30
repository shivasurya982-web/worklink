const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { customerOnly } = require('../middleware/roleAuth');
const { uploadMultiple } = require('../middleware/upload');
const { validateBooking, validateMongoId } = require('../middleware/validate');

router.use(protect);

router.post('/', customerOnly, uploadMultiple, validateBooking, bookingController.createBooking);
router.post('/broadcast', customerOnly, uploadMultiple, bookingController.createBroadcastBooking);
router.get('/available', bookingController.getAvailableBroadcasts);
router.put('/:id/accept', validateMongoId, bookingController.acceptBroadcastBooking);
router.get('/', bookingController.getUserBookings);
router.get('/:id', validateMongoId, bookingController.getBookingById);
router.put('/:id/status', validateMongoId, bookingController.updateBookingStatus);
router.put('/:id/cancel', validateMongoId, bookingController.cancelBooking);
router.delete('/:id', validateMongoId, bookingController.deleteBooking);

module.exports = router;
