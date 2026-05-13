#!/usr/bin/env node

/**
 * Script to check which products remain in Sanity CMS after deletion attempt
 * Usage: node scripts/check-remaining-products.mjs
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

async function main() {
  console.log("=== Checking Remaining Products After Deletion ===\n");

  // Read the legacy products JSON file
  const legacyProductsPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "legacy-products-to-be-deleted.json");
  const legacyProductsData = JSON.parse(readFileSync(legacyProductsPath, "utf-8"));

  console.log(`Loaded ${legacyProductsData.totalProducts} products from legacy-products-to-be-deleted.json\n`);

  let remainingCount = 0;
  let deletedCount = 0;
  const remainingProducts = [];

  // Check each product
  for (let i = 0; i < legacyProductsData.products.length; i++) {
    const product = legacyProductsData.products[i];
    const productId = product._id;

    try {
      // Check if product still exists in CMS
      const cmsProduct = await client.fetch(`*[_id == $productId][0]`, { productId });

      if (cmsProduct) {
        remainingCount++;
        remainingProducts.push({
          id: productId,
          name: product.name,
        });
        console.log(`✓ REMAINS: ${productId}: ${product.name}`);
      } else {
        deletedCount++;
        if ((i + 1) % 20 === 0) {
          console.log(`  Checked ${i + 1}/${legacyProductsData.products.length} products...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error checking product ${productId}: ${error.message}`);
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total products in legacy list: ${legacyProductsData.totalProducts}`);
  console.log(`Successfully deleted: ${deletedCount}`);
  console.log(`Remaining in CMS: ${remainingCount}`);

  if (remainingProducts.length > 0) {
    console.log("\n=== Remaining Products ===");
    remainingProducts.forEach(({ id, name }) => {
      console.log(`  - ${id}: ${name}`);
    });
  }

  console.log("\n✅ Check completed");
}

main().catch(console.error);
