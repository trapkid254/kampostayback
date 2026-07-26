'use strict';

const crypto = require('crypto');
const { getCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const AppError = require('../utils/AppError');

async function uploadBuffer(buffer, options = {}) {
  if (!isCloudinaryConfigured()) {
    const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
    return {
      url: `https://placehold.co/800x600/e2e8f0/64748b?text=KampoStay+${hash}`,
      publicId: `local/${hash}`,
      format: options.format || 'jpg',
      bytes: buffer.length,
      mock: true,
    };
  }

  return new Promise((resolve, reject) => {
    const cloudinary = getCloudinary();
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'kampostay',
        resource_type: options.resourceType || 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(new AppError(`Upload failed: ${error.message}`, 500));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

async function uploadImage(file, folder = 'kampostay/properties') {
  if (!file?.buffer) throw new AppError('No file provided.', 400);
  return uploadBuffer(file.buffer, { folder, resourceType: 'image' });
}

async function uploadImages(files, folder = 'kampostay/properties') {
  if (!files?.length) return [];
  return Promise.all(files.map((f) => uploadImage(f, folder)));
}

async function deleteAsset(publicId) {
  if (!isCloudinaryConfigured()) return { result: 'ok', mock: true };
  const cloudinary = getCloudinary();
  return cloudinary.uploader.destroy(publicId);
}

function computeImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

module.exports = { uploadBuffer, uploadImage, uploadImages, deleteAsset, computeImageHash };
