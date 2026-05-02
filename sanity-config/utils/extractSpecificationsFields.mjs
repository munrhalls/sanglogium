import client from "./getClient.mjs";

async function extractSpecificationFields() {
  try {
    // Get all categoryFilters documents from the CMS
    const categoryFilters = await client.fetch(`*[_type == "categoryFilters"]{
      _id,
      title,
      "filters": filters.filterItems[]{
        name,
        type,
        filterCategory
      }
    }`);

    console.log("Total category filter documents:", categoryFilters.length);

    // Create a Set to store unique specification field names
    const specificationFieldNames = new Set();

    // Extract all filters where filterCategory is "specification"
    categoryFilters.forEach((doc) => {
      if (Array.isArray(doc.filters)) {
        doc.filters.forEach((filter) => {
          if (filter.filterCategory === "specification" && filter.name) {
            specificationFieldNames.add(filter.name);
          }
        });
      }
    });

    // Convert to array for display
    const uniqueTitles = Array.from(specificationFieldNames);
    console.log(
      "\nUnique specification field titles found:",
      uniqueTitles.length,
    );
    console.log(uniqueTitles);

    // Create the specification fields map
    const specificationsFieldsMap = {};
    uniqueTitles.forEach((name) => {
      const lowercaseName = name.toLowerCase();
      specificationsFieldsMap[lowercaseName] = true;
    });

    console.log("\nSpecification fields map created:");
    console.log(specificationsFieldsMap);

    // Example of how to use the map
    console.log("\nExample usage:");
    if (uniqueTitles.length > 0) {
      const exampleTitle = uniqueTitles[0];
      console.log(
        `Is "${exampleTitle}" a specification field? ${!!specificationsFieldsMap[exampleTitle]}`,
      );
    }
    console.log(
      `Is "Unknown" a specification field? ${!!specificationsFieldsMap["Unknown"]}`,
    );

    // Return the map for export/use in other modules
    return specificationsFieldsMap;
  } catch (error) {
    console.error("Error extracting specification fields:", error);
    return {};
  }
}

// Execute the function
const specificationsFieldsMap = await extractSpecificationFields();

// Export the map for use in other modules
export default specificationsFieldsMap;
