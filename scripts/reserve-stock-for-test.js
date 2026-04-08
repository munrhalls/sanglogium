#!/usr/bin/env node
/**
 * Reserve some stock to test browser cleanup
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

async function reserveStock() {
  console.log('=== Reserving Stock for Browser Test ===\n');
  
  // Find test products
  const testProducts = await client.fetch(`*[_type == "product" && name match "Test Product"][0..1]{
    _id,
    name,
    stock,
    reservedStock
  }`);
  
  if (testProducts.length === 0) {
    console.log('No test products found');
    return;
  }
  
  console.log('Reserving 2 units for each test product...\n');
  
  const transaction = client.transaction();
  
  for (const product of testProducts) {
    console.log(`Reserving 2 units for ${product.name}`);
    transaction.patch(product._id, (p) =>
      p.inc({ reservedStock: 2 })
    );
  }
  
  await transaction.commit();
  
  console.log('\nStock reserved. Now test browser cleanup by:\n');
  console.log('1. Go to http://localhost:3000');
  console.log('2. Add test products to basket');
  console.log('3. Click Checkout');
  console.log('4. Close the tab or navigate away');
  console.log('5. Check console for [CLEANUP] logs');
  console.log('6. Run: node scripts/check-reserved-stock-debug.js\n');
}

reserveStock().catch(console.error);
