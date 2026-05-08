#!/usr/bin/env node
import client from "./../getClient.mjs";

/**
 * Script to analyze and output all available sortables for top and nested categories
 * Usage: node analyze-all-sortables.mjs "headphones"
 *
 * Author: Custom Script
 * Version: 1.0.0
 */

// Get the top-level category from command line arguments
const topLevelCategory = process.argv[2];

if (!topLevelCategory) {
  console.log(`
Usage: node analyze-all-sortables.mjs <topLevelCategory>

  topLevelCategory: The top-level category to analyze (e.g., "headphones", "speakers")

Example:
  node analyze-all-sortables.mjs "headphones"
  `);
  process.exit(1);
}

// Function to analyze all sortables
async function analyzeAllSortables() {
  try {
    console.log(
      `Analyzing sortables for top category and nested categories of: "${topLevelCategory}"\n`,
    );

    // Fetch the document by title (since the title is the category name)
    // First try exact match
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

      console.log(
        `\nTry using one of the above category names or check that sortables exist.`,
      );
      return;
    }

    console.log(`Found sortables document: "${doc.title}"\n`);

    // Check if sortables exist in the document
    if (!doc.sortOptions || !Array.isArray(doc.sortOptions)) {
      console.log(
        `No sortables found in the document for ${topLevelCategory}.`,
      );
      return;
    }

    // Display sortables for top-level category
    console.log(`Sortables for top-level category "${topLevelCategory}":`);
    console.log("=======================================================");

    if (doc.sortOptions.length === 0) {
      console.log("No sortables defined for this category.");
    } else {
      doc.sortOptions.forEach((sortOption, index) => {
        console.log(
          `${index + 1}. ${sortOption.displayName || sortOption.name || "Unnamed"}`,
        );
        console.log(`   Name: ${sortOption.name || "N/A"}`);
        console.log(`   Field: ${sortOption.field || "N/A"}`);
        console.log(`   Type: ${sortOption.type || "N/A"}`);
        console.log(
          `   Default Direction: ${sortOption.defaultDirection || "N/A"}`,
        );
        console.log("");
      });
    }

    // Get all nested categories
    if (
      !doc.categoryMappings ||
      !Array.isArray(doc.categoryMappings) ||
      doc.categoryMappings.length === 0
    ) {
      console.log(`No nested categories found for ${topLevelCategory}.`);
      return;
    }

    console.log(`\nFound ${doc.categoryMappings.length} category mappings:\n`);

    // List all available category mappings
    doc.categoryMappings.forEach((mapping, index) => {
      console.log(`${index + 1}. ${mapping.path}`);
    });

    // Process each category mapping one by one
    for (let i = 0; i < doc.categoryMappings.length; i++) {
      const categoryPath = doc.categoryMappings[i].path;
      const mapping = doc.categoryMappings[i];

      console.log(`\n\n=============================================`);
      console.log(
        `ANALYZING CATEGORY ${i + 1}/${doc.categoryMappings.length}: ${categoryPath}`,
      );
      console.log(`=============================================\n`);

      await analyzeSortablesForCategory(doc, mapping);
    }

    // Create a summary of sortables across categories
    console.log(`\n\n=============================================`);
    console.log(`SUMMARY OF SORTABLES ACROSS CATEGORIES`);
    console.log(`=============================================\n`);

    // Create a map of all sortable names to check for consistency
    const sortableNameMap = new Map();

    // Add all available sort options to the map
    doc.sortOptions.forEach((sortOption) => {
      if (sortOption.name) {
        sortableNameMap.set(sortOption.name, {
          displayName: sortOption.displayName || sortOption.name,
          type: sortOption.type,
          field: sortOption.field,
          categories: [],
        });
      }
    });

    // Add category mappings to the sortable map
    doc.categoryMappings.forEach((mapping) => {
      if (mapping.sortOptions && Array.isArray(mapping.sortOptions)) {
        mapping.sortOptions.forEach((sortName) => {
          if (sortableNameMap.has(sortName)) {
            sortableNameMap.get(sortName).categories.push(mapping.path);
          }
        });
      }
    });

    // Display summary
    console.log("Sortable options usage across categories:");
    for (const [name, info] of sortableNameMap.entries()) {
      console.log(`\nSort option: ${info.displayName} (${name})`);
      console.log(`Type: ${info.type}, Field: ${info.field}`);

      if (info.categories.length === 0) {
        console.log("⚠️ Not used in any category");
      } else {
        console.log(`Used in ${info.categories.length} categories:`);
        info.categories.forEach((category) => console.log(`- ${category}`));

        // Check if this sortable is missing in any category
        const allCategories = doc.categoryMappings.map((m) => m.path);
        const missingIn = allCategories.filter(
          (category) => !info.categories.includes(category),
        );

        if (missingIn.length > 0) {
          console.log(`\n⚠️ Missing in ${missingIn.length} categories:`);
          missingIn.forEach((category) => console.log(`- ${category}`));
        }
      }
    }

    console.log(
      `\nCompleted analysis of sortables for "${topLevelCategory}" and its nested categories`,
    );
  } catch (error) {
    console.error("Error:", error);
    console.error(error.stack);
  }
}

// Function to analyze sortables for a specific category path
async function analyzeSortablesForCategory(doc, mapping) {
  const categoryPath = mapping.path;

  // Check if sortables exist for this category
  if (!mapping.sortOptions || !Array.isArray(mapping.sortOptions)) {
    console.log(`No sortables defined for ${categoryPath}.`);
    return;
  }

  // Display sortables for this category
  console.log(`Sortables for ${categoryPath}:`);

  if (mapping.sortOptions.length === 0) {
    console.log("No sortables defined for this category.");
  } else {
    console.log(
      `This category has ${mapping.sortOptions.length} sort options:`,
    );

    // Get details for each sortable
    mapping.sortOptions.forEach((sortName, idx) => {
      const sortOption = doc.sortOptions.find((s) => s.name === sortName);

      if (sortOption) {
        console.log(
          `${idx + 1}. ${sortOption.displayName || sortOption.name} (${sortName})`,
        );
        console.log(`   Field: ${sortOption.field || "N/A"}`);
        console.log(`   Type: ${sortOption.type || "N/A"}`);
        console.log(
          `   Default Direction: ${sortOption.defaultDirection || "N/A"}`,
        );
      } else {
        console.log(
          `${idx + 1}. ⚠️ ${sortName} (NOT FOUND in defined sort options)`,
        );
      }
    });
  }

  // Find available sortables not used in this category
  const unusedSortables = doc.sortOptions.filter(
    (sort) => !mapping.sortOptions.includes(sort.name),
  );

  if (unusedSortables.length > 0) {
    console.log(`\nAvailable sortables NOT used in ${categoryPath}:`);
    unusedSortables.forEach((sortable) => {
      console.log(
        `- ${sortable.displayName || sortable.name} (${sortable.name})`,
      );
    });
  } else {
    console.log(`\n${categoryPath} uses all available sort options.`);
  }
}

// Execute the script
analyzeAllSortables();
