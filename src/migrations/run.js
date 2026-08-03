'use strict';

/**
 * Run Database Migrations
 * Usage: node src/migrations/run.js
 */

const { connectDB, disconnectDB } = require('../config/db');
const { MigrationRunner } = require('./migration');

async function runMigrations() {
  try {
    const connection = await connectDB();
    const runner = new MigrationRunner(connection);
    await runner.run();
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await disconnectDB();
    process.exit(1);
  }
}

runMigrations();
