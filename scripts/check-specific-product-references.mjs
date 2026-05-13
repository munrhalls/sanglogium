#!/usr/bin/env node

/**
 * Script to check for specific product references in homepageData
 * Usage: node scripts/check-specific-product-references.mjs
 */

import { createClient } from "next-sanity";
import { readFileSync, writeFileSync } from "fs";
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

// Load remaining products list
const remainingProductsPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "remaining-products-to-delete.json");
const remainingProductsData = JSON.parse(readFileSync(remainingProductsPath, "utf-8"));

const failedProductIds = remainingProductsData.products.map(p => p._id);

async function main() {
  console.log("=== Checking Specific Product References in ALL Documents ===\n");

  console.log("Products to check:");
  failedProductIds.forEach(id => {
    console.log(`  - ${id}`);
  });

  // Search for ALL documents that reference these products
  console.log("\n=== Searching for documents referencing these products ===");
  
  const allReferences = {};
  
  for (const productId of failedProductIds) {
    const referencingDocs = await client.fetch(`
      *[references($productId)]{
        _id,
        _type,
        _rev
      }
    `, { productId });
    
    if (referencingDocs.length > 0) {
      console.log(`\nProduct ${productId} is referenced by ${referencingDocs.length} documents:`);
      referencingDocs.forEach(doc => {
        console.log(`  - ${doc._id} (${doc._type})`);
      });
      allReferences[productId] = referencingDocs;
    } else {
      console.log(`\nProduct ${productId}: No references found`);
      allReferences[productId] = [];
    }
  }

  // Save results to file
  const outputPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "product-references.json");
  writeFileSync(outputPath, JSON.stringify(allReferences, null, 2));
  console.log(`\n\nSaved reference data to: ${outputPath}`);
}

main().catch(console.error);
