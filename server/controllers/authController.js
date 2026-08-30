const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const Worker = require('../models/Worker');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/apiResponse');

// ==================== ADMIN AUTH ====================
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`[Auth] Admin login attempt: ${email}`);

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      console.log(`[Auth] Admin not found: ${email}`);
      return ApiResponse.unauthorized(res, 'Invalid email or password');
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.log(`[Auth] Admin password mismatch for: ${email}`);
      return ApiResponse.unauthorized(res, 'Invalid email or password');
    }

    if (!admin.isActive) {
      return ApiResponse.forbidden(res, 'Admin account is deactivated');
    }

    const token = generateToken(admin._id, 'admin');
    console.log(`[Auth] Admin logged in successfully: ${email}`);

    ApiResponse.success(res, {
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        avatar: admin.avatar
      }
    }, 'Admin login successful');
  } catch (error) {
    console.error('adminLogin error:', error);
    next(error);
  }
};

// ==================== CUSTOMER AUTH ====================
exports.customerRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, securityHint } = req.body;
    const existing = await Customer.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) return ApiResponse.badRequest(res, 'Email or phone already registered');

    if (!securityHint) return ApiResponse.badRequest(res, 'Security recovery hint is required');

    const customer = await Customer.create({ name, email: email.toLowerCase(), password, phone, securityHint });
    const token = generateToken(customer._id, 'customer');
    ApiResponse.created(res, {
      token,
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        securityHint: customer.securityHint
      }
    });
  } catch (error) {
    console.error('customerRegister error:', error);
    next(error);
  }
};

exports.customerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return ApiResponse.badRequest(res, 'Please provide email and password');

    console.log(`[Auth] Login attempt for: ${email}`);

    // 1. Try Admin Login First (Cross-login support)
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        console.log(`[Auth] Admin detected in customer login: ${email}`);
        if (!admin.isActive) return ApiResponse.forbidden(res, 'Admin account is deactivated');
        const token = generateToken(admin._id, 'admin');
        return ApiResponse.success(res, {
          token,
          user: { _id: admin._id, name: admin.name, email: admin.email, role: 'admin', avatar: admin.avatar }
        }, 'Admin login successful');
      }
    }

    // 2. Try Customer Login
    const customer = await Customer.findOne({ email: email.toLowerCase() }).select('+password');
    if (!customer || !(await customer.comparePassword(password))) {
      console.log(`[Auth] Login failed for: ${email}`);
      return ApiResponse.unauthorized(res, 'Invalid email or password');
    }

    console.log(`[Auth] Customer logged in: ${email}`);
    const token = generateToken(customer._id, 'customer');
    ApiResponse.success(res, {
      token,
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        avatar: customer.avatar,
        address: customer.address,
        phone: customer.phone,
        securityHint: customer.securityHint
      }
    }, 'Login successful');
  } catch (error) {
    console.error('customerLogin error:', error);
    next(error);
  }
};

// ==================== WORKER AUTH ====================
exports.workerRegister = async (req, res, next) => {
  try {
    const { name, email, password, phone, profession, category, experience, hourlyRate, street, city, state, zip, securityHint } = req.body;
    
    if (!name || !email || !password || !phone || !profession || !securityHint) {
      return ApiResponse.badRequest(res, 'Please fill in all required fields including the Security Hint.');
    }

    const existing = await Worker.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
    if (existing) return ApiResponse.badRequest(res, 'Email or phone already registered');

    const workerData = {
      name, email: email.toLowerCase(), password, phone, profession,
      experience: parseInt(experience) || 0,
      pricing: { hourly: parseInt(hourlyRate) || 0, currency: '₹' },
      address: { street, city, state, zip },
      approvalStatus: 'pending',
      securityHint
    };

    if (category && category.trim() && category !== 'other') {
      workerData.category = category;
    }

    const worker = await Worker.create(workerData);
    ApiResponse.created(res, {
      worker: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        approvalStatus: worker.approvalStatus,
        securityHint: worker.securityHint
      }
    });
  } catch (error) {
    console.error('workerRegister error:', error);
    next(error);
  }
};

exports.workerLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return ApiResponse.badRequest(res, 'Please provide email and password');

    console.log(`[Auth] Worker login attempt for: ${email}`);

    // 1. Try Admin Login First
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (admin) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) {
        console.log(`[Auth] Admin detected in worker login: ${email}`);
        if (!admin.isActive) return ApiResponse.forbidden(res, 'Admin account is deactivated');
        const token = generateToken(admin._id, 'admin');
        return ApiResponse.success(res, {
          token,
          user: { _id: admin._id, name: admin.name, email: admin.email, role: 'admin', avatar: admin.avatar }
        }, 'Admin login successful');
      }
    }

    // 2. Try Worker Login
    const worker = await Worker.findOne({ email: email.toLowerCase() }).select('+password').populate('category', 'name slug');
    if (!worker || !(await worker.comparePassword(password))) {
      console.log(`[Auth] Worker login failed: ${email}`);
      return ApiResponse.unauthorized(res, 'Invalid email or password');
    }

    if (worker.approvalStatus === 'pending') return ApiResponse.forbidden(res, 'Account under review');
    if (worker.approvalStatus === 'suspended') return ApiResponse.forbidden(res, 'Account suspended');

    console.log(`[Auth] Worker logged in: ${email}`);
    const token = generateToken(worker._id, 'worker');
    ApiResponse.success(res, {
      token,
      user: {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        role: 'worker',
        avatar: worker.avatar,
        profession: worker.profession,
        phone: worker.phone,
        approvalStatus: worker.approvalStatus,
        securityHint: worker.securityHint
      }
    }, 'Login successful');
  } catch (error) {
    console.error('workerLogin error:', error);
    next(error);
  }
};

// ==================== FORGOT PASSWORD (HINT BASED) ====================

exports.checkAccountExists = async (req, res, next) => {
  try {
    const { identifier, role } = req.body;
    const queryVal = (identifier || '').trim();
    if (!queryVal) return ApiResponse.badRequest(res, 'Please enter registered email or phone number');

    const Model = role === 'worker' ? Worker : Customer;
    const user = await Model.findOne({
      $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
    });

    if (!user) {
      return ApiResponse.notFound(res, `Account not found as ${role}`);
    }

    ApiResponse.success(res, { exists: true }, 'Account found');
  } catch (error) {
    next(error);
  }
};

exports.verifyRegisterHint = async (req, res, next) => {
  try {
    const { identifier, hint, role } = req.body;
    const queryVal = (identifier || '').trim();
    if (!queryVal) return ApiResponse.badRequest(res, 'Please enter registered email or phone number');
    if (!hint || !hint.trim()) return ApiResponse.badRequest(res, 'Please enter your recovery hint');

    const Model = role === 'worker' ? Worker : Customer;
    const user = await Model.findOne({
      $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
    });

    if (!user) {
      return ApiResponse.notFound(res, `Account not found as ${role}`);
    }

    const savedHint = (user.securityHint || '').trim().toLowerCase();
    const inputHint = hint.trim().toLowerCase();

    if (!savedHint || savedHint !== inputHint) {
      return ApiResponse.badRequest(res, 'Incorrect recovery hint. Verification failed.');
    }

    ApiResponse.success(res, { verified: true }, 'Recovery hint verified successfully.');
  } catch (error) {
    next(error);
  }
};

exports.resetPasswordWithHint = async (req, res, next) => {
  try {
    const { identifier, hint, newPassword, role } = req.body;
    const queryVal = (identifier || '').trim();
    if (!queryVal) return ApiResponse.badRequest(res, 'Please enter registered email or phone number');
    if (!newPassword || newPassword.length < 6) return ApiResponse.badRequest(res, 'Password must be at least 6 characters');

    const Model = role === 'worker' ? Worker : Customer;
    const user = await Model.findOne({
      $or: [{ phone: queryVal }, { email: queryVal.toLowerCase() }]
    });

    if (!user) {
      return ApiResponse.notFound(res, 'Account not found');
    }

    const savedHint = (user.securityHint || '').trim().toLowerCase();
    const inputHint = (hint || '').trim().toLowerCase();

    if (savedHint && savedHint !== inputHint) {
      return ApiResponse.badRequest(res, 'Recovery hint verification failed. Password reset aborted.');
    }

    user.password = newPassword;
    await user.save();

    ApiResponse.success(res, null, 'Password reset successful. You can now login with your new password.');
  } catch (error) {
    next(error);
  }
};

// ==================== SHARED ====================

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const role = req.userRole;
    let userData;

    if (role === 'admin') {
      userData = { _id: user._id, name: user.name, email: user.email, role: 'admin', avatar: user.avatar };
    } else if (role === 'customer') {
      userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'customer',
        avatar: user.avatar,
        address: user.address,
        securityHint: user.securityHint
      };
    } else if (role === 'worker') {
      const worker = await Worker.findById(user._id).populate('category', 'name slug icon');
      userData = {
        _id: worker._id,
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        role: 'worker',
        avatar: worker.avatar,
        profession: worker.profession,
        category: worker.category,
        approvalStatus: worker.approvalStatus,
        securityHint: worker.securityHint
      };
    }
    ApiResponse.success(res, { user: userData });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { _id, role } = req.user;
    let Model;
    if (role === 'admin') Model = Admin;
    else if (role === 'worker') Model = Worker;
    else Model = Customer;

    const userDoc = await Model.findById(_id).select('+password');
    if (!userDoc || !(await userDoc.comparePassword(currentPassword))) {
      return ApiResponse.unauthorized(res, 'Incorrect current password');
    }
    userDoc.password = newPassword;
    await userDoc.save();
    ApiResponse.success(res, null, 'Password updated');
  } catch (error) {
    next(error);
  }
};
