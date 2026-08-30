const ApiResponse = require('../utils/apiResponse');

// @desc    Upload single image
// @route   POST /api/upload/image
exports.uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return ApiResponse.badRequest(res, 'Please upload a file');
    }

    const url = `/uploads/${req.file.filename}`;
    ApiResponse.success(res, { url }, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/images
exports.uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return ApiResponse.badRequest(res, 'Please upload at least one file');
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    ApiResponse.success(res, { urls }, 'Images uploaded successfully');
  } catch (error) {
    next(error);
  }
};
