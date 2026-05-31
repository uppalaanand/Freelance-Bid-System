const { body } = require('express-validator');

/**
 * Validation chain for creating a bid
 */
const createBidValidation = [
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Project must be a valid MongoDB ObjectId'),

  body('amount')
    .notEmpty()
    .withMessage('Bid amount is required')
    .isNumeric()
    .withMessage('Bid amount must be a number')
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error('Bid amount must be greater than 0');
      }
      return true;
    }),

  body('coverLetter')
    .trim()
    .notEmpty()
    .withMessage('Cover letter is required')
    .isLength({ min: 20, max: 1000 })
    .withMessage('Cover letter must be between 20 and 1000 characters'),

  body('estimatedTime')
    .trim()
    .notEmpty()
    .withMessage('Estimated time is required'),
];

module.exports = { createBidValidation };
