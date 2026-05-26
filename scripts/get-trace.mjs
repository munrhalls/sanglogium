// Get latest checkout trace directly from Redis
// Usage:
//   node scripts/get-trace.mjs              — prints most recent full trace
//   node scripts/get-trace.mjs <traceId>    — prints specific trace
//   node scripts/get-trace.mjs --list       — lists all known traceIds

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

const arg = process.argv[2];

if (arg === '--list') {
  const keys = await redis.keys('checkout_events:*');
  const traceKeys = keys.filter(k => k !== 'checkout_events:recent');
  if (traceKeys.length === 0) {
    console.log('No traces found.');
    process.exit(0);
  }
  console.log('Available traces:');
  traceKeys.forEach(k => console.log(' ', k.replace('checkout_events:', '')));
  process.exit(0);
}

// Resolve traceId: explicit arg or latest from recent list
let traceId = arg;
if (!traceId) {
  const recent = await redis.lrange('checkout_events:recent', 0, 0);
  if (!recent || recent.length === 0) {
    console.error('No recent traces found. Start a checkout first.');
    process.exit(1);
  }
  const entry = typeof recent[0] === 'string' ? JSON.parse(recent[0]) : recent[0];
  traceId = entry.correlationId;
  console.error(`Using latest trace: ${traceId}\n`);
}

const raw = await redis.lrange(`checkout_events:${traceId}`, 0, -1);
if (!raw || raw.length === 0) {
  console.error(`No events found for traceId: ${traceId}`);
  process.exit(1);
}

const events = raw
  .map(e => typeof e === 'string' ? JSON.parse(e) : e)
  .reverse(); // chronological order

console.log(JSON.stringify({ traceId, eventCount: events.length, events }, null, 2));
