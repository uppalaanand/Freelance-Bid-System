const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a milestone title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please provide a milestone amount'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'submitted', 'approved', 'paid'],
        message: '{VALUE} is not a valid milestone status',
      },
      default: 'pending',
    },
    order: {
      type: Number,
      required: [true, 'Please provide the milestone order'],
    },
    dueDate: {
      type: Date,
    },
    submissionNote: {
      type: String,
      trim: true,
    },
    submissionAttachments: [
      {
        filename: { type: String },
        url: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fetching milestones by project in order
MilestoneSchema.index({ project: 1, order: 1 });

module.exports = mongoose.model('Milestone', MilestoneSchema);
