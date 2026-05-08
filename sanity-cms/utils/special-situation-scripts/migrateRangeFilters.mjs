#!/usr/bin/env node
import client from "../getClient.mjs";

/**
 * Migration script to add isMinOnly field to all range filters
 *
 * Usage: node add-isMinOnly-field.mjs
 *
 * This script will:
 * 1. Find all categoryFilters documents
 * 2. For each document, locate any range filters without an isMinOnly field
 * 3. Add isMinOnly: false to those filters
 * 4. Save the updated document
 */

async function migrateRangeFilters() {
  try {
    console.log(
      "Starting migration to add isMinOnly field to range filters..."
    );

    // Find all categoryFilters documents
    const documents = await client.fetch('*[_type == "categoryFilters"]');

    console.log(
      `Found ${documents.length} categoryFilters documents to examine`
    );

    // Log a sample document to verify structure
    if (documents.length > 0) {
      console.log(
        "Sample document structure:",
        JSON.stringify(documents[0], null, 2)
      );
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const doc of documents) {
      console.log(`\nExamining document: ${doc._id}`);

      // Skip if the document doesn't have filters or filterItems
      if (
        !doc.filters ||
        !doc.filters.filterItems ||
        !Array.isArray(doc.filters.filterItems)
      ) {
        console.log(
          `  Skipping document ${doc._id} - missing filter structure`
        );
        skippedCount++;
        continue;
      }

      // Check if any range filters need updating
      const needsUpdate = doc.filters.filterItems.some(
        (item) => item.type === "range" && item.isMinOnly === undefined
      );

      if (!needsUpdate) {
        console.log(`  Document ${doc._id} doesn't need updates`);
        skippedCount++;
        continue;
      }

      // Make a copy of the filterItems array with isMinOnly added where needed
      const updatedFilterItems = doc.filters.filterItems.map((item) => {
        if (item.type === "range" && item.isMinOnly === undefined) {
          console.log(
            `    Adding isMinOnly: false to range filter "${item.name}" in ${doc._id}`
          );
          return { ...item, isMinOnly: false };
        }
        return item;
      });

      // Create transaction to update the document
      console.log(`  Updating document ${doc._id}`);

      try {
        // Update the document with the modified filterItems while preserving the rest of the structure
        const result = await client
          .patch(doc._id)
          .set({
            "filters.filterItems": updatedFilterItems,
          })
          .commit();

        console.log(`    ✓ Successfully updated ${doc._id}`);
        console.log(`    Updated document ID: ${result._id}`);
        updatedCount++;
      } catch (patchError) {
        console.error(
          `    ✗ Failed to update ${doc._id}: ${patchError.message}`
        );
      }
    }

    console.log("\nMigration summary:");
    console.log(`  Documents examined: ${documents.length}`);
    console.log(`  Documents updated: ${updatedCount}`);
    console.log(`  Documents skipped: ${skippedCount}`);
    console.log("\nMigration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateRangeFilters();
