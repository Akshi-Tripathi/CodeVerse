const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const { getChatsByProjectId } = require('../controllers/chatController');

router.get('/:projectId', chatController.getChats);
router.post('/add', chatController.addChat);
router.get('/get-project/:projectId', authMiddleware, getChatsByProjectId);

module.exports = router;