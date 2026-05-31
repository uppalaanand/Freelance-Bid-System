const express = require('express');
const router = express.Router();

const {
  submitBid,
  getMyBids,
  getProjectBids,
  acceptBid,
  rejectBid,
} = require('../controllers/bidController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');
const { createBidValidation } = require('../validations/bidValidation');

// POST /api/bids - Student only
router.post('/', protect, authorize('student'), createBidValidation, validate, submitBid);

// GET /api/bids/my-bids - Student only
router.get('/my-bids', protect, authorize('student'), getMyBids);

// GET /api/bids/project/:projectId - Client and Student
router.get('/project/:projectId', protect, authorize('client', 'student'), getProjectBids);

// PUT /api/bids/:id/accept - Client only (project owner)
router.put('/:id/accept', protect, authorize('client'), acceptBid);

// PUT /api/bids/:id/reject - Client only (project owner)
router.put('/:id/reject', protect, authorize('client'), rejectBid);

module.exports = router;
