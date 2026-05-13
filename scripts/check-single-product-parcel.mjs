#!/usr/bin/env node

/**
 * Check if a specific product has parcel data in Sanity CMS
 * Usage: node scripts/check-single-product-parcel.mjs <productId>
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

const productId = process.argv[2];

if (!productId) {
  console.error("Usage: node scripts/check-single-product-parcel.mjs <productId>");
  process.exit(1);
}

async function checkProduct() {
  console.log(`=== Checking parcel data for product: ${productId} ===\n`);

  // Fetch published version
  const published = await client.fetch(`*[_id == $id][0]`, { id: productId });
  
  // Fetch draft version
  const draft = await client.fetch(`*[_id == $id][0]`, { id: `drafts.${productId}` });

  console.log("Published version:");
  if (published) {
    console.log(`  Found: ${published.name || '(no name)'}`);
    console.log(`  Has parcel field: ${!!published.parcel}`);
    if (published.parcel) {
      console.log(`  Parcel data:`, JSON.stringify(published.parcel, null, 2));
    }
  } else {
    console.log("  Not found");
  }

  console.log("\nDraft version:");
  if (draft) {
    console.log(`  Found: ${draft.name || '(no name)'}`);
    console.log(`  Has parcel field: ${!!draft.parcel}`);
    if (draft.parcel) {
      console.log(`  Parcel data:`, JSON.stringify(draft.parcel, null, 2));
    }
  } else {
    console.log("  Not found");
  }

  if (!published?.parcel && !draft?.parcel) {
    console.log("\n❌ Product does NOT have parcel data in either published or draft version");
    process.exit(1);
  } else {
    console.log("\n✅ Product has parcel data");
    process.exit(0);
  }
}

checkProduct().catch(console.error);
