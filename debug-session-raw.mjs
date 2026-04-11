import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function debugRawSession() {
  console.log('=== Debug Raw Session ===');
  
  const sessionId = 'guest_1775848869555_a0giqussd';
  const key = `guest_session:${sessionId}`;
  
  // Get raw session data
  const rawSession = await redis.get(key);
  console.log(`Raw session data:`, rawSession);
  console.log(`Type:`, typeof rawSession);
  
  // Try to parse it
  if (rawSession) {
    try {
      const parsed = JSON.parse(rawSession);
      console.log('\nParsed session:');
      console.log(`  paymentIntentId: ${parsed.paymentIntentId}`);
      console.log(`  clientSecret: ${parsed.clientSecret ? 'PRESENT' : 'MISSING'}`);
      console.log(`  reservationId: ${parsed.reservationId}`);
      console.log(`  expiresAt: ${parsed.expiresAt}`);
      console.log(`  amountPln: ${parsed.amountPln}`);
    } catch (e) {
      console.log('\nFailed to parse as JSON');
      console.log('If it\'s already an object, properties:');
      if (typeof rawSession === 'object' && rawSession !== null) {
        console.log(`  paymentIntentId: ${rawSession.paymentIntentId}`);
        console.log(`  clientSecret: ${rawSession.clientSecret ? 'PRESENT' : 'MISSING'}`);
        console.log(`  reservationId: ${rawSession.reservationId}`);
        console.log(`  expiresAt: ${rawSession.expiresAt}`);
        console.log(`  amountPln: ${rawSession.amountPln}`);
      }
    }
  }
  
  // Test getGuestSession function directly
  console.log('\n=== Testing getGuestSession ===');
  const { getGuestSession } = await import('../app/actions/checkout/reserveStock.js');
  const session = await getGuestSession(sessionId);
  console.log('getGuestSession result:', session);
}

debugRawSession().catch(console.error);
