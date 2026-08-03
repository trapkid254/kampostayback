'use strict';

/**
 * Rollback Database Migrations
 * Usage: node src/migrations/rollback.js [migration_name]
 */

const { connectDB, disconnectDB } = require('../config/db');
const { MigrationRunner } = require('./migration');

async function rollbackMigrations() {
  const targetMigration = process.argv[2];
  
  try {
    const connection = await connectDB();
    const runner = new MigrationRunner(connection);
    await runner.rollback(targetMigration);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('Rollback failed:', error);
    await disconnectDB();
    process.exit(1);
  }
}

rollbackMigrations();
