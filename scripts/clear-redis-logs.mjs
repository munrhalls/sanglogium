// Clear all checkout logs from Redis
// Usage:
//   node scripts/clear-redis-logs.mjs

import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load .env manually (no dotenv dependency required)
try {
  const env = readFileSync(join(process.cwd(), '.env'), 'utf-8');
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  }
} catch {}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Clearing all checkout logs from Redis...');

// Get all checkout_events keys
const keys = await redis.keys('checkout_events:*');

if (keys.length === 0) {
  console.log('No checkout logs found in Redis.');
  process.exit(0);
}

// Delete all keys
await redis.del(...keys);

console.log(`Cleared ${keys.length} log entries from Redis.`);
console.log('Done.');
