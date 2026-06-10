import 'dotenv/config';
import { createClient } from '@libsql/client';

const c = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const now = Math.floor(Date.now() / 1000);
const id = `test-ver-${now}`;
const token = 'testtoken123';

await c.execute(
  `INSERT INTO verification (id, identifier, value, expiresAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
  [id, 'test@example.com', token, now + 3600, now, now]
);

const result = await c.execute('SELECT * FROM verification');
console.log('VERIFICATION ROWS AFTER INSERT:', result.rows);

await c.close();
