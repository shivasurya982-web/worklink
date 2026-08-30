const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createComplaint);
router.get('/', getUserComplaints);
router.get('/admin/all', authorize('admin'), getAllComplaints);
router.put('/admin/:id', authorize('admin'), updateComplaintStatus);

module.exports = router;
