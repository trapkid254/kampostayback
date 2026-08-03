'use strict';

const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/AppError');

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function setCsrfToken(req, res, next) {
  if (!env.CSRF_ENABLED) return next();

  let token = req.cookies?.[CSRF_COOKIE];
  if (!token) {
    token = generateCsrfToken();
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });
  }
  res.locals.csrfToken = token;
  next();
}

function verifyCsrf(req, res, next) {
  if (!env.CSRF_ENABLED) return next();

  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER] || req.body?._csrf;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError('Invalid CSRF token.', 403, 'CSRF_INVALID'));
  }
  next();
}

function getCsrfToken(req, res) {
  res.json({
    success: true,
    data: { csrfToken: res.locals.csrfToken || req.cookies?.[CSRF_COOKIE] },
  });
}

module.exports = { setCsrfToken, verifyCsrf, getCsrfToken, CSRF_HEADER };
