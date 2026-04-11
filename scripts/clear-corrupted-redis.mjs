// Clear corrupted Redis data

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Clearing corrupted Redis data...\n');

async function clearKeys() {
  const keys = [
    'checkout_events:recent',
    'checkout_integrity_violations'
  ];
  
  for (const key of keys) {
    try {
      const result = await redis.del(key);
      console.log(`Cleared ${key}: ${result} items deleted`);
    } catch (error) {
      console.error(`Failed to clear ${key}:`, error.message);
    }
  }
  
  // Also clear any specific correlation keys
  try {
    // Get all keys matching pattern
    // Note: Upstash Redis doesn't support KEYS command, so we'll clear known ones
    console.log('\nClearing specific correlation keys...');
    const knownKeys = [
      'checkout_events:checkout_1775923261339_msslnb268'
    ];
    
    for (const key of knownKeys) {
      const result = await redis.del(key);
      if (result > 0) {
        console.log(`Cleared ${key}: ${result} items deleted`);
      }
    }
  } catch (error) {
    console.error('Failed to clear correlation keys:', error.message);
  }
}

clearKeys().then(() => {
  console.log('\nRedis data cleared successfully!');
  process.exit(0);
}).catch(console.error);
