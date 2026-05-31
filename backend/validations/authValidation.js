const { body } = require('express-validator');

/**
 * Validation chain for user registration
 */
const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone')
    .optional({ values: 'falsy' })
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['student', 'client'])
    .withMessage('Role must be either student or client'),
];

/**
 * Validation chain for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

module.exports = { registerValidation, loginValidation };
