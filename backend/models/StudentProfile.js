const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        field: { type: String, trim: true },
        startYear: { type: Number },
        endYear: { type: Number },
      },
    ],
    experience: [
      {
        title: { type: String, trim: true },
        company: { type: String, trim: true },
        description: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    portfolio: [
      {
        title: { type: String, trim: true },
        description: { type: String },
        link: { type: String },
        image: {
          public_id: { type: String },
          url: { type: String },
        },
      },
    ],
    resume: {
      public_id: { type: String },
      url: { type: String },
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    availability: {
      type: String,
      enum: {
        values: ['available', 'busy', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'available',
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
    },
    github: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
