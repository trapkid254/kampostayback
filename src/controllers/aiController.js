'use strict';

const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

const search = asyncHandler(async (req, res) => {
  const result = await aiService.searchWithAI(req.body.query || req.query.q, req.query);
  res.json({ success: true, data: result });
});

const chat = asyncHandler(async (req, res) => {
  const result = await aiService.chatAssistant(req.body.message, req.body.context);
  res.json({ success: true, data: result });
});

module.exports = { search, chat };
