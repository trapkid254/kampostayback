"use strict";

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const env = require('../config/env');
const AppError = require('../utils/AppError');

async function uploadBuffer(buffer, options = {}) {
  if (!isCloudinaryConfigured()) {
    // Save the buffer to a local uploads folder so the uploaded image is visible
    const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
    const format = (options.format || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
    const uploadsDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');
    try {
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const filename = `${hash}.${format}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
      const url = `${env.APP_URL.replace(/\/$/, '')}/uploads/${filename}`;
      return {
        url,
        publicId: `local/${hash}`,
        format,
        bytes: buffer.length,
        mock: true,
        savedTo: filePath,
      };
    } catch (err) {
      // Fallback to placeholder if local save fails
      const ph = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
      return {
        url: `https://placehold.co/800x600/e2e8f0/64748b?text=KampoStay+${ph}`,
        publicId: `local/${ph}`,
        format: options.format || 'jpg',
        bytes: buffer.length,
        mock: true,
      };
    }
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
