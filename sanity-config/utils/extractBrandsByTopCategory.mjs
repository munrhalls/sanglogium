import client from "./getClient.mjs";

/**
 * Extracts all unique brands for a given top category
 * @param {string} topCategory - The top-level category to extract brands for (e.g., "Electronics")
 */
async function extractBrandsByTopCategory(topCategory) {
  try {
    // Get ALL product details
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      title,
      brand,
      categoryPath
    }`);

    console.log(`Total products in database: ${allProducts.length}`);

    // Filter products that belong to the specified top category
    const filteredProducts = allProducts.filter((product) => {
      // Handle both array and string categoryPath
      const categories = Array.isArray(product.categoryPath)
        ? product.categoryPath
        : [product.categoryPath];

      // Check if any of the categories starts with the specified top category
      return categories.some((cat) => {
        if (typeof cat !== "string") return false;
        const topCat = cat.split("/")[0];
        return topCat === topCategory;
      });
    });

    console.log(
      `Products in ${topCategory} category: ${filteredProducts.length}`,
    );

    // Extract unique brands
    const brands = new Set();
    filteredProducts.forEach((product) => {
      if (product.brand && typeof product.brand === "string") {
        brands.add(product.brand);
      }
    });

    console.log(`\nUnique brands in ${topCategory} category (${brands.size}):`);
    console.log([...brands].sort().join("\n"));

    // Return brands array for further processing if needed
    return [...brands].sort();
  } catch (error) {
    console.error("Error extracting brands:", error);
    return [];
  }
}

// Example usage:
// Replace "Electronics" with the top category you want to extract brands for
extractBrandsByTopCategory("Accessories");
