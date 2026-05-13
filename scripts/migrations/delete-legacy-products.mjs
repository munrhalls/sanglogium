#!/usr/bin/env node

/**
 * Migration script to delete legacy products from Sanity CMS
 * Usage: node scripts/migrations/delete-legacy-products.mjs [--dry-run]
 */

import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, "..", "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join("=").trim();
  }
});

// Load environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = "production"; // Hardcoded to avoid invalid dataset name from .env
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is required");
}

if (!token) {
  throw new Error("SANITY_STUDIO_READ_WRITE is required");
}

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const customFileArg = args.find(arg => arg.startsWith('--file='));
const customFilePath = customFileArg ? customFileArg.split('=')[1] : null;

// Create backend client
const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

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

async function main() {
  console.log('========================================');
  console.log('Delete Legacy Products from Sanity CMS');
  console.log('========================================\n');

  if (dryRun) {
    console.log('⚠️  DRY-RUN MODE - No changes will be made\n');
  }

  // Read the products JSON file (use custom file if provided)
  const productsPath = customFilePath 
    ? join(__dirname, "..", "..", customFilePath)
    : join(__dirname, "catalogue-location-keys-migration", "legacy-products-to-be-deleted.json");
  const productsData = JSON.parse(readFileSync(productsPath, "utf-8"));

  console.log(`📋 Loaded ${productsData.totalProducts} products from ${customFilePath || 'legacy-products-to-be-deleted.json'}\n`);

  // Show sample of products to be deleted
  console.log('Sample products to be deleted:');
  productsData.products.slice(0, 5).forEach(p => {
    console.log(`  - ${p._id}: ${p.name}`);
  });
  if (productsData.products.length > 5) {
    console.log(`  ... and ${productsData.products.length - 5} more`);
  }

  if (!dryRun) {
    console.log('\n⚠️  WARNING: This will permanently delete products from Sanity CMS');
    const confirmation = await promptUser('Type "confirm" to proceed: ');
    
    if (confirmation !== 'confirm') {
      console.log('❌ Deletion cancelled by user');
      process.exit(0);
    }
  }

  console.log('\n🔄 Deleting products...\n');

  let successCount = 0;
  let failureCount = 0;
  const failedProducts = [];
  const deletedProducts = [];

  // Process each product
  for (let i = 0; i < productsData.products.length; i++) {
    const product = productsData.products[i];
    const productId = product._id;

    try {
      if (dryRun) {
        console.log(`[DRY-RUN] Would delete ${productId}: ${product.name}`);
        successCount++;
        deletedProducts.push({ id: productId, name: product.name });
      } else {
        // Delete the product
        await client.delete(productId);
        
        console.log(`✓ Deleted ${productId}: ${product.name}`);
        successCount++;
        deletedProducts.push({ id: productId, name: product.name });
      }
      
      // Log progress every 10 products
      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1}/${productsData.products.length} products...`);
      }
    } catch (error) {
      failureCount++;
      failedProducts.push({ id: productId, name: product.name, error: error.message });
      console.error(`❌ Failed to delete product ${productId}: ${error.message}`);
    }
  }

  console.log('\n📊 Deletion Summary:');
  console.log(`  Total products processed: ${productsData.products.length}`);
  console.log(`  ✅ Successful deletions: ${successCount}`);
  console.log(`  ❌ Failed deletions: ${failureCount}`);

  if (failedProducts.length > 0) {
    console.log('\n⚠️  Failed products:');
    failedProducts.forEach(({ id, name, error }) => {
      console.log(`  - ${id} (${name}): ${error}`);
    });
  }

  if (!dryRun && deletedProducts.length > 0) {
    console.log('\n📝 Deleted products:');
    deletedProducts.slice(0, 10).forEach(({ id, name }) => {
      console.log(`  - ${id}: ${name}`);
    });
    if (deletedProducts.length > 10) {
      console.log(`  ... and ${deletedProducts.length - 10} more`);
    }
  }

  if (failureCount === 0) {
    if (dryRun) {
      console.log('\n✅ Dry-run completed successfully! Run without --dry-run to execute.');
    } else {
      console.log('\n✅ All products deleted successfully!');
    }
  } else {
    console.log('\n⚠️  Some products failed to delete. Please review the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
