const Bid = require('../models/Bid');
const Project = require('../models/Project');
const Chat = require('../models/Chat');
const StudentProfile = require('../models/StudentProfile');
const { ErrorResponse } = require('../middleware/errorHandler');
const { createNotification } = require('../utils/createNotification');

/**
 * @desc    Submit a bid on a project
 * @route   POST /api/bids
 * @access  Private (Student)
 */
const submitBid = async (req, res, next) => {
  try {
    const { project: projectId, amount, coverLetter, estimatedTime, portfolioLinks } = req.body;
    const studentId = req.user._id;

    // Check project exists and is open
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    if (project.status !== 'open') {
      return next(new ErrorResponse('This project is not accepting bids', 400));
    }

    // Check student is not the project client
    if (project.client.toString() === studentId.toString()) {
      return next(new ErrorResponse('You cannot bid on your own project', 400));
    }

    // Check student hasn't already bid on this project
    const existingBid = await Bid.findOne({ project: projectId, student: studentId });
    if (existingBid) {
      return next(new ErrorResponse('You have already submitted a bid for this project', 400));
    }

    // Create the bid
    const bid = await Bid.create({
      project: projectId,
      student: studentId,
      amount,
      coverLetter,
      estimatedTime,
      portfolioLinks: portfolioLinks || [],
    });

    // Increment project bidCount
    await Project.findByIdAndUpdate(projectId, { $inc: { bidCount: 1 } });

    // Create notification for the project client
    await createNotification({
      user: project.client,
      type: 'new_bid',
      title: 'New bid received',
      message: `A new bid of ₹${amount} has been submitted on your project "${project.title}".`,
      link: `/projects/${project._id}`,
      relatedUser: studentId,
      relatedProject: project._id,
    });

    res.status(201).json({
      success: true,
      bid,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all bids for a project (client only)
 * @route   GET /api/bids/project/:projectId
 * @access  Private (Client - project owner)
 */
const getProjectBids = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ErrorResponse('Project not found', 404));
    }

    let query = {};
    if (req.user.role === 'client') {
      if (project.client.toString() !== req.user._id.toString()) {
        return next(new ErrorResponse('Not authorized to view bids for this project', 403));
      }
      query = { project: projectId };
    } else if (req.user.role === 'student') {
      query = { project: projectId, student: req.user._id };
    } else {
      return next(new ErrorResponse('Not authorized to view bids for this project', 403));
    }

    // Find bids and populate student info
    const bids = await Bid.find(query)
      .populate('student', 'fullName avatar email')
      .sort('-createdAt');

    // Attach student profile data to each bid
    const bidsWithProfiles = await Promise.all(
      bids.map(async (bid) => {
        const bidObj = bid.toObject();
        if (bid.student && bid.student._id) {
          const studentProfile = await StudentProfile.findOne({ user: bid.student._id })
            .select('skills rating reviewCount completedProjects hourlyRate bio availability');
          bidObj.studentProfile = studentProfile || null;
        }
        return bidObj;
      })
    );

    res.status(200).json({
      success: true,
      bids: bidsWithProfiles,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get bids submitted by the logged-in student
 * @route   GET /api/bids/my-bids
 * @access  Private (Student)
 */
const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ student: req.user._id })
      .populate('project', 'title status budget deadline client')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      bids,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Accept a bid
 * @route   PUT /api/bids/:id/accept
 * @access  Private (Client - project owner)
 */
const acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return next(new ErrorResponse('Bid not found', 404));
    }

    // Fetch the project and check ownership
    const project = await Project.findById(bid.project);
    if (!project) {
      return next(new ErrorResponse('Associated project not found', 404));
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to accept bids for this project', 403));
    }

    if (project.status !== 'open') {
      return next(new ErrorResponse('This project is no longer accepting bids', 400));
    }

    if (bid.status !== 'pending') {
      return next(new ErrorResponse('This bid has already been processed', 400));
    }

    // Accept the bid
    bid.status = 'accepted';
    await bid.save();

    // Update project: assign student, set selected bid, change status
    project.assignedStudent = bid.student;
    project.selectedBid = bid._id;
    project.status = 'assigned';
    await project.save();

    // Reject all other pending bids for this project
    const rejectedBids = await Bid.find({
      project: project._id,
      _id: { $ne: bid._id },
      status: 'pending',
    });

    await Bid.updateMany(
      { project: project._id, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected' }
    );

    // Create notification for the accepted student
    await createNotification({
      user: bid.student,
      type: 'bid_accepted',
      title: 'Your bid has been accepted',
      message: `Your bid on the project "${project.title}" has been accepted!`,
      link: `/projects/${project._id}`,
      relatedUser: req.user._id,
      relatedProject: project._id,
    });

    // Create notifications for rejected students
    for (const rejectedBid of rejectedBids) {
      await createNotification({
        user: rejectedBid.student,
        type: 'bid_rejected',
        title: 'Your bid has been rejected',
        message: `Your bid on the project "${project.title}" has been rejected.`,
        link: `/projects/${project._id}`,
        relatedUser: req.user._id,
        relatedProject: project._id,
      });
    }

    // Create a Chat between client and student for this project
    await Chat.create({
      participants: [req.user._id, bid.student],
      project: project._id,
    });

    // Re-fetch bid with populated student
    const updatedBid = await Bid.findById(bid._id)
      .populate('student', 'fullName avatar email')
      .populate('project', 'title status');

    res.status(200).json({
      success: true,
      bid: updatedBid,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Reject a bid
 * @route   PUT /api/bids/:id/reject
 * @access  Private (Client - project owner)
 */
const rejectBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
      return next(new ErrorResponse('Bid not found', 404));
    }

    // Fetch the project and check ownership
    const project = await Project.findById(bid.project);
    if (!project) {
      return next(new ErrorResponse('Associated project not found', 404));
    }

    if (project.client.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to reject bids for this project', 403));
    }

    if (bid.status !== 'pending') {
      return next(new ErrorResponse('This bid has already been processed', 400));
    }

    // Reject the bid
    bid.status = 'rejected';
    await bid.save();

    // Create notification for the rejected student
    await createNotification({
      user: bid.student,
      type: 'bid_rejected',
      title: 'Your bid has been rejected',
      message: `Your bid on the project "${project.title}" has been rejected.`,
      link: `/projects/${project._id}`,
      relatedUser: req.user._id,
      relatedProject: project._id,
    });

    res.status(200).json({
      success: true,
      bid,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitBid,
  getProjectBids,
  getMyBids,
  acceptBid,
  rejectBid,
};
