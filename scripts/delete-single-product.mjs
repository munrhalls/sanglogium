#!/usr/bin/env node

/**
 * Script to delete a single product
 * Usage: node scripts/delete-single-product.mjs <productId>
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
const productId = args[0];

if (!productId) {
  console.error('Usage: node scripts/delete-single-product.mjs <productId>');
  process.exit(1);
}

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
  console.log('Delete Single Product from CMS');
  console.log('========================================\n');

  console.log(`Target Product: ${productId}\n`);

  console.log('⚠️  WARNING: This will permanently delete this product from CMS');
  const confirmation = await promptUser('Type "confirm" to proceed: ');
  
  if (confirmation !== 'confirm') {
    console.log('❌ Operation cancelled by user');
    process.exit(0);
  }

  console.log('\n🔄 Deleting product...\n');

  try {
    await client.delete(productId);
    console.log(`✅ Successfully deleted product ${productId}`);
  } catch (error) {
    console.error(`❌ Error deleting product: ${error.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
