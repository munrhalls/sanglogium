#!/usr/bin/env node
/**
 * Simple test to verify cleanup API works
 */

import { createClient } from '@sanity/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local') });

// Initialize Sanity client
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false
});

async function testCleanup() {
  console.log('=== Testing Cleanup API ===');
  
  // Find a test product
  const product = await client.fetch(`*[_type == "product" && defined(scenarioType)][0]`);
  console.log('Test product:', product?.name);
  
  if (!product) {
    console.log('No test product found');
    return;
  }
  
  // Reserve some stock
  console.log('\nReserving 2 units...');
  await client.patch(product._id).inc({ reservedStock: 2 }).commit();
  
  // Check state
  const afterReserve = await client.fetch(`*[_id == "${product._id}"]{name, stock, reservedStock}`);
  console.log('After reserve:', afterReserve);
  
  // Call cleanup API
  console.log('\nCalling cleanup API...');
  const response = await fetch('http://localhost:3000/api/checkout/cleanup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idempotencyKey: 'test-' + Date.now() })
  });
  
  const result = await response.json();
  console.log('Cleanup response:', result);
  
  // Check final state
  const afterCleanup = await client.fetch(`*[_id == "${product._id}"]{name, stock, reservedStock}`);
  console.log('After cleanup:', afterCleanup);
  
  // Clean up
  await client.patch(product._id).set({ reservedStock: 0 }).commit();
  console.log('\nTest complete');
}

testCleanup().catch(console.error);
