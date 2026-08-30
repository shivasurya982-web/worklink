const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const { validateMongoId } = require('../middleware/validate');

// All routes require Admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Worker Management
router.get('/workers', adminController.getWorkers);
router.get('/workers/pending', adminController.getPendingWorkers);
router.get('/workers/:id', validateMongoId, adminController.getWorkerDetails);
router.put('/workers/:id/approve', validateMongoId, adminController.approveWorker);
router.put('/workers/:id/reject', validateMongoId, adminController.rejectWorker);
router.put('/workers/:id/suspend', validateMongoId, adminController.suspendWorker);
router.put('/workers/:id', validateMongoId, adminController.updateWorker);
router.delete('/workers/:id', validateMongoId, adminController.deleteWorker);

// Customer Management
router.get('/customers', adminController.getCustomers);
router.put('/customers/:id', validateMongoId, adminController.updateCustomer);
router.put('/customers/:id/suspend', validateMongoId, adminController.suspendCustomer);
router.delete('/customers/:id', validateMongoId, adminController.deleteCustomer);

// Booking Management (REMOVED)

// Complaint Management
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id', validateMongoId, adminController.resolveComplaint);
router.delete('/complaints/:id', validateMongoId, adminController.deleteComplaint);

module.exports = router;
