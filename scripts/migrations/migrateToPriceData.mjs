#!/usr/bin/env node

/**
 * Migration script to convert displayPrice to price_data format
 * Converts displayPrice (dollars) to price_data.unit_amount (cents)
 * Usage: 
 *   Dry run: node scripts/migrations/migrateToPriceData.mjs --dry-run
 *   Live: node scripts/migrations/migrateToPriceData.mjs
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const token = process.env.SANITY_STUDIO_READ_WRITE || process.env.SANITY_API_TOKEN;
console.log(`Using token: ${token ? token.substring(0, 10) + '...' : 'MISSING'}`);
console.log(`Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
console.log(`Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-01-01",
  useCdn: false,
  token: token,
});

const isDryRun = process.argv.includes("--dry-run");

async function migrateToPriceData() {
  console.log("=== MIGRATE TO PRICE_DATA ===");
  console.log(isDryRun ? "🚀 DRY RUN MODE - No changes will be made\n" : "🚀 LIVE MODE - Changes will be applied\n");

  try {
    // Fetch all products with displayPrice
    const products = await client.fetch(`
      *[_type == "product" && defined(displayPrice)] {
        _id,
        name,
        displayPrice,
        "hasPriceData": defined(price_data)
      }
    `);

    console.log(`Found ${products.length} products with displayPrice`);

    // Filter products that need migration (have displayPrice but no price_data)
    const productsToMigrate = products.filter(p => !p.hasPriceData);
    console.log(`Products needing migration: ${productsToMigrate.length}`);

    if (productsToMigrate.length === 0) {
      console.log("✅ All products already have price_data. No migration needed.");
      return;
    }

    // Show migration plan
    console.log("\n=== MIGRATION PLAN ===");
    console.log("The following products will be updated:");
    productsToMigrate.forEach(p => {
      const unitAmount = Math.round(p.displayPrice * 100);
      console.log(`- ${p.name} (${p._id}): $${p.displayPrice} → ${unitAmount} cents`);
    });

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

    // Apply migration using transaction
    console.log("\n=== APPLYING MIGRATION ===");
    const transaction = client.transaction();

    for (const product of productsToMigrate) {
      const unitAmount = Math.round(product.displayPrice * 100);
      
      transaction.patch(product._id, {
        set: {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount
          }
        }
      });
    }

    const result = await transaction.commit();
    console.log(`✅ Successfully migrated ${productsToMigrate.length} products`);
    console.log(`Transaction ID: ${result.transactionId}`);

  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrateToPriceData();
