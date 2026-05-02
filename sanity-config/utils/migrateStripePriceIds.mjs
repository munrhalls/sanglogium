import Stripe from "stripe";
import client from "./getClient.mjs";
import readline from "readline";

/**
 * This script creates Stripe Products and Prices for all Sanity products,
 * then saves the stripePriceId back to Sanity.
 *
 * --- HOW TO USE ---
 *
 * 1. Dry Run (Recommended First):
 * $ node ./sanity/utils/migrateStripePriceId.mjs --dry-run
 *
 * 2. Real Migration:
 * $ node ./sanity/utils/migrateStripePriceId.mjs
 */

// Initialize Stripe with your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configuration
const CURRENCY = "usd";
const DELAY_BETWEEN_REQUESTS = 200; // milliseconds (200ms = 5 requests/second, very safe)
const RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRIES = 3;

// Helper function to pause execution
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to prompt user for yes/no
function askUserToContinue(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "yes" || answer.toLowerCase() === "y");
    });
  });
}

// Function to create Stripe Product and Price with retry logic
async function createStripeProductAndPrice(product, isDryRun, retryCount = 0) {
  const { _id, name, displayPrice } = product;

  try {
    if (isDryRun) {
      console.log(
        `[DRY RUN] -> Would create Stripe Product "${name}" with price $${displayPrice}`
      );
      return {
        priceId: "price_dry_run_example",
        productId: "prod_dry_run_example",
      };
    }

    // Step 1: Create the Stripe Product
    const stripeProduct = await stripe.products.create({
      name: name,
      description: `Product from Sang Logium store: ${name}`,
    });

    console.log(`   ✓ Created Stripe Product: ${stripeProduct.id}`);

    // Step 2: Create the Stripe Price attached to this Product
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(displayPrice * 100), // Convert dollars to cents
      currency: CURRENCY,
      product: stripeProduct.id,
    });

    console.log(`   ✓ Created Stripe Price: ${stripePrice.id}`);

    return { priceId: stripePrice.id, productId: stripeProduct.id };
  } catch (error) {
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.warn(
        `   ⚠️ Error creating Stripe Product/Price for "${name}". Retrying in ${RETRY_DELAY / 1000}s... (Attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      console.warn(`   Error: ${error.message}`);

      await sleep(RETRY_DELAY);
      return createStripeProductAndPrice(product, isDryRun, retryCount + 1);
    } else {
      // Max retries exceeded
      throw new Error(
        `Failed to create Stripe Product/Price for "${name}" after ${MAX_RETRIES} attempts: ${error.message}`
      );
    }
  }
}

async function migrateStripePriceIds() {
  const isDryRun = process.argv.includes("--dry-run");

  if (isDryRun) {
    console.log("🚀 Running in DRY RUN mode. No data will be modified.\n");
  } else {
    console.log("🚀 Running in LIVE mode. Data will be modified.\n");
  }

  try {
    // Fetch products that need migration
    // (products with displayPrice but without stripePriceId)
    const productsToMigrate = await client.fetch(
      `*[_type == "product" && defined(displayPrice) && !defined(stripePriceId)]{
        _id,
        name,
        displayPrice
      } | order(name asc)`
    );

    if (productsToMigrate.length === 0) {
      console.log(
        "✅ No products found needing migration. All products already have stripePriceId."
      );
      return;
    }

    console.log(`🔍 Found ${productsToMigrate.length} products to migrate.\n`);

    // Validation: Check for products with invalid data
    const invalidProducts = productsToMigrate.filter(
      (p) => !p.name || typeof p.price !== "number" || p.price <= 0
    );

    if (invalidProducts.length > 0) {
      console.error("❌ Found products with invalid data:");
      invalidProducts.forEach((p) => {
        console.error(
          `   - ${p._id}: name="${p.name}", displayPrice=${p.price}`
        );
      });
      console.error(
        "\nPlease fix these products in Sanity before running migration."
      );
      return;
    }

    // Process each product
    let successCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < productsToMigrate.length; i++) {
      const product = productsToMigrate[i];
      const progress = `[${i + 1}/${productsToMigrate.length}]`;

      console.log(`\n${progress} Processing: "${product.name}"`);
      console.log(`   Sanity ID: ${product._id}`);
      console.log(`   Price: $${product.price}`);

      try {
        // Create Stripe Product and Price
        const { priceId, productId } = await createStripeProductAndPrice(
          product,
          isDryRun
        );

        // Update Sanity document with the stripePriceId
        if (!isDryRun) {
          await client
            .patch(product._id)
            .set({ stripePriceId: priceId })
            .commit();

          console.log(`   ✓ Updated Sanity with stripePriceId: ${priceId}`);
        }

        successCount++;

        // Rate limiting delay (except for the last product)
        if (i < productsToMigrate.length - 1) {
          await sleep(DELAY_BETWEEN_REQUESTS);
        }
      } catch (error) {
        // Error occurred after retries - ask user what to do
        console.error(`\n❌ FAILED: ${error.message}`);
        console.error(`   Product: "${product.name}" (ID: ${product._id})\n`);

        const shouldContinue = await askUserToContinue(
          "Do you want to continue with remaining products? (yes/no): "
        );

        if (!shouldContinue) {
          console.log("\n🛑 Migration stopped by user.");
          console.log(`\n📊 Summary:`);
          console.log(`   ✓ Successfully migrated: ${successCount}`);
          console.log(`   ✗ Failed at: "${product.name}"`);
          console.log(`   ⏭ Remaining: ${productsToMigrate.length - i - 1}`);
          return;
        } else {
          skippedCount++;
          console.log("⏭ Skipping this product and continuing...\n");
        }
      }
    }

    // Final summary
    console.log("\n" + "=".repeat(60));
    if (isDryRun) {
      console.log("🏁 Dry run complete!");
      console.log(`   ${productsToMigrate.length} products would be migrated.`);
    } else {
      console.log("✅ Migration complete!");
      console.log(`   ✓ Successfully migrated: ${successCount}`);
      if (skippedCount > 0) {
        console.log(`   ⏭ Skipped (failed): ${skippedCount}`);
      }
    }
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Fatal error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
migrateStripePriceIds();
