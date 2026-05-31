const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'new_bid',
          'bid_accepted',
          'bid_rejected',
          'project_assigned',
          'new_message',
          'payment_released',
          'milestone_approved',
          'milestone_submitted',
          'review_received',
          'system',
        ],
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Please specify a notification type'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a notification message'],
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fetching user notifications, unread first
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
