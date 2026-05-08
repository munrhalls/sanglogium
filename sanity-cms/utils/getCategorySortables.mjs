import client from "./getClient.mjs";

/**
 * Fetches categorySortables documents from Sanity CMS
 * @param {string} titleFilter - Optional title to filter by (exact match)
 * @returns {Promise<Array>} - Array of matching categorySortables documents
 */
async function getCategorySortables(titleFilter = null) {
  try {
    // Build the GROQ query based on whether a title filter is provided
    let query = `*[_type == "categorySortables"`;

    // If a title filter is provided, add it to the query
    if (titleFilter) {
      query += ` && title == "${titleFilter}"`;
    }

    // Complete the query with the fields we want to retrieve
    query += `]{
      _id,
      title,
      sortOptions[]{
        name,
        displayName,
        type,
        field,
        defaultDirection
      },
      categoryMappings[]{
        path,
        sortOptions
      }
    }`;

    console.log(`Executing GROQ query: ${query}`);

    // Execute the query
    const results = await client.fetch(query);

    // Return the results
    return results || [];
  } catch (error) {
    console.error("Error fetching categorySortables:", error);
    return [];
  }
}

/**
 * Lists all categorySortables documents in the database
 * This is helpful for debugging when specific document searches fail
 */
async function listAllCategorySortables() {
  try {
    const query = `*[_type == "categorySortables"]{_id, title}`;
    console.log(`Executing list query: ${query}`);

    const results = await client.fetch(query);

    console.log("=== All categorySortables documents in database ===");
    if (results && results.length > 0) {
      results.forEach((doc, index) => {
        console.log(`${index + 1}. Title: "${doc.title}" (ID: ${doc._id})`);
      });
    } else {
      console.log("No categorySortables documents found in the database.");
    }
  } catch (error) {
    console.error("Error listing all categorySortables:", error);
  }
}

/**
 * Displays detailed information about a categorySortables document
 * @param {Object} doc - The document to display
 */
function displayDocument(doc) {
  console.log(`\n==== Document: "${doc.title}" (ID: ${doc._id}) ====`);

  // Display sort options
  console.log("\nSort Options:");
  if (doc.sortOptions && doc.sortOptions.length > 0) {
    doc.sortOptions.forEach((option, index) => {
      console.log(`  ${index + 1}. ${option.displayName} (${option.name})`);
      console.log(`     Type: ${option.type}`);
      console.log(`     Field: ${option.field}`);
      console.log(`     Default Direction: ${option.defaultDirection}`);
    });
  } else {
    console.log("  No sort options defined");
  }

  // Display category mappings
  console.log("\nCategory Mappings:");
  if (doc.categoryMappings && doc.categoryMappings.length > 0) {
    doc.categoryMappings.forEach((mapping, index) => {
      console.log(`  ${index + 1}. Path: ${mapping.path}`);
      if (mapping.sortOptions && mapping.sortOptions.length > 0) {
        console.log(`     Sort Options: ${mapping.sortOptions.join(", ")}`);
      } else {
        console.log("     No sort options assigned");
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
      console.log(
        `Searching for categorySortables with title: "${titleFilter}"`,
      );

      // Get documents matching the title filter
      const results = await getCategorySortables(titleFilter);

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
        await listAllCategorySortables();
      }
    } else {
      // If no title filter provided, list all documents
      console.log(
        "No title filter provided. Listing all categorySortables documents:",
      );
      await listAllCategorySortables();
    }
  } catch (error) {
    console.error("Error in main function:", error);

    // Attempt to list all documents as a fallback in case of error
    console.log("=== Attempting to list all documents as fallback ===");
    await listAllCategorySortables();
  }
}

// Run the main function
main();
