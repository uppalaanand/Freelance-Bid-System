const User = require('../models/User');
const Project = require('../models/Project');
const Bid = require('../models/Bid');
const Milestone = require('../models/Milestone');
const Payment = require('../models/Payment');
const Category = require('../models/Category');

// ──────────────────────── User Management ────────────────────────

/**
 * @desc    Get all users with filtering, search, and pagination
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      role,
      isActive,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Soft-delete (deactivate) a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'User deactivated',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle a user's active status
 * @route   PUT /api/admin/users/:id/toggle-status
 * @access  Private (admin)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────── Project Management ────────────────────────

/**
 * @desc    Get all projects with filtering and pagination (admin)
 * @route   GET /api/admin/projects
 * @access  Private (admin)
 */
const getProjects = async (req, res, next) => {
  try {
    const {
      status,
      category,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('client', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      projects,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project and all associated data
 * @route   DELETE /api/admin/projects/:id
 * @access  Private (admin)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Delete associated data in parallel
    await Promise.all([
      Bid.deleteMany({ project: req.params.id }),
      Milestone.deleteMany({ project: req.params.id }),
      Payment.deleteMany({ project: req.params.id }),
      Project.findByIdAndDelete(req.params.id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────── Payment Management ────────────────────────

/**
 * @desc    Get all payments with pagination
 * @route   GET /api/admin/payments
 * @access  Private (admin)
 */
const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate('project', 'title')
      .populate('payer', 'fullName')
      .populate('payee', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      payments,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────── Dashboard Stats ────────────────────────

/**
 * @desc    Get platform statistics for admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 */
const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalClients,
      openProjects,
      assignedProjects,
      completedProjects,
      closedProjects,
      totalBids,
      paymentAggregation,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'client' }),
      Project.countDocuments({ status: 'open' }),
      Project.countDocuments({ status: 'assigned' }),
      Project.countDocuments({ status: 'completed' }),
      Project.countDocuments({ status: 'closed' }),
      Bid.countDocuments(),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    const totalPaymentsAmount =
      paymentAggregation.length > 0 ? paymentAggregation[0].totalAmount : 0;

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          clients: totalClients,
        },
        projects: {
          open: openProjects,
          assigned: assignedProjects,
          completed: completedProjects,
          closed: closedProjects,
          total: openProjects + assignedProjects + completedProjects + closedProjects,
        },
        totalPaymentsAmount,
        totalBids,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ──────────────────────── Category CRUD ────────────────────────

/**
 * @desc    Get all categories
 * @route   GET /api/admin/categories
 * @access  Private (admin)
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/admin/categories
 * @access  Private (admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const category = await Category.create({ name, description, icon });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a category
 * @route   PUT /api/admin/categories/:id
 * @access  Private (admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/admin/categories/:id
 * @access  Private (admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  deleteUser,
  toggleUserStatus,
  getProjects,
  deleteProject,
  getPayments,
  getStats,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
