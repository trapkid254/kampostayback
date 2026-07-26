'use strict';

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');
const env = require('./config/env');

let server;

async function start() {
  await connectDB();

  server = app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`[KampoStay] Server running on port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[KampoStay] API: ${env.APP_URL}/api/v1`);
  });
}

async function shutdown(signal) {
  console.log(`[KampoStay] ${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('[KampoStay] Server closed.');
      process.exit(0);
    });
  } else {
    await disconnectDB();
    process.exit(0);
  }

  setTimeout(() => {
    console.error('[KampoStay] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  console.error('[KampoStay] Unhandled rejection:', err);
  shutdown('unhandledRejection');
});

start().catch((err) => {
  console.error('[KampoStay] Failed to start:', err);
  process.exit(1);
});
