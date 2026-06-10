#!/usr/bin/env node
/**
 * Apply Better Auth v1.6.11 schema to Turso database.
 * Idempotent: CREATE TABLE IF NOT EXISTS.
 *
 * Usage:
 *   node scripts/apply-auth-schema-to-turso.mjs
 */
import 'dotenv/config';
import { createClient } from '@libsql/client';

function createClientChecked() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('[AUTH] DATABASE_URL is not set.');
  }

  if (!databaseUrl.startsWith('libsql://') && !databaseUrl.startsWith('http')) {
    throw new Error(
      '[AUTH] DATABASE_URL must be a Turso libsql:// URL. ' +
        `Current value: ${databaseUrl}`
    );
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('[AUTH] TURSO_AUTH_TOKEN is not set.');
  }

  return createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const TABLES = [
  `CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
];

async function main() {
  const client = createClientChecked();
  console.log(`[AUTH] Applying schema to Turso database...\n`);

  for (const ddl of TABLES) {
    const tableName = ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    try {
      await client.execute(ddl);
      console.log(`  ✓ ${tableName}`);
    } catch (error) {
      console.error(`  ✗ ${tableName}: ${error.message}`);
      await client.close();
      process.exit(1);
    }
  }

  console.log('\n[AUTH] Verifying tables exist...');
  for (const ddl of TABLES) {
    const tableName = ddl.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
    try {
      const result = await client.execute(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`
      );
      if (result.rows.length > 0) {
        console.log(`  ✓ ${tableName} confirmed`);
      } else {
        console.error(`  ✗ ${tableName} NOT FOUND`);
        await client.close();
        process.exit(1);
      }
    } catch (error) {
      console.error(`  ✗ ${tableName} verification failed: ${error.message}`);
      await client.close();
      process.exit(1);
    }
  }

  console.log('\n[AUTH] Schema applied successfully.');
  await client.close();
}

main().catch((error) => {
  console.error('[AUTH] CRITICAL:', error.message);
  process.exit(1);
});
