'use strict';

/**
 * Performance Monitoring Middleware
 * 
 * This middleware tracks response times and performance metrics
 * To enable detailed monitoring, integrate with APM tools like:
 * - New Relic
 * - Datadog
 * - App Insights
 */

const logger = require('../utils/logger');

const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to track response time
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Log performance metrics
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip,
    });
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};

// Performance thresholds for alerts
const thresholds = {
  slow: 1000,      // 1 second
  verySlow: 3000,  // 3 seconds
  critical: 5000,  // 5 seconds
};

const performanceAlert = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (duration > thresholds.critical) {
      logger.error('Critical performance issue', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    } else if (duration > thresholds.verySlow) {
      logger.warn('Very slow response', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    } else if (duration > thresholds.slow) {
      logger.info('Slow response', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      });
    }
  });
  
  next();
};

// Memory usage monitoring
const memoryMonitor = () => {
  const used = process.memoryUsage();
  const total = Math.round(used.heapTotal / 1024 / 1024);
  const usedMB = Math.round(used.heapUsed / 1024 / 1024);
  
  logger.debug('Memory usage', {
    heapUsed: `${usedMB}MB`,
    heapTotal: `${total}MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
  });
  
  // Alert if memory usage is high (>80% of heap)
  if (usedMB / total > 0.8) {
    logger.warn('High memory usage detected', {
      heapUsed: `${usedMB}MB`,
      heapTotal: `${total}MB`,
      usage: `${((usedMB / total) * 100).toFixed(1)}%`,
    });
  }
};

// Start memory monitoring (every 5 minutes in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(memoryMonitor, 5 * 60 * 1000);
}

module.exports = {
  performanceMonitor,
  performanceAlert,
  memoryMonitor,
  thresholds,
};
