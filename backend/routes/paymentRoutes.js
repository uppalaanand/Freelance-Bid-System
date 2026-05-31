const express = require('express');
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getProjectPayments,
  releasePayment,
  getMyEarnings,
  getMyPayments,
} = require('../controllers/paymentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Payment routes
router.post('/create-order', protect, authorize('client'), createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/project/:projectId', protect, getProjectPayments);
router.put('/:id/release', protect, authorize('client'), releasePayment);
router.get('/my-earnings', protect, authorize('student'), getMyEarnings);
router.get('/my-payments', protect, authorize('client', 'student'), getMyPayments);

module.exports = router;
