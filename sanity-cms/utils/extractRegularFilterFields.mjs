import client from "./getClient.mjs";

async function extractRegularFilters() {
  try {
    // Get all products with just the regular filter fields
    // Note: Adjust the query based on where regular filters are stored in your Sanity schema
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      title,
      price,
      filters
    }`);

    console.log("Total products in database:", allProducts.length);

    // Create a Set to store unique regular filter titles
    const regularFilterTitles = new Set();

    // Extract all unique regular filter titles
    // This assumes filters are stored in a "filters" array - adjust as needed based on your schema
    allProducts.forEach((product) => {
      // Price is a common regular filter
      if (product.price !== undefined) {
        regularFilterTitles.add("price");
      }

      // Extract from filters array if it exists
      if (Array.isArray(product.filters)) {
        product.filters.forEach((filter) => {
          if (filter.title) {
            regularFilterTitles.add(filter.title);
          }
        });
      }

      // Add other common regular filters based on your schema
      // Example: If you have color as a direct property
      if (product.color) {
        regularFilterTitles.add("color");
      }
    });

    // Convert to array for display
    const uniqueTitles = Array.from(regularFilterTitles);
    console.log("\nUnique regular filter titles found:", uniqueTitles.length);
    console.log(uniqueTitles);

    // Create the regular filters map
    const regularFiltersMap = {};
    uniqueTitles.forEach((title) => {
      regularFiltersMap[title] = true;
    });

    console.log("\nRegular filters map created:");
    console.log(regularFiltersMap);

    // Example of how to use the map
    console.log("\nExample usage:");
    console.log(`Is "price" a regular filter? ${!!regularFiltersMap["price"]}`);
    console.log(
      `Is "Unknown" a regular filter? ${!!regularFiltersMap["Unknown"]}`
    );

    // Return the map for export/use in other modules
    return regularFiltersMap;
  } catch (error) {
    console.error("Error extracting regular filters:", error);
    return {};
  }
}

// Execute the function
const regularFiltersMap = await extractRegularFilters();

// Export the map for use in other modules
export default regularFiltersMap;
