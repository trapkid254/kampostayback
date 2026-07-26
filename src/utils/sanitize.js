'use strict';

const validator = require('validator');

function sanitizeString(value, maxLength = 5000) {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();
  str = validator.escape(str);
  if (str.length > maxLength) str = str.slice(0, maxLength);
  return str;
}

function sanitizeEmail(email) {
  if (!email) return '';
  const normalized = validator.normalizeEmail(String(email).trim()) || '';
  return validator.isEmail(normalized) ? normalized : '';
}

function sanitizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+254${digits.slice(1)}`;
  if (digits.length === 9) return `+254${digits}`;
  return phone.trim();
}

function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, '').trim();
}

function sanitizeObject(obj, allowedKeys) {
  const result = {};
  allowedKeys.forEach((key) => {
    if (obj[key] !== undefined) result[key] = obj[key];
  });
  return result;
}

module.exports = {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  stripHtml,
  sanitizeObject,
};
