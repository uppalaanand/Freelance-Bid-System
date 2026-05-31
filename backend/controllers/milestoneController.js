const Milestone = require('../models/Milestone');
const Project = require('../models/Project');
const { createNotification } = require('../utils/createNotification');

/**
 * @desc    Get all milestones for a project
 * @route   GET /api/milestones/project/:projectId
 * @access  Private (project client or assigned student)
 */
const getProjectMilestones = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify requester is the project client or the assigned student
    const isClient = project.client.toString() === req.user._id.toString();
    const isAssignedStudent =
      project.assignedStudent &&
      project.assignedStudent.toString() === req.user._id.toString();

    if (!isClient && !isAssignedStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view milestones for this project',
      });
    }

    const milestones = await Milestone.find({
      project: req.params.projectId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      milestones,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a milestone
 * @route   POST /api/milestones
 * @access  Private (client)
 */
const createMilestone = async (req, res) => {
  try {
    const { project: projectId, title, description, amount, order, dueDate } =
      req.body;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify requester is the project client
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create milestones for this project',
      });
    }

    // Verify project status is 'assigned'
    if (project.status !== 'assigned') {
      return res.status(400).json({
        success: false,
        message: 'Milestones can only be created for assigned projects',
      });
    }

    const milestone = await Milestone.create({
      project: projectId,
      title,
      description,
      amount,
      order,
      dueDate,
    });

    res.status(201).json({
      success: true,
      milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Update a milestone
 * @route   PUT /api/milestones/:id
 * @access  Private (project client or assigned student)
 */
const updateMilestone = async (req, res) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found',
      });
    }

    // Verify requester is the project client or the assigned student
    const isClient = project.client.toString() === req.user._id.toString();
    const isAssignedStudent =
      project.assignedStudent &&
      project.assignedStudent.toString() === req.user._id.toString();

    if (!isClient && !isAssignedStudent) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this milestone',
      });
    }

    // Only allow updating specific fields
    const { title, description, amount, dueDate, status } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (status !== undefined) updateData.status = status;

    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Submit a milestone (student marks as submitted)
 * @route   PUT /api/milestones/:id/submit
 * @access  Private (student)
 */
const submitMilestone = async (req, res) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found',
      });
    }

    // Verify requester is the assigned student
    if (
      !project.assignedStudent ||
      project.assignedStudent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this milestone',
      });
    }

    // Update milestone status and submission data
    const { submissionNote, submissionAttachments } = req.body;
    const updateData = { status: 'submitted' };
    if (submissionNote !== undefined) updateData.submissionNote = submissionNote;
    if (submissionAttachments !== undefined)
      updateData.submissionAttachments = submissionAttachments;

    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Create notification for the project client
    await createNotification({
      user: project.client,
      type: 'milestone_submitted',
      title: 'Milestone Submitted',
      message: `A milestone "${milestone.title}" has been submitted for review.`,
      link: `/projects/${project._id}/milestones`,
      relatedUser: req.user._id,
      relatedProject: project._id,
    });

    res.status(200).json({
      success: true,
      milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Approve a milestone (client marks as approved)
 * @route   PUT /api/milestones/:id/approve
 * @access  Private (client)
 */
const approveMilestone = async (req, res) => {
  try {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    const project = await Project.findById(milestone.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Associated project not found',
      });
    }

    // Verify requester is the project client
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to approve this milestone',
      });
    }

    milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'approved' } },
      { new: true, runValidators: true }
    );

    // Create notification for the assigned student
    await createNotification({
      user: project.assignedStudent,
      type: 'milestone_approved',
      title: 'Milestone Approved',
      message: `Your milestone "${milestone.title}" has been approved.`,
      link: `/projects/${project._id}/milestones`,
      relatedUser: req.user._id,
      relatedProject: project._id,
    });

    res.status(200).json({
      success: true,
      milestone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  submitMilestone,
  approveMilestone,
};
