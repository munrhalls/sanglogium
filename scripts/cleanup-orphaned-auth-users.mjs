#!/usr/bin/env node
/**
 * Cleanup script for orphaned auth users.
 *
 * HEAL-FIRST policy: creates missing userProfile documents for verified users.
 * Deletion candidates are logged but NOT auto-deleted on first run.
 *
 * Usage:
 *   node scripts/cleanup-orphaned-auth-users.mjs --dry-run
 *   node scripts/cleanup-orphaned-auth-users.mjs --heal
 *
 * See docs/auth/userprofile-atomicity-spec-updated.md
 */

import 'dotenv/config';
import { createClient as sanityCreateClient } from '@sanity/client';
import { Kysely } from 'kysely';
import { LibsqlDialect } from 'kysely-libsql';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
const apiVersion = '2024-11-26';
const token = process.env.SANITY_STUDIO_READ_WRITE;

const GRACE_PERIOD_DAYS = 7;

// ---------------------------------------------------------------------------
// Args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isHeal = args.includes('--heal');

if (!isDryRun && !isHeal) {
  console.error('Usage: node scripts/cleanup-orphaned-auth-users.mjs [--dry-run | --heal]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Sanity client
// ---------------------------------------------------------------------------

if (!token) {
  console.error('[AUTH] CRITICAL: SANITY_STUDIO_READ_WRITE is not set');
  process.exit(1);
}

const sanityClient = sanityCreateClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// ---------------------------------------------------------------------------
// Auth DB (Kysely)
// ---------------------------------------------------------------------------

function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('[AUTH] CRITICAL: DATABASE_URL is not set. Set it to your Turso libsql:// URL.');
    process.exit(1);
  }

  if (!databaseUrl.startsWith('libsql://') && !databaseUrl.startsWith('http')) {
    console.error('[AUTH] CRITICAL: DATABASE_URL must be a Turso libsql:// URL.');
    process.exit(1);
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    console.error('[AUTH] CRITICAL: TURSO_AUTH_TOKEN is not set.');
    process.exit(1);
  }

  return new Kysely({
    dialect: new LibsqlDialect({
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
  });
}

const db = createDatabase();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthUsers() {
  // Better Auth default table name is 'user' (singular).
  // Columns: id, email, name, emailVerified (0/1), image, createdAt, updatedAt
  try {
    const rows = await db.selectFrom('user')
      .select(['id', 'email', 'name', 'emailVerified', 'createdAt', 'updatedAt'])
      .execute();
    return rows;
  } catch (error) {
    // Fallback: try 'users' (plural) in case adapter config differs
    try {
      const rows = await db.selectFrom('users')
        .select(['id', 'email', 'name', 'emailVerified', 'createdAt', 'updatedAt'])
        .execute();
      return rows;
    } catch {
      throw error;
    }
  }
}

async function getSanityProfile(authId) {
  const result = await sanityClient.fetch(
    `*[_type == "userProfile" && authId == $authId][0]`,
    { authId }
  );
  return result || null;
}

async function getSanityOrders(authId, email) {
  const result = await sanityClient.fetch(
    `*[_type == "order" && (userId == $authId || customerEmail == $email)][0]`,
    { authId, email }
  );
  return result || null;
}

async function createProfile(user) {
  return sanityClient.create({
    _type: 'userProfile',
    authId: user.id,
    email: user.email,
    name: user.name || '',
  });
}

function userAgeDays(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  return (now - created) / (1000 * 60 * 60 * 24);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`=== Auth User Cleanup — ${isDryRun ? 'DRY RUN' : 'HEAL MODE'} ===\n`);

  let users;
  try {
    users = await getAuthUsers();
  } catch (error) {
    console.error('[AUTH] CRITICAL: Failed to query auth DB.', error.message);
    process.exit(1);
  }

  console.log(`Total auth users: ${users.length}\n`);

  let healthy = 0;
  let healed = 0;
  let deletionCandidates = 0;

  for (const user of users) {
    const profile = await getSanityProfile(user.id);

    if (profile) {
      healthy++;
      continue;
    }

    // No profile found — orphaned user
    const orders = await getSanityOrders(user.id, user.email);
    const ageDays = userAgeDays(user.createdAt);
    const isVerified = user.emailVerified === 1 || user.emailVerified === true;

    if (orders) {
      // User has purchase history — must heal
      if (isDryRun) {
        console.log(`[DRY RUN] Would heal: ${user.email} (has orders, age: ${ageDays.toFixed(1)}d)`);
      } else {
        try {
          await createProfile(user);
          healed++;
          console.log(`[HEALED] ${user.email} — profile created (has orders)`);
        } catch (error) {
          console.error(`[HEAL FAILED] ${user.email}: ${error.message}`);
        }
      }
    } else if (isVerified) {
      // Verified but no orders — heal
      if (isDryRun) {
        console.log(`[DRY RUN] Would heal: ${user.email} (verified, no orders, age: ${ageDays.toFixed(1)}d)`);
      } else {
        try {
          await createProfile(user);
          healed++;
          console.log(`[HEALED] ${user.email} — profile created (verified)`);
        } catch (error) {
          console.error(`[HEAL FAILED] ${user.email}: ${error.message}`);
        }
      }
    } else if (ageDays > GRACE_PERIOD_DAYS) {
      // Unverified, no orders, older than grace period — deletion candidate
      deletionCandidates++;
      console.log(`[CANDIDATE] ${user.email} — unverified, no orders, age: ${ageDays.toFixed(1)}d (>${GRACE_PERIOD_DAYS}d)`);
      // NOTE: Auto-deletion is DISABLED on first run. Review logs manually,
      // then enable by uncommenting the delete logic below.
    } else {
      // Unverified, no orders, but within grace period — wait
      console.log(`[WAITING] ${user.email} — unverified, no orders, age: ${ageDays.toFixed(1)}d (within ${GRACE_PERIOD_DAYS}d grace)`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`  Healthy:          ${healthy}`);
  console.log(`  Healed:           ${healed}`);
  console.log(`  Deletion candidates: ${deletionCandidates} (logged, NOT deleted)`);
  console.log(`  Total scanned:    ${users.length}`);

  await db.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error('[AUTH] CRITICAL: Cleanup script failed.', error);
  process.exit(1);
});
