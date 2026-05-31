const { body } = require('express-validator');

/**
 * Validation chain for creating a milestone
 */
const createMilestoneValidation = [
  body('project')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Project must be a valid MongoDB ObjectId'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Milestone title is required'),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return true;
    }),

  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isNumeric()
    .withMessage('Order must be a number'),
];

module.exports = { createMilestoneValidation };
