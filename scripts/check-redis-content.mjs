// Check actual content in Redis keys

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Checking Redis key contents...\n');

async function checkKeyContents(keyName) {
  console.log(`\n=== Checking key: ${keyName} ===`);
  
  try {
    // Check type
    const type = await redis.type(keyName);
    console.log('Type:', type);
    
    // Get all values
    const values = await redis.lrange(keyName, 0, -1);
    console.log('Number of items:', values.length);
    
    if (values.length > 0) {
      console.log('First item type:', typeof values[0]);
      console.log('First item (first 100 chars):', String(values[0]).substring(0, 100));
      
      // Check if it's HTML
      if (String(values[0]).startsWith('<!DOCTYPE')) {
        console.log('WARNING: First item is HTML!');
      }
    }
    
    return values;
  } catch (error) {
    console.error('Error checking key:', error.message);
    return [];
  }
}

async function main() {
  const recentEvents = await checkKeyContents('checkout_events:recent');
  const violations = await checkKeyContents('checkout_integrity_violations');
  
  // Try to parse first item if exists
  if (recentEvents.length > 0) {
    console.log('\n--- Trying to parse first recent event ---');
    try {
      const parsed = JSON.parse(recentEvents[0]);
      console.log('Parse successful:', parsed);
    } catch (e) {
      console.log('Parse failed:', e.message);
      console.log('Raw value:', recentEvents[0]);
    }
  }
}

main().catch(console.error);
