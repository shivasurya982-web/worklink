const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const { uploadSingle } = require('../middleware/upload');
const { validateCategory, validateMongoId } = require('../middleware/validate');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin-only routes
router.post('/', protect, adminOnly, uploadSingle, validateCategory, categoryController.createCategory);
router.put('/:id', protect, adminOnly, uploadSingle, validateMongoId, categoryController.updateCategory);
router.delete('/:id', protect, adminOnly, validateMongoId, categoryController.deleteCategory);

module.exports = router;
