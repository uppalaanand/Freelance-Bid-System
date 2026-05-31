const { body } = require('express-validator');

/**
 * Validation chain for updating a student profile
 */
const updateStudentProfileValidation = [
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be at most 500 characters'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),

  body('skills.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Each skill must not be empty'),

  body('hourlyRate')
    .optional()
    .isNumeric()
    .withMessage('Hourly rate must be a number'),
];

/**
 * Validation chain for updating a client profile
 */
const updateClientProfileValidation = [
  body('company')
    .optional()
    .trim(),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be at most 500 characters'),

  body('website')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage('Website must be a valid URL'),
];

module.exports = { updateStudentProfileValidation, updateClientProfileValidation };
