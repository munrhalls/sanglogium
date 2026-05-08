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
 * Adds filter items from one document to another
 * @param {string} sourceTitle - Title of the source document to copy filters from
 * @param {string} targetTitle - Title of the target document to add filters to
 * @param {Array<string>} filterNames - Array of filter names to copy
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
async function addFiltersToDocument(sourceTitle, targetTitle, filterNames) {
  try {
    // Fetch the source document
    const sourceDoc = await getCategoryFiltersByTitle(sourceTitle);
    if (!sourceDoc) {
      console.error(`Source document "${sourceTitle}" not found.`);
      return false;
    }

    // Fetch the target document
    const targetDoc = await getCategoryFiltersByTitle(targetTitle);
    if (!targetDoc) {
      console.error(`Target document "${targetTitle}" not found.`);
      return false;
    }

    // Find the filters to copy
    const filtersToCopy = [];
    const notFound = [];

    // Make sure we have filter items to work with
    if (
      !sourceDoc.filters ||
      !sourceDoc.filters.filterItems ||
      !Array.isArray(sourceDoc.filters.filterItems)
    ) {
      console.error(
        `Source document "${sourceTitle}" doesn't have valid filter items.`,
      );
      return false;
    }

    // Find each requested filter
    for (const filterName of filterNames) {
      const filter = sourceDoc.filters.filterItems.find(
        (item) => item.name === filterName,
      );
      if (filter) {
        filtersToCopy.push(filter);
      } else {
        notFound.push(filterName);
      }
    }

    if (notFound.length > 0) {
      console.warn(
        `Warning: The following filters were not found in the source document: ${notFound.join(", ")}`,
      );
    }

    if (filtersToCopy.length === 0) {
      console.error("No valid filters to copy.");
      return false;
    }

    // Check for duplicate filters in the target document
    // Initialize target filter items array if it doesn't exist
    if (!targetDoc.filters) {
      targetDoc.filters = { filterItems: [] };
    } else if (!targetDoc.filters.filterItems) {
      targetDoc.filters.filterItems = [];
    }

    const targetFilterNames = targetDoc.filters.filterItems.map(
      (filter) => filter.name,
    );
    const duplicateFilters = filtersToCopy.filter((filter) =>
      targetFilterNames.includes(filter.name),
    );

    if (duplicateFilters.length > 0) {
      console.warn(
        `Warning: The following filters already exist in the target document and will be skipped: ${duplicateFilters.map((filter) => filter.name).join(", ")}`,
      );
      // Remove duplicates from the filters to copy
      const filteredFilters = filtersToCopy.filter(
        (filter) => !targetFilterNames.includes(filter.name),
      );
      if (filteredFilters.length === 0) {
        console.error(
          "All filters already exist in the target document. Nothing to add.",
        );
        return false;
      }
      filtersToCopy.length = 0;
      filtersToCopy.push(...filteredFilters);
    }

    // Display the filters that will be copied
    console.log("\nThe following filters will be copied:");
    filtersToCopy.forEach((filter, index) => {
      console.log(`${index + 1}. ${filter.name}`);
      console.log(`   Type: ${filter.type}`);
      console.log(`   Filter Category: ${filter.filterCategory}`);

      // Display type-specific properties
      switch (filter.type) {
        case "checkbox":
        case "radio":
        case "multiselect":
          if (filter.options && filter.options.length > 0) {
            console.log(`   Options: ${filter.options.join(", ")}`);
          }
          if (filter.type === "radio" && filter.defaultValue) {
            console.log(`   Default Value: ${filter.defaultValue}`);
          }
          break;
        case "range":
          console.log(`   Min: ${filter.min}`);
          if (!filter.isMinOnly) {
            console.log(`   Max: ${filter.max}`);
          } else {
            console.log(`   Min Only: true`);
          }
          console.log(`   Step: ${filter.step}`);
          break;
        case "boolean":
          // Boolean filters don't have additional properties
          break;
      }
    });

    // Prepare the updated filters for the target document
    const updatedFilterItems = [
      ...targetDoc.filters.filterItems,
      ...filtersToCopy,
    ];

    // Update the target document in Sanity
    console.log(`\nUpdating document "${targetTitle}" with new filters...`);
    const updatedFilters = {
      ...targetDoc.filters,
      filterItems: updatedFilterItems,
    };

    const result = await client
      .patch(targetDoc._id)
      .set({ filters: updatedFilters })
      .commit();

    console.log(`Successfully updated document "${targetTitle}"`);
    console.log(`Added ${filtersToCopy.length} filter(s)`);
    return true;
  } catch (error) {
    console.error("Error adding filters to document:", error);
    return false;
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    // Check if the required arguments are provided
    if (process.argv.length < 5) {
      console.log(
        "Usage: node addFiltersToDocument.mjs <sourceTitle> <targetTitle> <filter1,filter2,...>",
      );
      console.log(
        'Example: node addFiltersToDocument.mjs "headphones" "speakers" "Brand,Price,Driver Type"',
      );
      return;
    }

    // Get the arguments
    const sourceTitle = process.argv[2];
    const targetTitle = process.argv[3];
    const filterNamesArg = process.argv[4];

    // Parse the filter names
    const filterNames = filterNamesArg.split(",").map((name) => name.trim());

    console.log(`Source document: "${sourceTitle}"`);
    console.log(`Target document: "${targetTitle}"`);
    console.log(`Filters to copy: ${filterNames.join(", ")}`);

    // Add the filters
    await addFiltersToDocument(sourceTitle, targetTitle, filterNames);
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// Run the main function
main();
