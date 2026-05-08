#!/usr/bin/env node
import client from "./../getClient.mjs";

/**
 * Script to add Brand sort option to top-level and all nested categories
 * Usage: node update-brand-sortable.mjs "headphones" [--dry-run]
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
Usage: node update-brand-sortable.mjs <topLevelCategory> [--dry-run]

  topLevelCategory: The top-level category to update (e.g., "headphones", "speakers")
  --dry-run: Optional flag to run the script without making actual changes

Example:
  node update-brand-sortable.mjs "headphones"
  node update-brand-sortable.mjs "headphones" --dry-run
  `);
  process.exit(1);
}

// Log dry run mode if enabled
if (dryRun) {
  console.log("DRY RUN MODE: No changes will be made to the database.");
}

// Brand sort option to add
const brandSortOption = {
  name: "brand",
  displayName: "Brand",
  type: "alphabetic",
  field: "brand",
  defaultDirection: "asc",
};

// Function to update sortables
async function updateBrandSortable() {
  try {
    console.log(
      `Adding Brand sortable to top-level category "${topLevelCategory}" and all nested categories\n`,
    );

    // Fetch the document by title
    let doc = await client.fetch(
      `*[_type == "categorySortables" && title == "${topLevelCategory}"][0]`,
    );

    // If not found, try case insensitive match
    if (!doc) {
      doc = await client.fetch(
        `*[_type == "categorySortables" && title match "${topLevelCategory}"][0]`,
      );
    }

    if (!doc) {
      console.log(
        `No sortables document found for category: ${topLevelCategory}`,
      );

      // List available sortable documents to help troubleshooting
      const availableDocs = await client.fetch(
        `*[_type == "categorySortables"].title`,
      );
      if (availableDocs && availableDocs.length > 0) {
        console.log(`\nAvailable category sortable documents:`);
        availableDocs.forEach((title) => console.log(`- ${title}`));
      }

      console.log(`\nTry using one of the above category names.`);
      return;
    }

    console.log(`Found sortables document: "${doc.title}"\n`);

    // Check if sortOptions exists
    if (!doc.sortOptions) {
      doc.sortOptions = [];
    }

    // Check if brand sort option already exists in top-level category
    const hasBrandSort = doc.sortOptions.some(
      (option) => option.name === "brand" || option.name === "Brand",
    );

    // Add brand sort option to top-level category if it doesn't exist
    if (!hasBrandSort) {
      console.log(
        "Brand sort option not found in top-level category. Adding it...",
      );

      if (!isDryRun()) {
        // Update the document with the new sort option
        await client
          .patch(doc._id)
          .setIfMissing({ sortOptions: [] })
          .append("sortOptions", [brandSortOption])
          .commit();

        console.log("Added Brand sort option to top-level category.");

        // Fetch the updated document
        doc = await client.fetch(`*[_id == "${doc._id}"][0]`);
      } else {
        console.log(
          "[DRY RUN] Would add Brand sort option to top-level category.",
        );
      }
    } else {
      console.log("Brand sort option already exists in top-level category.");
    }

    // Now update all nested categories
    if (!doc.categoryMappings || !Array.isArray(doc.categoryMappings)) {
      console.log("\nNo category mappings found. Nothing to update.");
      return;
    }

    console.log(
      `\nChecking ${doc.categoryMappings.length} nested categories for Brand sort option...`,
    );

    // Process each nested category to add the brand sort option if missing
    for (let i = 0; i < doc.categoryMappings.length; i++) {
      const mapping = doc.categoryMappings[i];
      const categoryPath = mapping.path;

      console.log(
        `\nChecking nested category ${i + 1}/${doc.categoryMappings.length}: ${categoryPath}`,
      );

      // Initialize sortOptions array if it doesn't exist
      if (!mapping.sortOptions) {
        mapping.sortOptions = [];
      }

      // Check if brand sort option already exists in this nested category
      const hasBrandSortInNested = mapping.sortOptions.includes("brand");

      // Add brand sort option to nested category if it doesn't exist
      if (!hasBrandSortInNested) {
        console.log(
          `Brand sort option not found in ${categoryPath}. Adding it...`,
        );

        if (!isDryRun()) {
          // Add the new sort option to the array
          mapping.sortOptions.push("brand");

          // Update the document with the modified mapping
          await client
            .patch(doc._id)
            .set({ [`categoryMappings[${i}]`]: mapping })
            .commit();

          console.log(`Added Brand sort option to ${categoryPath}.`);
        } else {
          console.log(
            `[DRY RUN] Would add Brand sort option to ${categoryPath}.`,
          );
        }
      } else {
        console.log(`Brand sort option already exists in ${categoryPath}.`);
      }
    }

    console.log("\nCompleted adding Brand sortable to all categories.");
  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
  }
}

// Function to check for DRY RUN flag
function isDryRun() {
  return dryRun;
}

// Execute the script
updateBrandSortable();
