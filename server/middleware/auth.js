const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Worker = require('../models/Worker');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user based on role
    let user;
    switch (decoded.role) {
      case 'admin':
        user = await Admin.findById(decoded.id);
        break;
      case 'customer':
        user = await Customer.findById(decoded.id);
        break;
      case 'worker':
        user = await Worker.findById(decoded.id);
        break;
      default:
        return res.status(401).json({
          success: false,
          message: 'Invalid token role',
        });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // For workers, check approval status
    if (decoded.role === 'worker' && user.approvalStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.approvalStatus}. Please wait for admin approval.`,
      });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }
};

// Authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.userRole}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
