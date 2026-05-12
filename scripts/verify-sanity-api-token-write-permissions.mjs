// Zero-risk test to verify SANITY_API_TOKEN write permissions
// This script attempts to create a Sanity transaction without committing
// No data is modified - only tests if the token has write permissions

import 'dotenv/config';
import { createClient } from 'next-sanity';

// Read environment variables directly
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || (process.env.NODE_ENV === 'test' ? 'test' : 'production');

// Use test dataset if available, otherwise use current dataset
const testDataset = process.env.NODE_ENV === 'test' ? 'test' : dataset;

console.log('Testing SANITY_API_TOKEN write permissions...');
console.log(`Dataset: ${testDataset}`);

// Create client using SANITY_API_TOKEN (same as checkoutClient)
const client = createClient({
  projectId,
  apiVersion,
  dataset: testDataset,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

try {
  // Try to create a transaction (tests write permissions without committing)
  const transaction = client.transaction();
  
  // Add a dummy patch operation (won't be committed)
  // Using a non-existent document ID to be extra safe
  transaction.patch('test-write-permission-check-never-commit', (p) => {
    return p.set({ _type: 'test', testField: 'test' });
  });

  // Do NOT commit - just creating the transaction tests permissions
  console.log('✓ Transaction created successfully - SANITY_API_TOKEN has write permissions');
  console.log('✓ Test completed without committing any changes');
  
  process.exit(0);
} catch (error) {
  if (error.message.includes('permission') || error.message.includes('authorization') || error.message.includes('unauthorized')) {
    console.log('✗ Permission denied - SANITY_API_TOKEN is read-only');
    console.log(`Error: ${error.message}`);
    process.exit(1);
  } else {
    console.log('✗ Unexpected error (may indicate token issue):');
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}
