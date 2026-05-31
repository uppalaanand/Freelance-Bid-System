const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer reference is required'],
    },
    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payee reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a payment amount'],
      min: [0, 'Amount cannot be negative'],
    },
    type: {
      type: String,
      enum: {
        values: ['advance', 'milestone', 'final'],
        message: '{VALUE} is not a valid payment type',
      },
      required: [true, 'Please specify a payment type'],
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'released', 'failed'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching payments by project
PaymentSchema.index({ project: 1 });
PaymentSchema.index({ payer: 1 });
PaymentSchema.index({ payee: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
