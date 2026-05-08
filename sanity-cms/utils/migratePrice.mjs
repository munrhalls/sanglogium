import client from "./getClient.mjs";

/**
 * This script migrates data from the old 'price' field to the new 'displayPrice' field
 * for all documents of type 'product'.
 *
 * It is designed to be run from the command line.
 *
 * --- HOW TO USE ---
 *
 * 1. Dry Run (Recommended First):
 * Run this command to see which products will be changed, without actually changing them.
 * $ node ./sanity/utils/migratePrice.mjs --dry-run
 *
 * 2. Real Migration:
 * After confirming the dry run looks correct, run this command to perform the migration.
 * $ node ./sanity/utils/migratePrice.mjs
 *
 */
async function migratePriceToDisplayPrice() {
  // Check for the --dry-run flag in the command line arguments
  const isDryRun = process.argv.includes("--dry-run");

  if (isDryRun) {
    console.log("🚀 Running in DRY RUN mode. No data will be modified.");
  } else {
    console.log("🚀 Running in LIVE mode. Data will be modified.");
  }

  try {
    // 1. Fetch only the documents that need migration.
    // We select products that HAVE a 'price' field but DO NOT have a 'displayPrice' field.
    const productsToMigrate = await client.fetch(
      `*[_type == "product" && defined(price) && !defined(displayPrice)]{_id, name, price}`
    );

    if (productsToMigrate.length === 0) {
      console.log(
        "✅ No products found needing migration. All documents are up to date."
      );
      return;
    }

    console.log(`🔍 Found ${productsToMigrate.length} products to migrate.`);

    // 2. Create a transaction to perform all mutations in one go.
    // This is much more efficient than patching documents one by one.
    const transaction = client.transaction();

    productsToMigrate.forEach((product) => {
      const { _id, name, price } = product;

      if (typeof price !== "number") {
        console.warn(
          `⚠️ Skipping product "${name}" (ID: ${_id}) due to invalid price value:`,
          price
        );
        return; // Skip this one
      }

      if (isDryRun) {
        // In dry run mode, just log what would happen.
        console.log(
          `[DRY RUN] -> Would update "${name}" (ID: ${_id}): Set 'displayPrice' to ${price} and remove old 'price' field.`
        );
      } else {
        // In live mode, add the patch operation to the transaction.
        // We set the new `displayPrice` and unset (remove) the old `price` field for a clean schema.
        transaction.patch(_id, (patch) =>
          patch.set({ displayPrice: price }).unset(["price"])
        );
      }
    });

    // 3. Commit the transaction if not in dry run mode.
    if (!isDryRun) {
      console.log("⚙️ Committing transaction...");
      const result = await transaction.commit();
      console.log(
        `✅ Migration complete! ${result.results.length} products were successfully updated.`
      );
    } else {
      console.log(
        "\n🏁 Dry run finished. Review the logs above to see what would have been changed."
      );
    }
  } catch (error) {
    console.error("❌ An error occurred during migration:", error);
  }
}

// Run the migration function
migratePriceToDisplayPrice();
