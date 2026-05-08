import client from "./getClient.mjs";

async function extractOverviewFieldsMap() {
  try {
    // Get all categoryFilters documents with the new filterCategory field
    const categoryFilters = await client.fetch(`*[_type == "categoryFilters"]{
      _id,
      title,
      "filters": filters.filterItems[]{
        name,
        type,
        filterCategory
      }
    }`);

    console.log("Total categoryFilters documents:", categoryFilters.length);

    // Create a Set to store unique overview field names
    const overviewFieldNames = new Set();

    // Extract all filters where filterCategory is "overview"
    categoryFilters.forEach((doc) => {
      if (Array.isArray(doc.filters)) {
        doc.filters.forEach((filter) => {
          if (filter.filterCategory === "overview" && filter.name) {
            overviewFieldNames.add(filter.name);
          }
        });
      }
    });

    // Create the overview fields map
    const overviewFieldsMap = {};
    overviewFieldNames.forEach((name) => {
      const lowercaseName = name.toLowerCase();
      overviewFieldsMap[lowercaseName] = true;
    });

    console.log("\nOverview fields map created:");
    console.log(overviewFieldsMap);

    // Example of how to use the map
    console.log("\nExample usage:");
    if (overviewFieldNames.size > 0) {
      const exampleName = Array.from(overviewFieldNames)[0];
      console.log(
        `Is "${exampleName}" an overview field? ${!!overviewFieldsMap[exampleName]}`,
      );
    }
    console.log(
      `Is "Price Range" an overview field? ${!!overviewFieldsMap["Price Range"]}`,
    );

    // Add TypeScript interface
    console.log(`
// Add this interface to your TypeScript files
interface OverviewFieldsMap {
  [key: string]: boolean;
}
    `);

    return overviewFieldsMap;
  } catch (error) {
    console.error("Error extracting overview fields map:", error);
    return {};
  }
}

// Execute the function
const overviewFieldsMap = await extractOverviewFieldsMap();

// Export the map for use in other modules
export default overviewFieldsMap;
