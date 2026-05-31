const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a bid amount'],
      min: [0, 'Bid amount cannot be negative'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Please provide a cover letter'],
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'Please provide an estimated completion time'],
      trim: true,
    },
    portfolioLinks: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid bid status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one bid per student per project
BidSchema.index({ project: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Bid', BidSchema);
