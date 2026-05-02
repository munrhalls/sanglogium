import client from "./getClient.mjs";

/**
 * Fetches categoryFilters documents from Sanity CMS
 * @param {string} titleFilter - Optional title to filter by (exact match)
 * @returns {Promise<Array>} - Array of matching categoryFilters documents
 */
async function getCategoryFilters(titleFilter = null) {
  try {
    // Build the GROQ query based on whether a title filter is provided
    let query = `*[_type == "categoryFilters"`;

    // If a title filter is provided, add it to the query
    if (titleFilter) {
      query += ` && title == "${titleFilter}"`;
    }

    // Complete the query with the fields we want to retrieve
    query += `]{
      _id,
      title,
      filters {
        filterItems[] {
          name,
          type,
          filterCategory,
          defaultValue,
          options,
          isMinOnly,
          min,
          max,
          step
        }
      },
      categoryMappings[] {
        path,
        filters
      }
    }`;

    console.log(`Executing GROQ query: ${query}`);

    // Execute the query
    const results = await client.fetch(query);

    // Return the results
    return results || [];
  } catch (error) {
    console.error("Error fetching categoryFilters:", error);
    return [];
  }
}

/**
 * Lists all categoryFilters documents in the database
 * This is helpful for debugging when specific document searches fail
 */
async function listAllCategoryFilters() {
  try {
    const query = `*[_type == "categoryFilters"]{_id, title}`;
    console.log(`Executing list query: ${query}`);

    const results = await client.fetch(query);

    console.log("=== All categoryFilters documents in database ===");
    if (results && results.length > 0) {
      results.forEach((doc, index) => {
        console.log(`${index + 1}. Title: "${doc.title}" (ID: ${doc._id})`);
      });
    } else {
      console.log("No categoryFilters documents found in the database.");
    }
  } catch (error) {
    console.error("Error listing all categoryFilters:", error);
  }
}

/**
 * Displays detailed information about a categoryFilters document
 * @param {Object} doc - The document to display
 */
function displayDocument(doc) {
  console.log(`\n==== Document: "${doc.title}" (ID: ${doc._id}) ====`);

  // Display filter items
  console.log("\nFilter Items:");
  if (
    doc.filters &&
    doc.filters.filterItems &&
    doc.filters.filterItems.length > 0
  ) {
    doc.filters.filterItems.forEach((filter, index) => {
      console.log(`  ${index + 1}. ${filter.name}`);
      console.log(`     Type: ${filter.type}`);
      console.log(`     Filter Category: ${filter.filterCategory}`);

      // Display type-specific properties
      switch (filter.type) {
        case "checkbox":
        case "radio":
        case "multiselect":
          if (filter.options && filter.options.length > 0) {
            console.log(`     Options: ${filter.options.join(", ")}`);
          }
          if (filter.type === "radio" && filter.defaultValue) {
            console.log(`     Default Value: ${filter.defaultValue}`);
          }
          break;
        case "range":
          console.log(`     Min: ${filter.min}`);
          if (!filter.isMinOnly) {
            console.log(`     Max: ${filter.max}`);
          } else {
            console.log(`     Min Only: true`);
          }
          console.log(`     Step: ${filter.step}`);
          break;
        case "boolean":
          // Boolean filters don't have additional properties
          break;
      }
    });
  } else {
    console.log("  No filter items defined");
  }

  // Display category mappings
  console.log("\nCategory Mappings:");
  if (doc.categoryMappings && doc.categoryMappings.length > 0) {
    doc.categoryMappings.forEach((mapping, index) => {
      console.log(`  ${index + 1}. Path: ${mapping.path}`);
      if (mapping.filters && mapping.filters.length > 0) {
        console.log(`     Filters: ${mapping.filters.join(", ")}`);
      } else {
        console.log("     No filters assigned");
      }
    });
  } else {
    console.log("  No category mappings defined");
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Get the title filter from command line arguments if provided
    const titleFilter = process.argv[2] || null;

    if (titleFilter) {
      console.log(`Searching for categoryFilters with title: "${titleFilter}"`);

      // Get documents matching the title filter
      const results = await getCategoryFilters(titleFilter);

      if (results && results.length > 0) {
        console.log(`Found ${results.length} document(s)`);

        // Display each document
        results.forEach((doc) => {
          displayDocument(doc);
        });
      } else {
        console.log("No matching documents found");

        // If no documents found, list all available documents as a fallback
        console.log("\n=== No exact matches found, listing all documents ===");
        await listAllCategoryFilters();
      }
    } else {
      // If no title filter provided, list all documents
      console.log(
        "No title filter provided. Listing all categoryFilters documents:",
      );
      await listAllCategoryFilters();
    }
  } catch (error) {
    console.error("Error in main function:", error);

    // Attempt to list all documents as a fallback in case of error
    console.log("=== Attempting to list all documents as fallback ===");
    await listAllCategoryFilters();
  }
}

// Run the main function
main();
