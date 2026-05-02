#!/usr/bin/env node
import client from "./../getClient.mjs";

/**
 * Script to update missing stock amount filter for all nested categories
 * Usage: node update-stock-amount-filter.mjs "headphones" [--dry-run]
 *
 * Author: Custom Script
 * Version: 1.0.0
 */

// Process command line arguments
const args = process.argv.slice(2);
let topLevelCategory = null;
let dryRun = false;

// Parse command line arguments
for (const arg of args) {
  if (arg === "--dry-run") {
    dryRun = true;
  } else if (!arg.startsWith("--")) {
    topLevelCategory = arg;
  }
}

if (!topLevelCategory) {
  console.log(`
Usage: node update-stock-amount-filter.mjs <topLevelCategory> [--dry-run]

  topLevelCategory: The top-level category to update (e.g., "headphones", "speakers")
  --dry-run: Optional flag to run the script without making actual changes

Example:
  node update-stock-amount-filter.mjs "headphones"
  node update-stock-amount-filter.mjs "headphones" --dry-run
  `);
  process.exit(1);
}

// Log dry run mode if enabled
if (dryRun) {
  console.log("DRY RUN MODE: No changes will be made to the database.");
}

// Function to update all nested categories
async function updateAllNestedCategories() {
  try {
    console.log(
      `Updating stock amount filter for all nested categories of: "${topLevelCategory}"\n`,
    );

    // Find the category filters document for this top-level category
    const docId = `categoryFilters-${topLevelCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    // Fetch the document
    const doc = await client.fetch(`*[_id == "${docId}"][0]`);

    if (!doc) {
      console.log(`No filter document found for category: ${topLevelCategory}`);
      console.log(
        `Try creating filters first or check that the category exists.`,
      );
      return;
    }

    console.log(`Found filter document: "${doc.title}"\n`);

    // Find the stock amount filter in the top-level category (look for range filter with stock in the name)
    const stockAmountFilter = doc.filters.filterItems.find(
      (filter) =>
        filter.type === "range" &&
        filter.name.toLowerCase().includes("stock") &&
        filter.name.toLowerCase().includes("amount"),
    );

    if (!stockAmountFilter) {
      console.log(
        `No stock amount filter found in the top-level category. Nothing to update.`,
      );
      return;
    }

    console.log(`Found stock amount filter in top-level category:`);
    console.log(JSON.stringify(stockAmountFilter, null, 2));
    console.log(
      `\nFound ${doc.categoryMappings.length} nested categories to check:`,
    );

    // List all available nested categories
    doc.categoryMappings.forEach((mapping, index) => {
      console.log(`${index + 1}. ${mapping.path}`);
    });

    // Process each nested category one by one
    for (let i = 0; i < doc.categoryMappings.length; i++) {
      const categoryPath = doc.categoryMappings[i].path;
      console.log(`\n\n=============================================`);
      console.log(
        `UPDATING CATEGORY ${i + 1}/${doc.categoryMappings.length}: ${categoryPath}`,
      );
      console.log(`=============================================\n`);

      await updateStockAmountFilterForCategory(
        doc,
        categoryPath,
        i,
        docId,
        stockAmountFilter,
      );
    }

    console.log(
      `\nCompleted updating stock amount filter for all nested categories of "${topLevelCategory}"`,
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to update stock amount filter for a specific category path
async function updateStockAmountFilterForCategory(
  doc,
  categoryPath,
  index,
  docId,
  stockAmountFilter,
) {
  try {
    // Find the specific mapping for this category path
    const mapping = doc.categoryMappings[index];

    if (!mapping || mapping.path !== categoryPath) {
      console.log(`No specific mapping found for path: ${categoryPath}`);
      return;
    }

    console.log(`Current filters for ${categoryPath}:`);
    console.log(mapping.filters);

    // Check if stock amount filter is in the mapping
    const hasStockAmountFilter = mapping.filters.includes(
      stockAmountFilter.name,
    );

    if (!hasStockAmountFilter) {
      console.log(
        `\nStock amount filter "${stockAmountFilter.name}" missing in ${categoryPath}. Adding it...`,
      );

      // Add the stock amount filter to the mapping
      mapping.filters.push(stockAmountFilter.name);

      // Update the document with the new mapping
      if (!isDryRun()) {
        await client
          .patch(docId)
          .set({ [`categoryMappings[${index}]`]: mapping })
          .commit();

        console.log(`Added stock amount filter to ${categoryPath}.`);
      } else {
        console.log(
          `[DRY RUN] Would add stock amount filter "${stockAmountFilter.name}" to ${categoryPath}.`,
        );
      }
    } else {
      console.log(`\nStock amount filter already exists in ${categoryPath}.`);
    }

    console.log(`\nUpdated filters for ${categoryPath}:`);
    console.log(mapping.filters);
  } catch (error) {
    console.error("Error updating category:", error);
  }
}

// Function to check for DRY RUN flag
function isDryRun() {
  return dryRun;
}

// Execute the script
updateAllNestedCategories();
