const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createReviewValidation } = require('../validations/reviewValidation');
const {
  createReview,
  getStudentReviews,
  getProjectReview,
} = require('../controllers/reviewController');

router.post(
  '/',
  protect,
  authorize('client'),
  createReviewValidation,
  validate,
  createReview
);

// Public route — no auth needed
router.get('/student/:studentId', getStudentReviews);

router.get('/project/:projectId', protect, getProjectReview);

module.exports = router;
