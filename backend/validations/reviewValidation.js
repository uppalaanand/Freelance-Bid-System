const { body } = require('express-validator');

/**
 * Validation chain for creating a review
 */
const createReviewValidation = [
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Project must be a valid MongoDB ObjectId'),

  body('reviewee')
    .notEmpty()
    .withMessage('Reviewee ID is required')
    .isMongoId()
    .withMessage('Reviewee must be a valid MongoDB ObjectId'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be at most 500 characters'),
];

module.exports = { createReviewValidation };
