'use strict';

const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', messageController.getConversations);
router.post('/', messageController.send);
router.get('/:conversationId', messageController.getConversation);

module.exports = router;
