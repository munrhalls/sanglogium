import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

async function checkClientSecret() {
  console.log('=== Check ClientSecret in Guest Session ===');
  
  // Get the most recent guest session
  const pattern = 'guest_session:*';
  const result = await redis.scan('0', { match: pattern, count: 10 });
  const keys = result[1];
  
  if (keys.length === 0) {
    console.log('No guest sessions found');
    return;
  }
  
  // Get the last session (most recent)
  const sessionKey = keys[keys.length - 1];
  const sessionId = sessionKey.split(':')[1];
  console.log(`Checking session: ${sessionId}`);
  
  // Get the session data
  const session = await redis.get(sessionKey);
  
  if (typeof session === 'object' && session !== null) {
    console.log('\nSession data:');
    console.log(`  paymentIntentId: ${session.paymentIntentId}`);
    console.log(`  clientSecret: ${session.clientSecret ? 'PRESENT' : 'MISSING'}`);
    console.log(`  reservationId: ${session.reservationId}`);
    console.log(`  expiresAt: ${session.expiresAt}`);
    console.log(`  amountPln: ${session.amountPln}`);
    
    // Check specifically for clientSecret
    if (session.clientSecret) {
      console.log('\n=== RESULT ===');
      console.log('clientSecret field is PRESENT in guest session');
      console.log(`Value starts with: ${session.clientSecret.substring(0, 10)}...`);
    } else {
      console.log('\n=== RESULT ===');
      console.log('clientSecret field is MISSING from guest session');
    }
  } else {
    console.log('Session is not an object or is null');
  }
}

checkClientSecret().catch(console.error);
