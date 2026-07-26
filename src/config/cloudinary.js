'use strict';

const cloudinary = require('cloudinary').v2;
const env = require('./env');

const isConfigured =
  Boolean(env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(env.CLOUDINARY_API_KEY) &&
  Boolean(env.CLOUDINARY_API_SECRET);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function getCloudinary() {
  return cloudinary;
}

function isCloudinaryConfigured() {
  return isConfigured;
}

module.exports = { getCloudinary, isCloudinaryConfigured };
