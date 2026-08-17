'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const env = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { setCsrfToken, verifyCsrf, getCsrfToken } = require('./middleware/csrf');
const { performanceMonitor, performanceAlert } = require('./middleware/performanceMonitor');
const path = require('path');

const app = express();

app.set('trust proxy', 1);

// Mount image serving route at the VERY TOP before any middleware to allow public cross-origin access
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/v1/images', uploadRoutes.publicRouter);

const allowedOrigins = new Set(
  [
    env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:5000',
    'http://localhost:5500',
    'http://localhost:5501',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'https://trapkid254.github.io',
    'https://trapkid254.github.io/kampostay',
  ]
    .filter(Boolean)
    .flatMap((url) => url.split(',').map((s) => s.trim()))
);

app.use(
  cors({
    origin(origin, callback) {
      // Dev / Live Server / local previews: allow any localhost origin
      if (
        !origin
        || allowedOrigins.has(origin)
        || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)
        || origin.endsWith('.github.io')
        || env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(helmet());
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(performanceMonitor);
app.use(performanceAlert);
app.use(setCsrfToken);
app.use(generalLimiter);

// Serve locally-saved uploads (fallback for development)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/api/v1/csrf-token', getCsrfToken);

app.use('/api/v1', verifyCsrf, routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

app.use(errorHandler);

module.exports = app;
