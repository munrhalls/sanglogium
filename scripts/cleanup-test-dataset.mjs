#!/usr/bin/env node

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// SAFETY: Only allow operations on test dataset
const TARGET_DATASET = "test";
const FORBIDDEN_DATASETS = ["production", "staging", "development"];

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: TARGET_DATASET,
  apiVersion: "2023-01-01",
  useCdn: false,
  token: process.env.SANITY_STUDIO_READ_WRITE_CREATE || process.env.SANITY_API_TOKEN,
});

async function cleanupTestDataset() {
  // SAFETY CHECK: Verify we're not on a forbidden dataset
  if (FORBIDDEN_DATASETS.includes(TARGET_DATASET)) {
    console.error(`❌ SAFETY ERROR: Cannot delete from dataset "${TARGET_DATASET}"`);
    console.error('This operation is only allowed on the test dataset.');
    process.exit(1);
  }

  console.log(`🔒 SAFETY CHECK: Operating on dataset "${TARGET_DATASET}"`);
  console.log(`🔒 SAFETY CHECK: Forbidden datasets: ${FORBIDDEN_DATASETS.join(', ')}`);
  console.log('\nProceeding with cleanup...\n');

  try {
    // Fetch all document IDs in test dataset
    const query = `*[]{_id, _type}`;
    const allDocs = await client.fetch(query);

    // Filter out system documents (starting with _)
    const documentIds = allDocs
      .filter(doc => !doc._id.startsWith('_'))
      .map(doc => doc._id);

    console.log(`Found ${documentIds.length} documents in test dataset`);

    if (documentIds.length === 0) {
      console.log('✅ Test dataset is already empty');
      return;
    }

    // Delete all documents
    console.log(`Deleting ${documentIds.length} documents...`);

    for (const id of documentIds) {
      await client.delete(id);
    }

    console.log(`✅ Successfully deleted ${documentIds.length} documents from test dataset`);
  } catch (error) {
    console.error('Failed to cleanup test dataset:', error);
    process.exit(1);
  }
}

cleanupTestDataset();
