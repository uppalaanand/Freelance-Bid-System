const Review = require('../models/Review');
const Project = require('../models/Project');

/**
 * @desc    Create a review for a completed project
 * @route   POST /api/reviews
 * @access  Private (client only)
 */
const createReview = async (req, res, next) => {
  try {
    const { project: projectId, reviewee, rating, comment } = req.body;

    // Verify the project exists
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify the project is completed
    if (project.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed projects',
      });
    }

    // Verify the reviewer is the project client
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the project client can create a review',
      });
    }

    // Check if a review already exists for this project by this reviewer
    const existingReview = await Review.findOne({
      project: projectId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this project',
      });
    }

    // Create the review — post-save hook will trigger calcAverageRating
    const review = await Review.create({
      project: projectId,
      reviewer: req.user._id,
      reviewee,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews for a specific student
 * @route   GET /api/reviews/student/:studentId
 * @access  Public
 */
const getStudentReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.studentId })
      .populate('reviewer', 'fullName avatar')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get review for a specific project
 * @route   GET /api/reviews/project/:projectId
 * @access  Private
 */
const getProjectReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ project: req.params.projectId })
      .populate('reviewer', 'fullName avatar')
      .populate('reviewee', 'fullName avatar');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'No review found for this project',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getStudentReviews,
  getProjectReview,
};
