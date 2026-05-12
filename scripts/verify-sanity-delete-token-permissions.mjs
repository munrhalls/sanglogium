// Verification script to test SANITY_STUDIO_READ_WRITE DELETE permissions
// This script creates a test basketReservation document and attempts to delete it
// to confirm the cleanup job will have the necessary access to function correctly

import 'dotenv/config';
import { createClient as sanityCreateClient } from '@sanity/client';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
const apiVersion = '2024-11-26';

console.log('=== SANITY DELETE Permission Verification ===\n');
console.log(`Project ID: ${projectId}`);
console.log(`Dataset: ${dataset}\n`);

// Test SANITY_STUDIO_READ_WRITE token (used by cleanup job)
const token = process.env.SANITY_STUDIO_READ_WRITE;
console.log('Testing SANITY_STUDIO_READ_WRITE token (used by background cleanup job)...');

if (!token) {
  console.error('ERROR: SANITY_STUDIO_READ_WRITE is not set');
  process.exit(1);
}

const client = sanityCreateClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

const testId = `test-delete-permission-check-${Date.now()}`;

try {
  console.log('\nStep 1: Creating test basketReservation document...');
  const doc = await client.create({
    _id: testId,
    _type: 'basketReservation',
    basketReservation: [],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 900000).toISOString(),
  });
  console.log('✓ CREATE operation succeeded');
  console.log(`  Document ID: ${doc._id}`);

  console.log('\nStep 2: Attempting DELETE operation...');
  await client.delete(testId);
  console.log('✓ DELETE operation succeeded');
  console.log(`  Deleted document: ${testId}`);

  console.log('\n=== VERIFICATION SUCCESSFUL ===');
  console.log('SANITY_STUDIO_READ_WRITE has DELETE permissions on basketReservation documents');
  console.log('The background cleanup job will be able to delete expired reservations');
  process.exit(0);
} catch (error) {
  console.error('\n✗ Operation failed');
  console.error(`  Error: ${error.message}`);
  console.error(`  Details: ${error.description || 'No details'}`);
  
  // Attempt cleanup if create succeeded but delete failed
  try {
    console.log('\nAttempting cleanup of test document...');
    await client.delete(testId);
    console.log('✓ Cleanup succeeded');
  } catch (cleanupError) {
    console.error('✗ Cleanup failed - manual intervention may be required');
    console.error(`  Test document ID: ${testId}`);
  }

  console.log('\n=== VERIFICATION FAILED ===');
  console.log('SANITY_STUDIO_READ_WRITE does NOT have DELETE permissions on basketReservation documents');
  console.log('The background cleanup job will NOT be able to delete expired reservations');
  process.exit(1);
}
