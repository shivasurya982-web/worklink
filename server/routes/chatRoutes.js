const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

router.use(protect);

router.post('/conversations', chatController.startConversation);
router.get('/conversations', chatController.getUserConversations);
router.get('/conversations/:id/messages', chatController.getMessages);
router.delete('/conversations/:id', chatController.deleteConversation);
router.post('/messages', uploadSingle, chatController.sendMessage);
router.put('/messages/:id', chatController.editMessage);
router.delete('/messages/:id', chatController.deleteMessage);

module.exports = router;
