import client from "./getClient.mjs";

async function inspectProductStructure() {
  try {
    // Get the first few products with ALL their fields
    const products = await client.fetch(`*[_type == "product"][0...5]{...}`);

    console.log(`Retrieved ${products.length} products for inspection`);

    // For each product, log all top-level fields and their types
    products.forEach((product, index) => {
      console.log(`\n===== PRODUCT ${index + 1} =====`);

      // Log all fields and their types
      Object.keys(product).forEach((key) => {
        const value = product[key];
        const type = Array.isArray(value) ? "array" : typeof value;
        const preview = JSON.stringify(value).substring(0, 100);

        console.log(
          `${key} (${type}): ${preview}${preview.length >= 100 ? "..." : ""}`,
        );
      });

      // If there's a "name" field, log it specifically
      if (product.name) {
        console.log("\nNAME FIELD:", product.name);
      }

      // If there's a field that looks like a product title/name, highlight it
      Object.keys(product).forEach((key) => {
        const value = product[key];
        if (
          typeof value === "string" &&
          value.length > 10 &&
          (key.includes("name") ||
            key.includes("title") ||
            key.includes("model"))
        ) {
          console.log(`\nPOTENTIAL PRODUCT NAME FIELD - ${key}:`, value);
        }
      });
    });

    // Get a count of how many products have each field
    const fieldStats = {};
    const allProducts = await client.fetch(`*[_type == "product"]{...}`);

    allProducts.forEach((product) => {
      Object.keys(product).forEach((key) => {
        fieldStats[key] = (fieldStats[key] || 0) + 1;
      });
    });

    console.log("\n===== FIELD STATISTICS =====");
    console.log(`Total products: ${allProducts.length}`);
    Object.keys(fieldStats)
      .sort()
      .forEach((key) => {
        const percentage = Math.round(
          (fieldStats[key] / allProducts.length) * 100,
        );
        console.log(`${key}: ${fieldStats[key]} products (${percentage}%)`);
      });
  } catch (error) {
    console.error("Error inspecting products:", error);
  }
}

inspectProductStructure();
