const { validationResult, body, param, query } = require('express-validator');

// Check validation results middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const validateLogin = [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateWorkerRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('profession').trim().notEmpty().withMessage('Profession is required'),
  body('category').notEmpty().withMessage('Category is required'),
  handleValidation,
];

const validateBooking = [
  body('worker').notEmpty().withMessage('Worker is required').isMongoId().withMessage('Invalid worker ID'),
  body('scheduledDate').notEmpty().withMessage('Date is required').isISO8601().withMessage('Invalid date format'),
  body('scheduledTime').notEmpty().withMessage('Time is required'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description too long'),
  handleValidation,
];

const validateReview = [
  body('worker').notEmpty().withMessage('Worker is required').isMongoId().withMessage('Invalid worker ID'),
  body('booking').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid booking ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long'),
  handleValidation,
];

const validateCategory = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  handleValidation,
];

const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidation,
];

const validateForgotPassword = [
  body('email').trim().isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  handleValidation,
];

const validateResetPassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const validateProfileUpdate = [
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  body('phone').optional().trim(),
  body('email').optional().trim().isEmail().withMessage('Please enter a valid email'),
  handleValidation,
];

const validateMessage = [
  body('content').optional().trim(),
  body('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateRegister,
  validateLogin,
  validateWorkerRegister,
  validateBooking,
  validateReview,
  validateCategory,
  validateMongoId,
  validateForgotPassword,
  validateResetPassword,
  validateProfileUpdate,
  validateMessage,
};
