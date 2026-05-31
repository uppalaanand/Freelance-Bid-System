const crypto = require('crypto');
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');
const StudentProfile = require('../models/StudentProfile');
const ClientProfile = require('../models/ClientProfile');
const razorpay = require('../config/razorpay');
const { createNotification } = require('../utils/createNotification');

/**
 * @desc    Create a Razorpay order
 * @route   POST /api/payments/create-order
 * @access  Private (client)
 */
const createOrder = async (req, res) => {
  try {
    const { amount, projectId, milestoneId, type } = req.body;

    if (!amount || !projectId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide amount, projectId, and type',
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Verify requester is the project client
    if (project.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create payment for this project',
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });

    // Create Payment document
    const payment = await Payment.create({
      project: projectId,
      milestone: milestoneId || undefined,
      payer: req.user._id,
      payee: project.assignedStudent,
      amount,
      type,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      order: razorpayOrder,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields',
      });
    }

    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      // Update payment status to failed
      await Payment.findByIdAndUpdate(paymentId, {
        $set: { status: 'failed' },
      });

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Update payment document with verified details
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'paid',
        },
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // If payment is linked to a milestone, update milestone status
    if (payment.milestone) {
      await Milestone.findByIdAndUpdate(payment.milestone, {
        $set: { status: 'paid' },
      });
    }

    // Create notification for the student (payee)
    await createNotification({
      user: payment.payee,
      type: 'payment_released',
      title: 'Payment Received',
      message: `A payment of ₹${payment.amount} has been received for your project.`,
      link: `/projects/${payment.project}`,
      relatedUser: payment.payer,
      relatedProject: payment.project,
    });

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all payments for a project
 * @route   GET /api/payments/project/:projectId
 * @access  Private
 */
const getProjectPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ project: req.params.projectId })
      .populate('milestone', 'title')
      .populate('payer', 'fullName')
      .populate('payee', 'fullName');

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Release a payment to the student
 * @route   PUT /api/payments/:id/release
 * @access  Private (client)
 */
const releasePayment = async (req, res) => {
  try {
    let payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    // Verify requester is the payer (client)
    if (payment.payer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to release this payment',
      });
    }

    // Update payment status to released
    payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'released' } },
      { new: true }
    );

    // Update student's total earnings
    await StudentProfile.findOneAndUpdate(
      { user: payment.payee },
      { $inc: { totalEarnings: payment.amount } }
    );

    // Update client's total spent
    await ClientProfile.findOneAndUpdate(
      { user: payment.payer },
      { $inc: { totalSpent: payment.amount } }
    );

    // Create notification for the student
    await createNotification({
      user: payment.payee,
      type: 'payment_released',
      title: 'Payment Released',
      message: `A payment of ₹${payment.amount} has been released to your account.`,
      link: `/projects/${payment.project}`,
      relatedUser: req.user._id,
      relatedProject: payment.project,
    });

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get student's earnings summary
 * @route   GET /api/payments/my-earnings
 * @access  Private (student)
 */
const getMyEarnings = async (req, res) => {
  try {
    // Get all payments where the student is the payee
    const payments = await Payment.find({ payee: req.user._id })
      .populate('project', 'title')
      .populate('payer', 'fullName')
      .populate('milestone', 'title');

    // Calculate totals
    const released = payments
      .filter((p) => p.status === 'released')
      .reduce((sum, p) => sum + p.amount, 0);

    const pending = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const total = released + pending;

    res.status(200).json({
      success: true,
      total,
      released,
      pending,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get client's payment history
 * @route   GET /api/payments/my-payments
 * @access  Private (client)
 */
const getMyPayments = async (req, res) => {
  try {
    const isStudent = req.user.role === 'student';
    const query = isStudent ? { payee: req.user._id } : { payer: req.user._id };
    const populateField = isStudent ? 'payer' : 'payee';

    const payments = await Payment.find(query)
      .populate('project', 'title')
      .populate(populateField, 'fullName')
      .populate('milestone', 'title');

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getProjectPayments,
  releasePayment,
  getMyEarnings,
  getMyPayments,
};
