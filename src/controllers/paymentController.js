'use strict';

const paymentService = require('../services/paymentService');
const asyncHandler = require('../utils/asyncHandler');

const initiateSTK = asyncHandler(async (req, res) => {
  const payment = await paymentService.initiateSTKPush({
    userId: req.user._id,
    phoneNumber: req.body.phoneNumber,
    amount: req.body.amount,
    bookingId: req.body.bookingId,
    description: req.body.description,
  });
  res.status(201).json({ success: true, data: payment });
});

const mpesaCallback = asyncHandler(async (req, res) => {
  await paymentService.handleCallback(req.body);
  res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

const getById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id, req.user._id, req.user.role);
  res.json({ success: true, data: payment });
});

const list = asyncHandler(async (req, res) => {
  const payments = await paymentService.listPayments(req.user._id, req.user.role, req.query);
  res.json({ success: true, data: payments });
});

module.exports = { initiateSTK, mpesaCallback, getById, list };
