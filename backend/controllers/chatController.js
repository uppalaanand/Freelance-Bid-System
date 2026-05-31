const Chat = require('../models/Chat');
const Message = require('../models/Message');

/**
 * @desc    Get all chats for the authenticated user
 * @route   GET /api/chat
 * @access  Private
 */
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'fullName avatar')
      .populate('project', 'title')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new chat or access an existing one between two users for a project
 * @route   POST /api/chat
 * @access  Private
 */
const createOrAccessChat = async (req, res, next) => {
  try {
    const { userId, projectId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    // Prevent creating a chat with yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create a chat with yourself',
      });
    }

    // Build query to find existing chat between these two users for this project
    const query = {
      participants: { $all: [req.user._id, userId] },
    };

    if (projectId) {
      query.project = projectId;
    }

    // Check if chat already exists
    let chat = await Chat.findOne(query)
      .populate('participants', 'fullName avatar')
      .populate('project', 'title');

    if (chat) {
      return res.status(200).json({
        success: true,
        chat,
      });
    }

    // Create new chat
    const chatData = {
      participants: [req.user._id, userId],
    };

    if (projectId) {
      chatData.project = projectId;
    }

    chat = await Chat.create(chatData);

    // Populate and return the newly created chat
    chat = await Chat.findById(chat._id)
      .populate('participants', 'fullName avatar')
      .populate('project', 'title');

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all messages for a specific chat
 * @route   GET /api/chat/:chatId/messages
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    // Verify the user is a participant of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not a participant',
      });
    }

    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: 1 });

    // Mark messages as read by the current user
    const unreadMessageIds = messages
      .filter((msg) => !msg.readBy.some((id) => id.equals(req.user._id)))
      .map((msg) => msg._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { readBy: req.user._id } }
      );
    }

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a chat
 * @route   POST /api/chat/:chatId/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    // Verify the user is a participant of this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found or you are not a participant',
      });
    }

    // Create the message
    let message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content.trim(),
      readBy: [req.user._id],
    });

    // Update chat's lastMessage and lastMessageAt
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
    });

    // Populate sender info
    message = await Message.findById(message._id).populate(
      'sender',
      'fullName avatar'
    );

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChats,
  createOrAccessChat,
  getMessages,
  sendMessage,
};
