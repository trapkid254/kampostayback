'use strict';

const validator = require('validator');
const AppError = require('../utils/AppError');

function validate(schema) {
  return (req, res, next) => {
    const errors = [];

    if (schema.body) {
      errors.push(...validateObject(req.body, schema.body, 'body'));
    }
    if (schema.query) {
      errors.push(...validateObject(req.query, schema.query, 'query'));
    }
    if (schema.params) {
      errors.push(...validateObject(req.params, schema.params, 'params'));
    }

    if (errors.length) {
      return next(new AppError(errors.join('; '), 400, 'VALIDATION_ERROR'));
    }
    next();
  };
}

function validateObject(data, rules, location) {
  const errors = [];
  const obj = data || {};

  Object.entries(rules).forEach(([field, rule]) => {
    const value = obj[field];
    const required = rule.required === true || (typeof rule.required === 'function' && rule.required(obj));

    if (required && (value === undefined || value === null || value === '')) {
      errors.push(`${location}.${field} is required`);
      return;
    }

    if (value === undefined || value === null || value === '') return;

    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${location}.${field} must be a string`);
    }
    if (rule.type === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) errors.push(`${location}.${field} must be a number`);
      else if (rule.min !== undefined && num < rule.min) errors.push(`${location}.${field} must be >= ${rule.min}`);
      else if (rule.max !== undefined && num > rule.max) errors.push(`${location}.${field} must be <= ${rule.max}`);
    }
    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${location}.${field} must be a boolean`);
    }
    if (rule.type === 'email' && !validator.isEmail(String(value))) {
      errors.push(`${location}.${field} must be a valid email`);
    }
    if (rule.type === 'mongoId' && !validator.isMongoId(String(value))) {
      errors.push(`${location}.${field} must be a valid ID`);
    }
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${location}.${field} must be one of: ${rule.enum.join(', ')}`);
    }
    if (rule.minLength && String(value).length < rule.minLength) {
      errors.push(`${location}.${field} must be at least ${rule.minLength} characters`);
    }
    if (rule.maxLength && String(value).length > rule.maxLength) {
      errors.push(`${location}.${field} must be at most ${rule.maxLength} characters`);
    }
    if (rule.custom) {
      const result = rule.custom(value, obj);
      if (result !== true) errors.push(result || `${location}.${field} is invalid`);
    }
  });

  return errors;
}

module.exports = { validate };
