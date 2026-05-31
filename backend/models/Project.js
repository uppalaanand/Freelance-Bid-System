const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
    },
    budget: {
      min: {
        type: Number,
        min: [0, 'Minimum budget cannot be negative'],
      },
      max: {
        type: Number,
        min: [0, 'Maximum budget cannot be negative'],
      },
    },
    category: {
      type: String,
      required: [true, 'Please specify a project category'],
      trim: true,
    },
    skills: {
      type: [String],
      required: [true, 'Please specify required skills'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one skill is required',
      },
    },
    deadline: {
      type: Date,
    },
    attachments: [
      {
        filename: { type: String },
        url: { type: String },
        public_id: { type: String },
      },
    ],
    experienceLevel: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'expert'],
        message: '{VALUE} is not a valid experience level',
      },
      default: 'beginner',
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'assigned', 'completed', 'closed'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'open',
    },
    assignedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bidCount: {
      type: Number,
      default: 0,
    },
    selectedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ skills: 1 });
ProjectSchema.index({ client: 1, status: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
