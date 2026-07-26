'use strict';

const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const validate = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase() });
  if (!coupon) throw new AppError('Invalid coupon code.', 404);

  const check = coupon.isValid(req.user?._id, req.body.amount || 0);
  if (!check.valid) throw new AppError(check.reason, 400);

  const discount = coupon.calculateDiscount(req.body.amount || 0);
  res.json({ success: true, data: { coupon, discount, finalAmount: (req.body.amount || 0) - discount } });
});

const list = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, data: coupons });
});

const create = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

const update = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new AppError('Coupon not found.', 404);
  res.json({ success: true, data: coupon });
});

module.exports = { validate, list, create, update };
