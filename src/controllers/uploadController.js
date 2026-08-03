'use strict';

const imageStorage = require('../services/imageStorage');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);
  const result = await imageStorage.uploadImage(req.file);
  const hash = imageStorage.computeImageHash(req.file.buffer);
  res.status(201).json({ success: true, data: { ...result, hash } });
});

const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files?.length) throw new AppError('No files uploaded.', 400);
  const results = await imageStorage.uploadImages(req.files);
  const withHashes = results.map((r, i) => ({
    ...r,
    hash: imageStorage.computeImageHash(req.files[i].buffer),
  }));
  res.status(201).json({ success: true, data: withHashes });
});

const deleteAsset = asyncHandler(async (req, res) => {
  const result = await imageStorage.deleteImage(req.body.publicId);
  res.json({ success: true, data: result });
});

const getImage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stream = await imageStorage.getImageStream(id);
  
  stream.on('error', (error) => {
    throw new AppError('Image not found', 404);
  });
  
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  stream.pipe(res);
});

module.exports = { uploadImage, uploadImages, deleteAsset, getImage };
