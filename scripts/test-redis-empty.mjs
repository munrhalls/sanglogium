// Test Redis behavior with empty/non-existent keys

import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config({ path: '.env.local' });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

console.log('Testing Redis with non-existent keys...\n');

// Test 1: LRANGE on non-existent key
console.log('Test 1: LRANGE on non-existent key');
try {
  const result = await redis.lrange('non_existent_key', 0, -1);
  console.log('Result type:', typeof result);
  console.log('Result:', result);
  console.log('Is array?:', Array.isArray(result));
  console.log('Length:', result.length);
} catch (error) {
  console.error('Error:', error.message);
}

// Test 2: Create and query an empty list
console.log('\nTest 2: Create empty list and query');
try {
  // Push then pop to create empty list
  await redis.lpush('test_empty_list', 'temp');
  await redis.lpop('test_empty_list');
  
  const result = await redis.lrange('test_empty_list', 0, -1);
  console.log('Empty list result:', result);
  console.log('Type:', typeof result);
  
  // Cleanup
  await redis.del('test_empty_list');
} catch (error) {
  console.error('Error:', error.message);
}

// Test 3: Check if key exists
console.log('\nTest 3: Check key existence');
try {
  const exists = await redis.exists('checkout_events:recent');
  console.log('checkout_events:recent exists:', exists);
  
  const exists2 = await redis.exists('checkout_integrity_violations');
  console.log('checkout_integrity_violations exists:', exists2);
} catch (error) {
  console.error('Error:', error.message);
}
