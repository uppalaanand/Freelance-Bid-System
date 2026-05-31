const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getChats,
  createOrAccessChat,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');

router.route('/').get(protect, getChats).post(protect, createOrAccessChat);

router
  .route('/:chatId/messages')
  .get(protect, getMessages)
  .post(protect, sendMessage);

module.exports = router;
