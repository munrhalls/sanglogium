#!/usr/bin/env node
/**
 * Lightweight test: insert a row into Turso auth DB via Kysely
 * (same adapter path Better Auth uses). Validates schema compatibility.
 */
import 'dotenv/config';
import { Kysely } from 'kysely';
import { LibsqlDialect } from 'kysely-libsql';

const databaseUrl = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  console.error('[AUTH] DATABASE_URL and TURSO_AUTH_TOKEN required');
  process.exit(1);
}

const db = new Kysely({
  dialect: new LibsqlDialect({ url: databaseUrl, authToken }),
});

async function test() {
  const testId = `test-${Date.now()}`;
  const testEmail = `test-${Date.now()}@example.com`;

  console.log('[AUTH] Inserting test user...');
  await db
    .insertInto('user')
    .values({
      id: testId,
      name: 'Test User',
      email: testEmail,
      emailVerified: 0,
      image: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    .execute();

  const row = await db
    .selectFrom('user')
    .selectAll()
    .where('id', '=', testId)
    .executeTakeFirst();

  console.log('[AUTH] Inserted row:', {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
  });

  console.log('[AUTH] Cleaning up test row...');
  await db.deleteFrom('user').where('id', '=', testId).execute();

  console.log('[AUTH] Kysely + Turso INSERT/SELECT/DELETE: OK');
  await db.destroy();
}

test().catch((err) => {
  console.error('[AUTH] CRITICAL:', err.message);
  process.exit(1);
});
