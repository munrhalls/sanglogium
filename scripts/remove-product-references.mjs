#!/usr/bin/env node

/**
 * Script to remove all references to the 22 products from their referencing documents
 * Usage: node scripts/remove-product-references.mjs [--dry-run]
 */

import { createClient } from "next-sanity";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

// Load environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

if (!token) {
  throw new Error("SANITY_STUDIO_READ_WRITE is required");
}

// Create backend client
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

function promptUser(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Function to recursively find and remove product references from an object
// Returns the cleaned object and a list of changes made
function removeProductReferences(obj, targetProductId, path = "", changes = []) {
  if (!obj || typeof obj !== "object") {
    return { obj, changes };
  }

  if (Array.isArray(obj)) {
    // Filter out references to the target product
    const newArray = [];
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i];
      if (item && typeof item === "object") {
        // Check if it's a reference to our target product
        if (item._ref === targetProductId) {
          changes.push({ path: `${path}[${i}]`, type: 'array_item', action: 'removed', value: item._ref });
          continue; // Skip this item
        }
        if (item._id === targetProductId && item._type === "product") {
          changes.push({ path: `${path}[${i}]`, type: 'array_item', action: 'removed', value: item._id });
          continue; // Skip this item
        }
        // Recursively process nested objects
        const result = removeProductReferences(item, targetProductId, `${path}[${i}]`, changes);
        newArray.push(result.obj);
      } else {
        newArray.push(item);
      }
    }
    return { obj: newArray, changes };
  }

  const newObj = { ...obj };
  for (const key in newObj) {
    const value = newObj[key];
    const currentPath = path ? `${path}.${key}` : key;
    
    if (value && typeof value === "object") {
      // Check if this field is a reference to our target product
      if (value._ref === targetProductId) {
        changes.push({ path: currentPath, type: 'field', action: 'removed', value: value._ref });
        delete newObj[key];
      } else if (value._id === targetProductId && value._type === "product") {
        changes.push({ path: currentPath, type: 'field', action: 'removed', value: value._id });
        delete newObj[key];
      } else {
        // Recursively process nested objects
        const result = removeProductReferences(value, targetProductId, currentPath, changes);
        newObj[key] = result.obj;
      }
    }
  }

  return { obj: newObj, changes };
}

async function main() {
  console.log('========================================');
  console.log('Remove Product References from CMS');
  console.log('========================================\n');

  if (dryRun) {
    console.log('⚠️  DRY-RUN MODE - No changes will be made\n');
  }

  // Load the product references data
  const referencesPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "product-references.json");
  const referencesData = JSON.parse(readFileSync(referencesPath, "utf-8"));

  const productIds = Object.keys(referencesData);
  console.log(`Found references for ${productIds.length} products\n`);

  if (!dryRun) {
    console.log('⚠️  WARNING: This will remove all references to these products from CMS');
    const confirmation = await promptUser('Type "confirm" to proceed: ');
    
    if (confirmation !== 'confirm') {
      console.log('❌ Operation cancelled by user');
      process.exit(0);
    }
  }

  console.log('\n🔄 Removing references...\n');

  let totalRemoved = 0;
  let documentsUpdated = 0;
  const schemaTypesToSkip = ['sanity.assist.schemaType.annotations', 'category', 'subcategory', 'brand', 'categoryFilters'];

  // Process each product
  for (const productId of productIds) {
    const referencingDocs = referencesData[productId];
    console.log(`\nProduct ${productId}: ${referencingDocs.length} referencing documents`);

    // Process each referencing document
    for (const doc of referencingDocs) {
      // Skip schema-related documents
      if (schemaTypesToSkip.includes(doc._type) || doc._type.includes('schema') || doc._type.includes('Schema')) {
        console.log(`  ⊗ Skipping ${doc._id} (${doc._type}) - schema-related`);
        continue;
      }

      try {
        // Fetch the full document
        const fullDoc = await client.fetch(`*[_id == $docId][0]`, { docId: doc._id });

        if (!fullDoc) {
          console.log(`  ⚠️  Document ${doc._id} not found (may have been deleted)`);
          continue;
        }

        // Remove references to this product
        const { obj: cleanedDoc, changes } = removeProductReferences(JSON.parse(JSON.stringify(fullDoc)), productId);

        // Check if anything was removed
        const hasChanges = changes.length > 0;

        if (hasChanges) {
          console.log(`  → ${doc._id} (${doc._type}):`);
          changes.forEach(change => {
            console.log(`    - Removed: ${change.path} (${change.value})`);
          });

          if (dryRun) {
            documentsUpdated++;
          } else {
            // Patch the document
            await client.patch(doc._id).set(cleanedDoc).commit();
            console.log(`  ✓ Updated ${doc._id} (${doc._type})`);
            documentsUpdated++;
          }
          totalRemoved += changes.length;
        } else {
          console.log(`  - No changes needed for ${doc._id}`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${doc._id}: ${error.message}`);
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Total documents updated: ${documentsUpdated}`);
  console.log(`  Total references removed: ${totalRemoved}`);

  if (dryRun) {
    console.log('\n✅ Dry-run completed successfully! Run without --dry-run to execute.');
  } else {
    console.log('\n✅ All references removed successfully!');
  }
}

main().catch(console.error);
