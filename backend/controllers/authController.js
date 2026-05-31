const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const { ErrorResponse } = require('../middleware/errorHandler');
const { sendTokenResponse } = require('../utils/sendToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    // Validate role is student or client
    if (!['student', 'client'].includes(role)) {
      return next(new ErrorResponse('Role must be either student or client', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('A user with this email already exists', 400));
    }

    // Create user document
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role,
    });

    // Create role-specific profile
    if (role === 'student') {
      await StudentProfile.create({ user: user._id });
    } else if (role === 'client') {
      await ClientProfile.create({ user: user._id });
    }

    // Send token response with HTTP-only cookie
    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email with password field included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user account is active
    if (!user.isActive) {
      return next(new ErrorResponse('Your account has been deactivated. Please contact support.', 403));
    }

    // Send token response with HTTP-only cookie
    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user (clear cookie)
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(0),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, logout, getMe };
