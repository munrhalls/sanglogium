#!/usr/bin/env node

/**
 * Script to fetch all products with empty or missing catalogueLocationKeys from Sanity CMS
 * Usage: node scripts/fetch-products-with-empty-catalogue-keys.mjs
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

async function main() {
  console.log("Fetching products with empty or missing catalogueLocationKeys...\n");

  // Query for products with empty or missing catalogueLocationKeys
  const query = `*[_type == "product" && (!defined(catalogueLocationKeys) || catalogueLocationKeys.length == 0)]`;
  const products = await client.fetch(query);

  console.log(`Found ${products.length} products with empty or missing catalogueLocationKeys\n`);

  // Create output data structure
  const outputData = {
    timestamp: new Date().toISOString(),
    totalProducts: products.length,
    products: products,
  };

  // Ensure output directory exists
  const outputDir = join(__dirname, "migrations", "catalogue-location-keys-migration");
  
  try {
    await import("fs/promises").then(fs => fs.mkdir(outputDir, { recursive: true }));
  } catch (error) {
    // Directory might already exist, ignore error
  }

  // Write to JSON file
  const outputPath = join(outputDir, "products-with-empty-catalogue-keys.json");
  writeFileSync(outputPath, JSON.stringify(outputData, null, 2), "utf-8");

  console.log(`✅ Saved ${products.length} products to: ${outputPath}`);
  
  // Show sample of products
  if (products.length > 0) {
    console.log("\nSample products:");
    products.slice(0, 5).forEach(p => {
      console.log(`  - ${p._id}: ${p.name}`);
    });
    if (products.length > 5) {
      console.log(`  ... and ${products.length - 5} more`);
    }
  }
}

main().catch(console.error);
