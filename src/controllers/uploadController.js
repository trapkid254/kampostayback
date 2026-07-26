'use strict';

const cloudinaryService = require('../services/cloudinaryService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);
  const folder = req.body.folder || 'kampostay/uploads';
  const result = await cloudinaryService.uploadImage(req.file, folder);
  const hash = cloudinaryService.computeImageHash(req.file.buffer);
  res.status(201).json({ success: true, data: { ...result, hash } });
});

const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new AppError('No files uploaded.', 400);
  const folder = req.body.folder || 'kampostay/uploads';
  const results = await cloudinaryService.uploadImages(req.files, folder);
  const withHashes = results.map((r, i) => ({
    ...r,
    hash: cloudinaryService.computeImageHash(req.files[i].buffer),
  }));
  res.status(201).json({ success: true, data: withHashes });
});

const deleteAsset = asyncHandler(async (req, res) => {
  const result = await cloudinaryService.deleteAsset(req.body.publicId);
  res.json({ success: true, data: result });
});

module.exports = { uploadImage, uploadImages, deleteAsset };
