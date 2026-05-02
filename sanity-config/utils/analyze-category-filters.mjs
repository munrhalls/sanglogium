#!/usr/bin/env node
import client from "./getClient.mjs";

/**
 * Script to analyze and output all available filters and their possible values for a specific category path
 * Usage: node analyze-category-filters.mjs "headphones/wired"
 *
 * Author: Custom Script
 * Version: 1.0.0
 */

// Get the category path from command line arguments
const categoryPath = process.argv[2];

if (!categoryPath) {
  console.log(`
Usage: node analyze-category-filters.mjs <categoryPath>

  categoryPath: The specific category path to analyze (e.g., "headphones/wired", "speakers/bluetooth")

Example:
  node analyze-category-filters.mjs "headphones/wired"
  `);
  process.exit(1);
}

async function analyzeFiltersForCategory() {
  try {
    if (!categoryPath || typeof categoryPath !== "string") {
      console.error("Invalid category path provided");
      process.exit(1);
    }

    console.log(`Analyzing filters for category path: "${categoryPath}"`);

    // Extract the top-level category from the path
    const pathParts = categoryPath.split("/");
    if (pathParts.length === 0) {
      console.error("Invalid category path format");
      process.exit(1);
    }

    const topLevelCategory = pathParts[0];

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

    console.log(`\nFound filter document: "${doc.title}"`);

    // Find the specific mapping for this category path
    const mapping = doc.categoryMappings.find((m) => m.path === categoryPath);

    if (!mapping) {
      console.log(`\nNo specific mapping found for path: ${categoryPath}`);
      console.log(`Available paths in this category:`);
      doc.categoryMappings.forEach((m) => console.log(`- ${m.path}`));
      return;
    }

    console.log(`\nFilters available for ${categoryPath}:`);
    console.log("=======================================");

    // Get all filters applicable to this path
    const applicableFilters = doc.filters.filterItems.filter((filter) =>
      mapping.filters.includes(filter.name),
    );

    if (applicableFilters.length === 0) {
      console.log("No filters defined for this category path.");
      return;
    }

    // Output details for each filter
    applicableFilters.forEach((filter) => {
      console.log(`\n[${filter.type.toUpperCase()}] ${filter.name}`);

      switch (filter.type) {
        case "range":
          console.log(
            `  Range: ${filter.min} to ${filter.max} (step: ${filter.step})`,
          );
          break;

        case "multiselect":
        case "checkbox":
        case "radio":
          console.log(`  Options:`);
          filter.options.forEach((option) => {
            console.log(`    - ${option}`);
          });

          if (filter.type === "radio" && filter.defaultValue) {
            console.log(`  Default: ${filter.defaultValue}`);
          }
          break;

        case "boolean":
          console.log(`  Boolean filter (true/false)`);
          break;
      }
    });

    // Get count of products matching this category path
    let productCount;
    try {
      productCount = await client.fetch(
        `count(*[_type == "product" && "${categoryPath}" in categoryPath])`,
      );
    } catch (error) {
      console.log(`Error getting product count: ${error.message}`);
      productCount = "Unable to determine";
    }

    console.log(`\nTotal products in this category: ${productCount}`);

    // Provide a sample value distribution for a multiselect filter (if available)
    const multiselectFilter = applicableFilters.find(
      (f) =>
        f.type === "multiselect" &&
        f.options &&
        Array.isArray(f.options) &&
        f.options.length > 0,
    );

    if (multiselectFilter && multiselectFilter.name) {
      console.log(
        `\nSample distribution for "${multiselectFilter.name}" filter:`,
      );

      // Get product count for each option in the filter
      const brandCounts = await Promise.all(
        multiselectFilter.options.slice(0, 5).map(async (option) => {
          // Use a more robust query that handles string variations and null cases
          const count = await client.fetch(
            `count(*[_type == "product" && "${categoryPath}" in categoryPath && brand match "${option}"])`,
          );
          return { option, count };
        }),
      );

      // Sort by count (highest first) and display
      if (brandCounts && Array.isArray(brandCounts)) {
        brandCounts.sort((a, b) => b.count - a.count);
        brandCounts.forEach(({ option, count }) => {
          if (option && count !== undefined) {
            console.log(`  - ${option}: ${count} products`);
          }
        });

        if (multiselectFilter.options.length > 5) {
          console.log(
            `  ... and ${multiselectFilter.options.length - 5} more options`,
          );
        }
      } else {
        console.log("  Unable to retrieve distribution data");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the script
analyzeFiltersForCategory();
