const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Standard Email/Pass Auth
router.post('/admin/login', authController.adminLogin);
router.post('/customer/register', authController.customerRegister);
router.post('/customer/login', authController.customerLogin);
router.post('/worker/register', authController.workerRegister);
router.post('/worker/login', authController.workerLogin);

// Register Hint Verification Based Password Recovery
router.post('/check-account', authController.checkAccountExists);
router.post('/verify-hint', authController.verifyRegisterHint);
router.post('/reset-password-hint', authController.resetPasswordWithHint);

// Current User Profile
router.get('/me', protect, authController.getMe);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
