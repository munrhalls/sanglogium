#!/usr/bin/env node

/**
 * Diagnostic script to verify parcel data presence in Sanity CMS products
 * Usage: node scripts/verify-parcel-data.mjs
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
const dataset = "production"; // Hardcoded for diagnostic - production dataset
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

// Load migration JSON
const migrationJsonPath = join(__dirname, "migrations", "parcel-migration", "products-to-products-with-parcel-data.json");
const migrationData = JSON.parse(readFileSync(migrationJsonPath, "utf-8"));

async function runDiagnostics() {
  console.log("=== Parcel Data Verification Diagnostic ===\n");

  const products = migrationData.products;
  console.log(`Loaded ${products.length} products from migration JSON\n`);

  let withParcelData = 0;
  let withoutParcelData = 0;
  let notFoundInCms = 0;
  const productsWithoutParcel = [];
  const productsNotFound = [];

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productId = product._id;
    const productName = product.name;

    // Fetch from CMS
    const cmsProduct = await client.fetch(`*[_id == $productId][0]`, { productId });

    if (!cmsProduct) {
      console.log(`❌ ${productId} not found in CMS`);
      notFoundInCms++;
      productsNotFound.push({ id: productId, name: productName });
    } else if (cmsProduct.parcel) {
      withParcelData++;
      if ((i + 1) % 50 === 0) {
        console.log(`  Processed ${i + 1}/${products.length} products...`);
      }
    } else {
      console.log(`⚠️  ${productId} missing parcel data: ${productName}`);
      withoutParcelData++;
      productsWithoutParcel.push({ id: productId, name: productName });
    }
  }

  console.log("\n\n=== Diagnostic Report ===\n");
  console.log(`Total products checked: ${products.length}`);
  console.log(`Products with parcel data: ${withParcelData}`);
  console.log(`Products missing parcel data: ${withoutParcelData}`);
  console.log(`Products not found in CMS: ${notFoundInCms}`);

  if (productsWithoutParcel.length > 0) {
    console.log("\n⚠️  Products Missing Parcel Data:");
    productsWithoutParcel.forEach(({ id, name }) => {
      console.log(`  - ${id}: ${name}`);
    });
  }

  if (productsNotFound.length > 0) {
    console.log("\n❌ Products Not Found in CMS:");
    productsNotFound.forEach(({ id, name }) => {
      console.log(`  - ${id}: ${name}`);
    });
  }

  console.log("\n=== Conclusion ===");
  if (withoutParcelData === 0 && notFoundInCms === 0) {
    console.log("✅ All products have parcel data in CMS");
  } else {
    console.log("❌ Issues found: Some products are missing parcel data or not found in CMS");
  }
}

runDiagnostics().catch(console.error);
