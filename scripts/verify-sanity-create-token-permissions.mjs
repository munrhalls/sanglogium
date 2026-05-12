import 'dotenv/config';
import { createClient as sanityCreateClient } from '@sanity/client';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
const apiVersion = '2024-11-26';

console.log('=== SANITY Token Permission Verification ===\n');
console.log(`Project ID: ${projectId}`);
console.log(`Dataset: ${dataset}\n`);

// Test SANITY_STUDIO_READ_WRITE_CREATE token
const createToken = process.env.SANITY_STUDIO_READ_WRITE_CREATE;
console.log('Testing SANITY_STUDIO_READ_WRITE_CREATE token...');

if (!createToken) {
  console.error('ERROR: SANITY_STUDIO_READ_WRITE_CREATE is not set');
  process.exit(1);
}

const createClient = sanityCreateClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: createToken,
});

try {
  console.log('Attempting create operation...');
  const testId = `test-permission-check-${Date.now()}`;
  const doc = await createClient.create({
    _id: testId,
    _type: 'basketReservation',
    basketReservation: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 900000).toISOString(),
  });
  console.log('✓ CREATE operation succeeded');
  console.log(`  Document ID: ${doc._id}`);
  
  // Clean up
  await createClient.delete(testId);
  console.log('✓ DELETE operation succeeded (cleanup)');
} catch (error) {
  console.error('✗ CREATE operation failed');
  console.error(`  Error: ${error.message}`);
  console.error(`  Details: ${error.description || 'No details'}`);
}

console.log('\n---\n');

// Test SANITY_STUDIO_READ_WRITE token
const rwToken = process.env.SANITY_STUDIO_READ_WRITE;
console.log('Testing SANITY_STUDIO_READ_WRITE token...');

if (!rwToken) {
  console.log('SANITY_STUDIO_READ_WRITE is not set (skipping test)');
} else {
  const rwClient = sanityCreateClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: rwToken,
  });

  try {
    console.log('Attempting create operation...');
    const testId = `test-permission-check-${Date.now()}`;
    const doc = await rwClient.create({
      _id: testId,
      _type: 'basketReservation',
      basketReservation: [],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 900000).toISOString(),
    });
    console.log('✓ CREATE operation succeeded');
    console.log(`  Document ID: ${doc._id}`);
    
    // Clean up
    await rwClient.delete(testId);
    console.log('✓ DELETE operation succeeded (cleanup)');
  } catch (error) {
    console.error('✗ CREATE operation failed (expected)');
    console.error(`  Error: ${error.message}`);
  }
}

console.log('\n=== Verification Complete ===');
