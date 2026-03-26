/**
 * verify-migration.mjs
 *
 * Verification script for the catalogue flat migration.
 * Validates all invariants and reference integrity.
 *
 * USAGE:
 *   1. Add SANITY_API_TOKEN to your .env file (Editor-level read token
 *      from sanity.io/manage → [your project] → API → Tokens)
 *   2. node scripts/verify-migration.mjs
 */

import { createClient } from "next-sanity";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ─── Env ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const API_TOKEN = process.env.SANITY_STUDIO_READ_WRITE_CREATE;

if (!PROJECT_ID) throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env");
if (!DATASET)    throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET in .env");

// ─── Sanity client ────────────────────────────────────────────────────────────

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  useCdn:    false,
  apiVersion: "2024-11-14",
  token:     API_TOKEN,
});

// ─── Verification functions ───────────────────────────────────────────────────

async function verifyMigration() {
  console.log("🔍  Starting catalogue migration verification...");
  console.log(`    Project : ${PROJECT_ID}`);
  console.log(`    Dataset : ${DATASET}`);

  // 1. Fetch all catalogueItem documents
  console.log("\n📥  Fetching all catalogueItem documents...");
  const allItems = await client.fetch(`*[_type == "catalogueItem"]`);
  
  console.log(`    ✓ Found ${allItems.length} catalogueItem documents`);

  // 2. Basic count assertions
  console.log("\n🔢  Verifying document counts...");
  
  const assertions = [
    {
      name: "Total documents count",
      test: allItems.length === 31,
      expected: 31,
      actual: allItems.length
    }
  ];

  // Count by type
  const iconCount = allItems.filter(item => item.icon).length;
  assertions.push({
    name: "Documents with icon (root nodes)",
    test: iconCount === 3,
    expected: 3,
    actual: iconCount
  });

  const linkCount = allItems.filter(item => item.type === "link").length;
  assertions.push({
    name: "Link type documents (leaf nodes)",
    test: linkCount === 20,
    expected: 20,
    actual: linkCount
  });

  const headerCount = allItems.filter(item => item.type === "header").length;
  assertions.push({
    name: "Header type documents (roots + groups)",
    test: headerCount === 11,
    expected: 11,
    actual: headerCount
  });

  // Run assertions
  let passed = 0;
  let failed = 0;
  
  for (const assertion of assertions) {
    if (assertion.test) {
      console.log(`    ✓ PASS: ${assertion.name}`);
      passed++;
    } else {
      console.log(`    ❌ FAIL: ${assertion.name} - expected ${assertion.expected}, got ${assertion.actual}`);
      failed++;
    }
  }

  // 3. Reference integrity
  console.log("\n🔗  Verifying reference integrity...");
  
  // Build lookup map
  const itemById = {};
  for (const item of allItems) {
    itemById[item._id] = item;
  }
  
  let refAssertions = 0;
  let refPassed = 0;
  
  for (const item of allItems) {
    if (Array.isArray(item.children) && item.children.length > 0) {
      for (const childRef of item.children) {
        refAssertions++;
        
        if (childRef._ref && itemById[childRef._ref]) {
          refPassed++;
        } else {
          console.log(`    ❌ FAIL: Reference from "${item.title}" to "${childRef._ref}" does not resolve`);
          failed++;
        }
      }
    }
  }
  
  if (refAssertions === refPassed) {
    console.log(`    ✓ PASS: All ${refAssertions} child references resolve to existing documents`);
    passed++;
  }

  // 4. Product catalogueLocationKeys integrity
  console.log("\n🛍️  Verifying product catalogueLocationKeys integrity...");
  
  const products = await client.fetch(`*[_type == "product"].catalogueLocationKeys`);
  const allLocationKeys = new Set();
  
  for (const keys of products) {
    if (Array.isArray(keys)) {
      for (const key of keys) {
        allLocationKeys.add(key);
      }
    }
  }
  
  console.log(`    ✓ Found ${allLocationKeys.size} unique catalogueLocationKeys across all products`);
  
  let keyAssertions = 0;
  let keyPassed = 0;
  let missingKeys = [];
  
  for (const key of allLocationKeys) {
    keyAssertions++;
    if (itemById[key]) {
      keyPassed++;
    } else {
      missingKeys.push(key);
    }
  }
  
  if (keyAssertions === keyPassed) {
    console.log(`    ✓ PASS: All ${keyAssertions} catalogueLocationKeys resolve to existing catalogueItem documents`);
    passed++;
  } else {
    console.log(`    ❌ FAIL: ${missingKeys.length} catalogueLocationKeys do not resolve: ${missingKeys.join(", ")}`);
    failed++;
  }

  // 5. Summary
  console.log(`\n📊  Verification Summary:`);
  console.log(`    Passed: ${passed}`);
  console.log(`    Failed: ${failed}`);
  
  if (failed === 0) {
    console.log(`
✅  All verification tests passed!

The migration is successful and all invariants are preserved:
  • Document counts match expected values
  • All child references are valid
  • All product catalogueLocationKeys are preserved
`);
    return true;
  } else {
    console.log(`
❌  ${failed} verification tests failed!

Please investigate and fix the issues before proceeding.
`);
    return false;
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

verifyMigration().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((err) => {
  console.error("\n❌  Verification failed:", err.message);
  process.exit(1);
});
