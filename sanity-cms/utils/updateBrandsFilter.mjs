import client from "./getClient.mjs";

/**
 * Fetches a categoryFilters document by title
 * @param {string} title - The title of the document to fetch
 * @returns {Promise<Object>} - The document or null if not found
 */
async function getCategoryFiltersByTitle(title) {
  try {
    const query = `*[_type == "categoryFilters" && title == "${title}"][0]{
      _id,
      title,
      filters,
      categoryMappings
    }`;

    console.log(`Fetching document with title "${title}"...`);
    const document = await client.fetch(query);

    if (!document) {
      console.log(`No document found with title "${title}"`);
      return null;
    }

    return document;
  } catch (error) {
    console.error(`Error fetching document with title "${title}":`, error);
    return null;
  }
}

/**
 * Updates the Brand filter options in a categoryFilters document
 * @param {string} documentTitle - Title of the document to update
 * @param {Array<string>} brandsList - Array of brand names to set as options
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function updateBrandsFilter(documentTitle, brandsList) {
  try {
    // Fetch the document
    const document = await getCategoryFiltersByTitle(documentTitle);
    if (!document) {
      console.error(`Document "${documentTitle}" not found.`);
      return false;
    }

    // Check if document has filters structure
    if (
      !document.filters ||
      !document.filters.filterItems ||
      !Array.isArray(document.filters.filterItems)
    ) {
      console.error(
        `Document "${documentTitle}" doesn't have valid filter items.`,
      );
      return false;
    }

    // Find the Brand filter
    const brandFilterIndex = document.filters.filterItems.findIndex(
      (filter) => filter.name === "Brand",
    );

    if (brandFilterIndex === -1) {
      console.error(`Brand filter not found in document "${documentTitle}".`);
      return false;
    }

    // Get the current brand filter
    const brandFilter = document.filters.filterItems[brandFilterIndex];

    // Display current brands
    console.log("\nCurrent brands in the filter:");
    if (brandFilter.options && Array.isArray(brandFilter.options)) {
      console.log(brandFilter.options.join("\n"));
      console.log(`Total current brands: ${brandFilter.options.length}`);
    } else {
      console.log("No brands currently defined.");
    }

    // Clean and sort the new brands list
    const cleanedBrands = brandsList
      .filter((brand) => brand && brand.trim() !== "")
      .map((brand) => brand.trim());
    const sortedBrands = [...cleanedBrands].sort();

    // Display new brands
    console.log("\nNew brands to be added:");
    console.log(sortedBrands.join("\n"));
    console.log(`Total new brands: ${sortedBrands.length}`);

    // Update the brand filter with the new options
    brandFilter.options = sortedBrands;

    // Create a copy of the filter items array
    const updatedFilterItems = [...document.filters.filterItems];
    updatedFilterItems[brandFilterIndex] = brandFilter;

    // Prepare the updated filters object
    const updatedFilters = {
      ...document.filters,
      filterItems: updatedFilterItems,
    };

    // Confirm the update
    console.log(`\nUpdating "Brand" filter in document "${documentTitle}"...`);

    // Update the document in Sanity
    const result = await client
      .patch(document._id)
      .set({ filters: updatedFilters })
      .commit();

    console.log(
      `Successfully updated "Brand" filter in document "${documentTitle}"`,
    );
    console.log(
      `Previous brand count: ${brandFilter.options.length}, New brand count: ${sortedBrands.length}`,
    );
    return true;
  } catch (error) {
    console.error("Error updating Brand filter:", error);
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Ensure we have at least the document title
    if (process.argv.length < 3) {
      console.log("Usage: node updateBrands.mjs <documentTitle> [brands list]");
      console.log("Example with direct brands list:");
      console.log('node updateBrands.mjs "speakers" "Sony,Bose,JBL"');
      console.log(
        "\nExample with multi-line format (each brand on a new line):",
      );
      console.log('node updateBrands.mjs "speakers" "Sony\nBose\nJBL"');
      return;
    }

    // Get the document title
    const documentTitle = process.argv[2];

    let brandsList = [];

    // Check if brands are provided as command line argument
    if (process.argv.length >= 4) {
      const brandsInput = process.argv.slice(3).join(" ");

      // Try to handle both comma-separated and newline-separated formats
      if (brandsInput.includes("\n")) {
        // Handle multi-line format
        brandsList = brandsInput.split("\n");
      } else if (brandsInput.includes(",")) {
        // Handle comma-separated format
        brandsList = brandsInput.split(",");
      } else {
        // Single brand or space-separated
        brandsList = [brandsInput];
      }
    } else {
      // If no brands provided in command line, read from stdin
      console.log(
        "Please paste your brands list (one per line), then press Ctrl+D (Unix) or Ctrl+Z (Windows) when done:",
      );

      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
      });

      const lines = [];

      // Wait for all input
      await new Promise((resolve) => {
        rl.on("line", (line) => {
          lines.push(line);
        });

        rl.on("close", () => {
          resolve();
        });
      });

      brandsList = lines;
    }

    // Clean the brands list (remove empty entries)
    brandsList = brandsList
      .map((brand) => brand.trim())
      .filter((brand) => brand !== "");

    if (brandsList.length === 0) {
      console.error("No brands provided. Please provide a list of brands.");
      return;
    }

    console.log(`Document to update: "${documentTitle}"`);
    console.log(`Number of brands provided: ${brandsList.length}`);

    // Update the brands filter
    await updateBrandsFilter(documentTitle, brandsList);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the main function
main();
