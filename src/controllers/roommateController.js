'use strict';

const roommateService = require('../services/roommateService');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await roommateService.getOrCreateProfile(req.user._id);
  res.json({ success: true, data: profile });
});

const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await roommateService.upsertProfile(req.user._id, req.body);
  res.json({ success: true, data: profile });
});

const findMatches = asyncHandler(async (req, res) => {
  const matches = await roommateService.findMatches(req.user._id, req.query);
  res.json({ success: true, data: matches });
});

const compare = asyncHandler(async (req, res) => {
  const result = await roommateService.compareProfiles(req.user._id, req.params.userId);
  res.json({ success: true, data: result });
});

module.exports = { getProfile, upsertProfile, findMatches, compare };
