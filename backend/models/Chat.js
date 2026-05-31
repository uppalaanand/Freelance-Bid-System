const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    lastMessage: {
      type: String,
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding chats by participant
ChatSchema.index({ participants: 1 });
ChatSchema.index({ project: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
