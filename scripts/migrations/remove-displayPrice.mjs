#!/usr/bin/env node

/**
 * Migration script to remove obsolete displayPrice field from all products
 * Establishes price_data as the single source of truth for pricing
 * Usage: 
 *   Dry run: node scripts/migrations/remove-displayPrice.mjs --dry-run
 *   Live: node scripts/migrations/remove-displayPrice.mjs
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const token = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN;
console.log(`Using token: ${token ? token.substring(0, 10) + '...' : 'MISSING'}`);
console.log(`Token source: ${process.env.SANITY_STUDIO_READ_WRITE ? 'SANITY_STUDIO_READ_WRITE' : 'SANITY_API_TOKEN'}`);
console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-11-14",
  useCdn: false,
  token: token,
});

const isDryRun = process.argv.includes("--dry-run");

async function removeDisplayPrice() {
  console.log("=== REMOVE displayPrice FIELD ===");
  console.log(isDryRun ? "🚀 DRY RUN MODE - No changes will be made\n" : "🚀 LIVE MODE - Changes will be applied\n");

  try {
    // Fetch all products with displayPrice
    const products = await client.fetch(`
      *[_type == "product" && defined(displayPrice)] {
        _id,
        name,
        displayPrice,
        "hasPriceData": defined(price_data),
        price_data
      }
    `);

    console.log(`Found ${products.length} products with displayPrice field`);

    if (products.length === 0) {
      console.log("✅ No products have displayPrice field. Nothing to remove.");
      return;
    }

    // Verify all products have price_data before removal
    const productsWithoutPriceData = products.filter(p => !p.hasPriceData);
    if (productsWithoutPriceData.length > 0) {
      console.log("\n❌ CRITICAL ERROR: Cannot proceed");
      console.log(`Found ${productsWithoutPriceData.length} products with displayPrice but NO price_data`);
      console.log("These products would lose pricing information if displayPrice is removed.");
      console.log("\nAffected products:");
      productsWithoutPriceData.forEach(p => {
        console.log(`- ${p.name} (${p._id}): displayPrice=${p.displayPrice}`);
      });
      process.exit(1);
    }

    console.log(`✅ All ${products.length} products have price_data. Safe to proceed.\n`);

    // Show removal plan
    console.log("=== REMOVAL PLAN ===");
    console.log("The following products will have displayPrice field removed:");
    products.slice(0, 10).forEach(p => {
      console.log(`- ${p.name} (${p._id}): displayPrice=${p.displayPrice} → [REMOVED]`);
    });
    if (products.length > 10) {
      console.log(`... and ${products.length - 10} more`);
    }

    if (isDryRun) {
      console.log("\n=== DRY RUN COMPLETE ===");
      console.log("Run without --dry-run to apply changes.");
      return;
    }

    // Ask for confirmation in production
    if (process.env.NEXT_PUBLIC_SANITY_DATASET === "production") {
      console.log("\n=== PRODUCTION MODE ===");
      console.log("This will modify production data. Press Ctrl+C to cancel.");
      console.log("Waiting 5 seconds before proceeding...");
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Apply removal using transaction
    console.log("\n=== APPLYING REMOVAL ===");
    const transaction = client.transaction();

    for (const product of products) {
      transaction.patch(product._id, {
        unset: ["displayPrice"]
      });
    }

    const result = await transaction.commit();
    console.log(`✅ Successfully removed displayPrice from ${products.length} products`);
    console.log(`Transaction ID: ${result.transactionId}`);

  } catch (error) {
    console.error("\n❌ Removal failed:", error.message);
    process.exit(1);
  }
}

removeDisplayPrice();
