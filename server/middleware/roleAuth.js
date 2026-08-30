// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};

// Admin only
const adminOnly = authorize('admin');

// Customer only
const customerOnly = authorize('customer');

// Worker only
const workerOnly = authorize('worker');

// Customer or Worker
const customerOrWorker = authorize('customer', 'worker');

module.exports = {
  authorize,
  adminOnly,
  customerOnly,
  workerOnly,
  customerOrWorker,
};
