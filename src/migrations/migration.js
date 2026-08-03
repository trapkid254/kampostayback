'use strict';

/**
 * Database Migration System
 * 
 * Simple migration system for managing database schema changes
 * 
 * Usage:
 * - Create migration files in migrations/ directory
 * - Run migrations: node src/migrations/run.js
 * - Rollback: node src/migrations/rollback.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

class Migration {
  constructor(name, up, down) {
    this.name = name;
    this.up = up;
    this.down = down;
    this.appliedAt = null;
  }
}

class MigrationRunner {
  constructor(connection) {
    this.connection = connection;
    this.migrations = [];
    this.migrationCollection = null;
  }

  async init() {
    // Create migrations collection if it doesn't exist
    if (!this.connection.collections.migrations) {
      await this.connection.createCollection('migrations');
    }
    this.migrationCollection = this.connection.collection('migrations');
  }

  async loadMigrations() {
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migration.js' && file !== 'run.js' && file !== 'rollback.js');

    for (const file of files) {
      const migration = require(path.join(migrationsDir, file));
      if (migration instanceof Migration) {
        this.migrations.push(migration);
      }
    }

    // Sort migrations by name (timestamp prefix)
    this.migrations.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getAppliedMigrations() {
    const applied = await this.migrationCollection.find({}).toArray();
    return new Set(applied.map(m => m.name));
  }

  async run() {
    await this.init();
    await this.loadMigrations();
    const applied = await this.getAppliedMigrations();

    for (const migration of this.migrations) {
      if (applied.has(migration.name)) {
        console.log(`Skipping already applied migration: ${migration.name}`);
        continue;
      }

      console.log(`Running migration: ${migration.name}`);
      try {
        await migration.up(this.connection);
        await this.migrationCollection.insertOne({
          name: migration.name,
          appliedAt: new Date(),
        });
        console.log(`Migration applied: ${migration.name}`);
      } catch (error) {
        console.error(`Migration failed: ${migration.name}`, error);
        throw error;
      }
    }

    console.log('All migrations completed successfully');
  }

  async rollback(targetMigration = null) {
    await this.init();
    await this.loadMigrations();
    const applied = await this.getAppliedMigrations();

    // Get migrations to rollback (in reverse order)
    const toRollback = this.migrations
      .filter(m => applied.has(m.name))
      .reverse();

    if (targetMigration) {
      const targetIndex = toRollback.findIndex(m => m.name === targetMigration);
      if (targetIndex === -1) {
        console.log(`Migration ${targetMigration} not found or not applied`);
        return;
      }
      toRollback.splice(targetIndex + 1);
    }

    for (const migration of toRollback) {
      console.log(`Rolling back migration: ${migration.name}`);
      try {
        await migration.down(this.connection);
        await this.migrationCollection.deleteOne({ name: migration.name });
        console.log(`Migration rolled back: ${migration.name}`);
      } catch (error) {
        console.error(`Rollback failed: ${migration.name}`, error);
        throw error;
      }
    }

    console.log('Rollback completed successfully');
  }
}

module.exports = { Migration, MigrationRunner };
