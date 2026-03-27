#!/usr/bin/env node

import { createClient } from '@sanity/client';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
import { config } from 'dotenv';
config();

function assertValue(v, errorMessage) {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET"
);

const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID"
);

const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false
});

async function testMissingProductLogging() {
  const missingFile = join(process.cwd(), 'scripts', 'product-vfs-mapper', 'missing-products.json');
  
  // Clean up any existing file
  try {
    unlinkSync(missingFile);
  } catch (error) {
    // File doesn't exist, that's fine
  }
  
  // Test with non-existent product
  console.log('Testing with non-existent product...');
  const result1 = await client.fetch('*[_type == "product" && _id == $productId][0]{name, overviewFields}', { productId: 'non-existent-product' });
  
  if (!result1 || !result1.overviewFields) {
    console.log('✅ Non-existent product correctly identified as missing');
  }
  
  // Test with the actual product that was missing fields
  console.log('Testing with actual product ID...');
  const result2 = await client.fetch('*[_type == "product" && _id == $productId][0]{name, overviewFields}', { productId: 'ekv4twh175wcse4fl4jjdxfq' });
  
  if (!result2 || !result2.overviewFields) {
    console.log('✅ Actual product correctly identified as missing');
    console.log(`Product name: ${result2?.name || 'Not found'}`);
  }
  
  // Check if missing-products.json was created
  try {
    const missingData = JSON.parse(readFileSync(missingFile, 'utf8'));
    console.log('✅ Missing products file created successfully');
    console.log(`Number of missing products logged: ${missingData.length}`);
    
    if (missingData.length > 0) {
      console.log('Missing products:', missingData.map(p => `${p.productId} - ${p.productName}`).join(', '));
    }
    
    return true;
  } catch (error) {
    console.log('❌ Missing products file was not created');
    return false;
  }
}

async function main() {
  try {
    const success = await testMissingProductLogging();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

main();
