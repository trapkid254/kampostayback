'use strict';

const crypto = require('crypto');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const env = require('../config/env');
const AppError = require('../utils/AppError');

let gfsBucket;

function getGridFSBucket() {
  if (!gfsBucket) {
    const db = mongoose.connection.db;
    gfsBucket = new GridFSBucket(db, {
      bucketName: 'images',
      chunkSizeBytes: 1048576, // 1MB chunks
    });
  }
  return gfsBucket;
}

async function uploadBuffer(buffer, options = {}) {
  const bucket = getGridFSBucket();
  
  // Generate unique filename using hash
  const hash = crypto.createHash('md5').update(buffer).digest('hex');
  const format = (options.format || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const filename = `${hash}.${format}`;
  
  // Check if file already exists
  const existingFile = await bucket.find({ filename }).toArray();
  if (existingFile.length > 0) {
    const file = existingFile[0];
    return {
      url: `${env.APP_URL.replace(/\/$/, '')}/api/v1/images/${file._id}`,
      publicId: file._id.toString(),
      format,
      bytes: file.length,
      width: file.metadata?.width,
      height: file.metadata?.height,
      storedIn: 'mongodb',
    };
  }
  
  // Upload new file
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: `image/${format}`,
    metadata: {
      uploadDate: new Date(),
      format,
      ...options.metadata,
    },
  });
  
  return new Promise((resolve, reject) => {
    uploadStream.write(buffer);
    uploadStream.end();
    
    uploadStream.on('finish', (file) => {
      resolve({
        url: `${env.APP_URL.replace(/\/$/, '')}/api/v1/images/${file._id}`,
        publicId: file._id.toString(),
        format,
        bytes: file.length,
        width: file.metadata?.width,
        height: file.metadata?.height,
        storedIn: 'mongodb',
      });
    });
    
    uploadStream.on('error', (error) => {
      reject(new AppError(`Image upload failed: ${error.message}`, 500));
    });
  });
}

async function uploadImage(file, options = {}) {
  if (!file?.buffer) throw new AppError('No file provided.', 400);
  return uploadBuffer(file.buffer, { 
    format: file.mimetype?.split('/')[1] || 'jpg',
    ...options 
  });
}

async function uploadImages(files, options = {}) {
  if (!files?.length) return [];
  return Promise.all(files.map((f) => uploadImage(f, options)));
}

async function getImageStream(fileId) {
  const bucket = getGridFSBucket();
  
  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    const file = await bucket.find({ _id: objectId }).toArray();
    
    if (!file.length) {
      throw new AppError('Image not found', 404);
    }
    
    return bucket.openDownloadStream(objectId);
  } catch (error) {
    throw new AppError('Invalid image ID', 400);
  }
}

async function deleteImage(fileId) {
  const bucket = getGridFSBucket();
  
  try {
    const objectId = new mongoose.Types.ObjectId(fileId);
    await bucket.delete(objectId);
    return { success: true, deletedId: fileId };
  } catch (error) {
    throw new AppError('Failed to delete image', 500);
  }
}

async function deleteImages(fileIds) {
  if (!fileIds?.length) return { success: true, deletedCount: 0 };
  
  const results = await Promise.allSettled(
    fileIds.map(id => deleteImage(id))
  );
  
  const successful = results.filter(r => r.status === 'fulfilled').length;
  return { success: true, deletedCount: successful };
}

function computeImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

module.exports = {
  uploadBuffer,
  uploadImage,
  uploadImages,
  getImageStream,
  deleteImage,
  deleteImages,
  computeImageHash,
  getGridFSBucket,
};
