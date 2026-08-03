'use strict';

const env = require('../config/env');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const levelNames = Object.keys(levels);

class Logger {
  constructor(minLevel = 'info') {
    this.minLevel = levels[minLevel] || levels.info;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${metaStr}`;
  }

  log(level, message, meta = {}) {
    if (levels[level] > this.minLevel) return;

    const formatted = this.formatMessage(level, message, meta);
    
    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        console.debug(formatted);
        break;
      default:
        console.log(formatted);
    }
  }

  error(message, meta) {
    this.log('error', message, meta);
  }

  warn(message, meta) {
    this.log('warn', message, meta);
  }

  info(message, meta) {
    this.log('info', message, meta);
  }

  debug(message, meta) {
    this.log('debug', message, meta);
  }
}

const minLevel = env.NODE_ENV === 'production' ? 'info' : 'debug';
const logger = new Logger(minLevel);

module.exports = logger;
