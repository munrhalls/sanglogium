#!/usr/bin/env node

/**
 * Script to verify products are deleted from CMS
 * Usage: node scripts/verify-products-deleted.mjs
 */

import { createClient } from "next-sanity";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

// Load the original product list
const productsPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "remaining-products-to-delete.json");
const productsData = JSON.parse(readFileSync(productsPath, "utf-8"));

const productIds = productsData.products.map(p => p._id);

async function main() {
  console.log('========================================');
  console.log('Verify Products Deleted from CMS');
  console.log('========================================\n');

  console.log(`Checking ${productIds.length} products...\n`);

  let deletedCount = 0;
  let stillExistsCount = 0;

  for (const productId of productIds) {
    const product = await client.fetch(`*[_id == $productId][0]`, { productId });
    
    if (product) {
      console.log(`❌ ${productId} - STILL EXISTS`);
      stillExistsCount++;
    } else {
      console.log(`✅ ${productId} - DELETED`);
      deletedCount++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`  Total products checked: ${productIds.length}`);
  console.log(`  Deleted: ${deletedCount}`);
  console.log(`  Still exists: ${stillExistsCount}`);

  if (stillExistsCount === 0) {
    console.log('\n✅ All products successfully deleted!');
  } else {
    console.log('\n⚠️  Some products still exist in CMS');
  }
}

main().catch(console.error);
