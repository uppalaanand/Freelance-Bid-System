const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer reference is required'],
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewee reference is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per reviewer per project
ReviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

// Index for fetching all reviews for a user
ReviewSchema.index({ reviewee: 1 });

/**
 * Static method to calculate the average rating for a user
 * and update their profile (StudentProfile or ClientProfile).
 */
ReviewSchema.statics.calcAverageRating = async function (userId) {
  const result = await this.aggregate([
    { $match: { reviewee: userId } },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const stats =
    result.length > 0
      ? {
          rating: Math.round(result[0].averageRating * 10) / 10,
          reviewCount: result[0].reviewCount,
        }
      : { rating: 0, reviewCount: 0 };

  // Attempt to update both profile types — only one will match
  const StudentProfile = mongoose.model('StudentProfile');
  const ClientProfile = mongoose.model('ClientProfile');

  await Promise.all([
    StudentProfile.findOneAndUpdate(
      { user: userId },
      { rating: stats.rating, reviewCount: stats.reviewCount }
    ),
    ClientProfile.findOneAndUpdate(
      { user: userId },
      { rating: stats.rating, reviewCount: stats.reviewCount }
    ),
  ]);

  return stats;
};

// Recalculate rating after save
ReviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.reviewee);
});

// Recalculate rating after remove
ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calcAverageRating(doc.reviewee);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
