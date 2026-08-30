const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');

router.use(protect);

router.post('/image', uploadSingle, uploadController.uploadSingleImage);
router.post('/images', uploadMultiple, uploadController.uploadMultipleImages);

module.exports = router;
