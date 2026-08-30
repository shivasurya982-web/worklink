const Complaint = require('../models/Complaint');
const ApiResponse = require('../utils/apiResponse');

// @desc    Create a new complaint (Customer or Worker)
// @route   POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { subject, category, description, bookingId, priority } = req.body;

    if (!subject || !description) {
      return ApiResponse.badRequest(res, 'Subject and description are required');
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      userModel: req.userRole === 'customer' ? 'Customer' : 'Worker',
      booking: bookingId || null,
      subject,
      category: category || 'Service Issue',
      description,
      priority: priority || 'medium',
      status: 'open',
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('user', 'name email phone avatar')
      .populate('booking', 'scheduledDate status');

    ApiResponse.created(res, populatedComplaint, 'Complaint lodged successfully. Support team will review it soon.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints for logged-in customer or worker
// @route   GET /api/complaints
exports.getUserComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('booking', 'scheduledDate status description')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Admin only)
// @route   GET /api/complaints/admin/all
exports.getAllComplaints = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone avatar role profession')
      .populate('booking', 'scheduledDate status description')
      .sort({ createdAt: -1 });

    ApiResponse.success(res, complaints);
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution (Admin only)
// @route   PUT /api/complaints/admin/:id
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes, priority } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return ApiResponse.notFound(res, 'Complaint not found');
    }

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (status === 'resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    const updated = await Complaint.findById(complaint._id)
      .populate('user', 'name email phone avatar role profession')
      .populate('booking', 'scheduledDate status description');

    ApiResponse.success(res, updated, 'Complaint status updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Admin only)
// @route   DELETE /api/complaints/admin/:id
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return ApiResponse.notFound(res, 'Complaint not found');
    }
    ApiResponse.success(res, null, 'Complaint deleted successfully');
  } catch (error) {
    next(error);
  }
};
