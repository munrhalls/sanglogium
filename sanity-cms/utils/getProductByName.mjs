import client from "./getClient.mjs";

/**
 * Get a product by its name (using the 'name' field in the document)
 * @param {string} productName - The name of the product to find
 * @returns {Promise<object|null>} - The product object or null if not found
 */
async function getProductByName(productName) {
  try {
    console.log(`Searching for product: "${productName}"`);

    // First try exact match
    const exactProduct = await client.fetch(
      `*[_type == "product" && name == $productName][0]{
        _id,
        name,
        brand,
        price,
        sku,
        stock,
        categoryPath,
        description,
        overviewFields,
        specifications,
        image,
        gallery
      }`,
      { productName }
    );

    if (exactProduct) {
      console.log(`Found exact match for: "${productName}"`);
      return exactProduct;
    }

    console.log("No exact match, trying partial match...");

    // Try partial match using GROQ's match operator
    const partialProduct = await client.fetch(
      `*[_type == "product" && name match "*${productName}*"][0]{
        _id,
        name,
        brand,
        price,
        sku,
        stock,
        categoryPath,
        description,
        overviewFields,
        specifications,
        image,
        gallery
      }`
    );

    if (partialProduct) {
      console.log(`Found partial match: "${partialProduct.name}"`);
      return partialProduct;
    }

    console.log(`No product found matching: "${productName}"`);
    return null;
  } catch (error) {
    console.error(`Error fetching product:`, error);
    return null;
  }
}

// Example usage
async function main() {
  const productName = process.argv[2]; // Get product name from command line argument

  if (!productName) {
    console.error("Please provide a product name as an argument");
    console.log('Usage: node getProductByName.mjs "Integra DRX-8.4"');
    process.exit(1);
  }

  const product = await getProductByName(productName);

  if (product) {
    console.log("\n=== PRODUCT FOUND ===");
    console.log(`Name: ${product.name}`);
    console.log(`Brand: ${product.brand}`);
    console.log(`Price: $${product.price}`);
    console.log(`SKU: ${product.sku}`);
    console.log(`Stock: ${product.stock}`);

    console.log("\n=== PRODUCT DETAILS ===");
    console.log(JSON.stringify(product, null, 2));
  } else {
    console.log("\n=== NO MATCHING PRODUCT FOUND ===");
  }
}

// Run the script
main().catch((err) => console.error("Fatal error:", err));

// Export the function for use in other modules
export default getProductByName;
