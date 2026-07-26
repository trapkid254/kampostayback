'use strict';

const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login({
    ...req.body,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });
  res.json({ success: true, data: result });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const tokens = await authService.refreshAccessToken(token, {
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });
  res.json({ success: true, data: tokens });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id, req.body.refreshToken || req.cookies?.refreshToken);
  res.json({ success: true, message: 'Logged out successfully.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.json({ success: true, ...result });
});

const resetPassword = asyncHandler(async (req, res) => {
  const tokens = await authService.resetPassword(req.body.token, req.body.password);
  res.json({ success: true, data: tokens });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token || req.body.token);
  res.json({ success: true, data: user });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user._id);
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: user });
});

module.exports = { register, login, refreshToken, logout, forgotPassword, resetPassword, verifyEmail, getMe, updateMe };
