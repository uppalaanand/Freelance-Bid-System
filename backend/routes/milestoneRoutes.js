const express = require('express');
const router = express.Router();

const {
  getProjectMilestones,
  createMilestone,
  updateMilestone,
  submitMilestone,
  approveMilestone,
} = require('../controllers/milestoneController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const {
  createMilestoneValidation,
} = require('../validations/milestoneValidation');

// Milestone routes
router.get('/project/:projectId', protect, getProjectMilestones);
router.post(
  '/',
  protect,
  authorize('client'),
  createMilestoneValidation,
  validate,
  createMilestone
);
router.put('/:id', protect, updateMilestone);
router.put('/:id/submit', protect, authorize('student'), submitMilestone);
router.put('/:id/approve', protect, authorize('client'), approveMilestone);

module.exports = router;
