import client from "./getClient.mjs";

/**
 * Get specifications for a product by its name
 * @param {string} productName - The name of the product to find
 * @returns {Promise<object|null>} - An object containing product name and specifications, or null if not found
 */
async function getProductSpecifications(productName) {
  try {
    console.log(`Searching for specifications of: "${productName}"`);

    // First try exact match (retrieving only necessary fields)
    const exactProduct = await client.fetch(
      `*[_type == "product" && name == $productName][0]{
        name,
        brand,
        specifications
      }`,
      { productName },
    );

    if (exactProduct) {
      console.log(`Found exact match for: "${productName}"`);
      return {
        name: exactProduct.name,
        brand: exactProduct.brand,
        specifications: exactProduct.specifications || [],
      };
    }

    console.log("No exact match, trying partial match...");

    // Try partial match using GROQ's match operator
    const partialProduct = await client.fetch(
      `*[_type == "product" && name match "*${productName}*"][0]{
        name,
        brand,
        specifications
      }`,
    );

    if (partialProduct) {
      console.log(`Found partial match: "${partialProduct.name}"`);
      return {
        name: partialProduct.name,
        brand: partialProduct.brand,
        specifications: partialProduct.specifications || [],
      };
    }

    console.log(`No product found matching: "${productName}"`);
    return null;
  } catch (error) {
    console.error(`Error fetching product specifications:`, error);
    return null;
  }
}

/**
 * Format specifications in a readable way
 * @param {Array} specifications - Array of specification objects
 * @returns {string} - Formatted specifications string
 */
function formatSpecifications(specifications) {
  if (!specifications || specifications.length === 0) {
    return "No specifications available for this product.";
  }

  // Sort specifications alphabetically by title
  const sortedSpecs = [...specifications].sort((a, b) =>
    a.title.localeCompare(b.title),
  );

  let result = "";

  // Group specifications by category if they have one
  const specsByCategory = {};
  const uncategorizedSpecs = [];

  sortedSpecs.forEach((spec) => {
    if (spec.category) {
      if (!specsByCategory[spec.category]) {
        specsByCategory[spec.category] = [];
      }
      specsByCategory[spec.category].push(spec);
    } else {
      uncategorizedSpecs.push(spec);
    }
  });

  // Add categorized specs
  Object.keys(specsByCategory)
    .sort()
    .forEach((category) => {
      result += `\n== ${category} ==\n`;
      specsByCategory[category].forEach((spec) => {
        result += `${spec.title}: ${spec.value}\n`;
      });
    });

  // Add uncategorized specs
  if (uncategorizedSpecs.length > 0) {
    if (Object.keys(specsByCategory).length > 0) {
      result += "\n== General Specifications ==\n";
    }

    uncategorizedSpecs.forEach((spec) => {
      result += `${spec.title}: ${spec.value}\n`;
    });
  }

  return result;
}

// Example usage
async function main() {
  const productName = process.argv[2]; // Get product name from command line argument

  if (!productName) {
    console.error("Please provide a product name as an argument");
    console.log('Usage: node getProductSpecifications.mjs "Integra DRX-8.4"');
    process.exit(1);
  }

  const product = await getProductSpecifications(productName);

  if (product) {
    console.log("\n=== PRODUCT SPECIFICATIONS ===");
    console.log(`Product: ${product.name}`);
    console.log(`Brand: ${product.brand}`);
    console.log("\nSpecifications:");
    console.log(formatSpecifications(product.specifications));

    // Output as JSON as well for programmatic use
    console.log("\n=== JSON FORMAT ===");
    console.log(JSON.stringify(product.specifications, null, 2));
  } else {
    console.log("\n=== NO MATCHING PRODUCT FOUND ===");
  }
}

// Run the script
main().catch((err) => console.error("Fatal error:", err));

// Export the functions for use in other modules
export { getProductSpecifications, formatSpecifications };
