import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function debugGuestSession() {
  console.log('=== Debug Guest Session ===');

  // Check all guest sessions
  const pattern = 'guest_session:*';
  let cursor = '0';
  const sessions = [];

  do {
    const result = await redis.scan(cursor, { match: pattern, count: 10 });
    cursor = result[0];
    const keys = result[1];

    for (const key of keys) {
      const session = await redis.get(key);
      try {
        sessions.push({ key, data: JSON.parse(session) });
      } catch (e) {
        console.log(`Invalid JSON in ${key}: ${session}`);
        sessions.push({ key, data: null, error: 'Invalid JSON' });
      }
    }
  } while (cursor !== '0');

  console.log(`Found ${sessions.length} guest sessions:`);

  for (const { key, data } of sessions) {
    console.log(`\n${key}:`);
    console.log(`  paymentIntentId: ${data.paymentIntentId}`);
    console.log(`  clientSecret: ${data.clientSecret ? 'PRESENT' : 'MISSING'}`);
    console.log(`  reservationId: ${data.reservationId}`);
    console.log(`  expiresAt: ${data.expiresAt}`);
    console.log(`  amountPln: ${data.amountPln}`);
  }

  // Check the most recent session
  if (sessions.length > 0) {
    const mostRecent = sessions[sessions.length - 1];
    console.log(`\n=== Most Recent Session ===`);
    console.log(`Key: ${mostRecent.key}`);
    console.log(`Session ID: ${mostRecent.key.split(':')[1]}`);

    // Verify payment intent exists in Stripe (optional)
    if (mostRecent.data.paymentIntentId) {
      console.log(`Payment Intent ID: ${mostRecent.data.paymentIntentId}`);
    }
  }
}

debugGuestSession().catch(console.error);
