const { body } = require('express-validator');

/**
 * Validation chain for creating a project
 */
const createProjectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('budget.min')
    .notEmpty()
    .withMessage('Minimum budget is required')
    .isNumeric()
    .withMessage('Minimum budget must be a number'),

  body('budget.max')
    .notEmpty()
    .withMessage('Maximum budget is required')
    .isNumeric()
    .withMessage('Maximum budget must be a number'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),

  body('skills')
    .isArray({ min: 1 })
    .withMessage('Skills must be a non-empty array'),

  body('skills.*')
    .trim()
    .notEmpty()
    .withMessage('Each skill must not be empty'),

  body('deadline')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date'),

  body('experienceLevel')
    .optional({ values: 'falsy' })
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, or expert'),
];

/**
 * Validation chain for updating a project (all fields optional)
 */
const updateProjectValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),

  body('budget.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number'),

  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category must not be empty if provided'),

  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Skills must be a non-empty array'),

  body('skills.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each skill must not be empty'),

  body('deadline')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('Deadline must be a valid ISO 8601 date'),

  body('experienceLevel')
    .optional({ values: 'falsy' })
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Experience level must be beginner, intermediate, or expert'),
];

module.exports = { createProjectValidation, updateProjectValidation };
