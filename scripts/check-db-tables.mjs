import 'dotenv/config';
import { createClient } from '@libsql/client';

const c = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tables = await c.execute("SELECT name FROM sqlite_master WHERE type='table'");
console.log('TABLES:', tables.rows.map((x) => x.name));

const verification = await c.execute('SELECT * FROM verification');
console.log('VERIFICATION ROWS:', verification.rows);

await c.close();
