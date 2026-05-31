const Project = require('../models/Project');
const Bid = require('../models/Bid');
const ClientProfile = require('../models/ClientProfile');
const StudentProfile = require('../models/StudentProfile');
const { ErrorResponse } = require('../middleware/errorHandler');
const { createNotification } = require('../utils/createNotification');

/**
 * @desc    Get all projects with filtering, search, and pagination
 * @route   GET /api/projects
 * @access  Public
 */
const getProjects = async (req, res, next) => {
  try {
    const {
      search,
      category,
      skills,
      status,
      experienceLevel,
      budgetMin,
      budgetMax,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    // Build query object
    const query = {};

    // Text search on title and description using regex
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by skills (comma-separated)
    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        query.skills = { $in: skillsArray };
      }
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by experience level
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    // Filter by budget range
    if (budgetMin || budgetMax) {
      query['budget.min'] = query['budget.min'] || {};
      query['budget.max'] = query['budget.max'] || {};

      if (budgetMin) {
        query['budget.min'] = { $gte: Number(budgetMin) };
      }
      if (budgetMax) {
        query['budget.max'] = { $lte: Number(budgetMax) };
      }
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination metadata
    const total = await Project.countDocuments(query);

    // Execute query
    const projects = await Project.find(query)
      .populate('client', 'fullName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      projects,
      totalPages,
      currentPage: pageNum,
      total,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Public
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'fullName email avatar')
      .populate('assignedStudent', 'fullName avatar');

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Client)
 */
const createProject = async (req, res, next) => {
  try {
    // Set client to the authenticated user
    req.body.client = req.user._id;

    const project = await Project.create(req.body);

    // Increment projectsPosted on the client profile
    await ClientProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { projectsPosted: 1 } }
    );

    res.status(201).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private (Client - owner only)
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check ownership
    if (project.client.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to update this project', 403));
    }

    // Can only update if status is open
    if (project.status !== 'open') {
      return next(new ErrorResponse('Can only update projects with open status', 400));
    }

    // Update fields
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (Client - owner only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check ownership
    if (project.client.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to delete this project', 403));
    }

    // Can only delete if status is open
    if (project.status !== 'open') {
      return next(new ErrorResponse('Can only delete projects with open status', 400));
    }

    // Delete all associated bids
    await Bid.deleteMany({ project: project._id });

    // Delete the project
    await Project.findByIdAndDelete(project._id);

    // Decrement projectsPosted on the client profile
    await ClientProfile.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { projectsPosted: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get projects created by the logged-in client
 * @route   GET /api/projects/my-projects
 * @access  Private (Client)
 */
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ client: req.user._id })
      .populate('assignedStudent', 'fullName avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Assign a student to a project
 * @route   PUT /api/projects/:id/assign/:studentId
 * @access  Private (Client - owner only)
 */
const assignStudent = async (req, res, next) => {
  try {
    const { id, studentId } = req.params;

    let project = await Project.findById(id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check ownership
    if (project.client.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to assign students to this project', 403));
    }

    // Check project status is open
    if (project.status !== 'open') {
      return next(new ErrorResponse('Can only assign students to projects with open status', 400));
    }

    // Assign student and update status
    project.assignedStudent = studentId;
    project.status = 'assigned';
    await project.save();

    // Reject all other bids for this project
    await Bid.updateMany(
      { project: project._id, student: { $ne: studentId } },
      { status: 'rejected' }
    );

    // Create notification for the assigned student
    await createNotification({
      user: studentId,
      type: 'project_assigned',
      title: 'You have been assigned to a project',
      message: `You have been assigned to the project "${project.title}".`,
      link: `/projects/${project._id}`,
      relatedUser: req.user._id,
      relatedProject: project._id,
    });

    // Re-fetch with populated fields
    project = await Project.findById(id)
      .populate('client', 'fullName email avatar')
      .populate('assignedStudent', 'fullName avatar');

    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get projects assigned to the logged-in student
 * @route   GET /api/projects/assigned
 * @access  Private (Student)
 */
const getAssignedProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ assignedStudent: req.user._id })
      .populate('client', 'fullName avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Mark a project as completed
 * @route   PUT /api/projects/:id/complete
 * @access  Private (Client - owner only)
 */
const completeProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    // Check if user is the client owner
    if (project.client.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to complete this project', 403));
    }

    // Project must be in assigned status to be completed
    if (project.status !== 'assigned') {
      return next(new ErrorResponse('Only assigned projects can be marked as completed', 400));
    }

    // Set status to completed
    project.status = 'completed';
    await project.save();

    // Increment student's completedProjects count
    if (project.assignedStudent) {
      await StudentProfile.findOneAndUpdate(
        { user: project.assignedStudent },
        { $inc: { completedProjects: 1 } }
      );

      // Create notification for the student
      await createNotification({
        user: project.assignedStudent,
        type: 'project_assigned',
        title: 'Project completed',
        message: `The project "${project.title}" has been marked as completed.`,
        link: `/projects/${project._id}`,
        relatedUser: req.user._id,
        relatedProject: project._id,
      });
    }

    // Re-fetch with populated fields
    project = await Project.findById(req.params.id)
      .populate('client', 'fullName email avatar')
      .populate('assignedStudent', 'fullName avatar');

    res.status(200).json({
      success: true,
      project,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getMyProjects,
  assignStudent,
  getAssignedProjects,
  completeProject,
};
