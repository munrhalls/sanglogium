import client from "./getClient.mjs";

async function findProductsWithGenericSpecs() {
  try {
    // Get all products with their specifications
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      title,
      brand,
      categoryPath,
      specifications
    } | order(title asc)`);

    console.log(`Total products in database: ${allProducts.length}`);

    // Filter products that have specifications with "See product documentation"
    const productsWithGenericSpecs = allProducts.filter((product) => {
      if (!product.specifications || product.specifications.length === 0) {
        return false;
      }

      // Check if any specification has the value "See product documentation"
      return product.specifications.some(
        (spec) =>
          spec.value === "See product documentation" ||
          spec.value === "See product documentation." ||
          spec.value.toLowerCase().includes("see product documentation"),
      );
    });

    console.log(
      `Found ${productsWithGenericSpecs.length} products with generic specifications`,
    );
    console.log("\nProducts with generic specifications:");

    productsWithGenericSpecs.forEach((product, index) => {
      console.log(`\n${index + 1}. Product Details:`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Title: ${product.title}`);
      console.log(`   Brand: ${product.brand || "N/A"}`);
      console.log(
        `   Category Path: ${Array.isArray(product.categoryPath) ? product.categoryPath.join(", ") : product.categoryPath || "N/A"}`,
      );

      // Print the specifications to see exactly what we found
      console.log(`   Specifications:`);
      if (product.specifications && product.specifications.length > 0) {
        product.specifications.forEach((spec) => {
          console.log(`     - ${spec.title}: ${spec.value}`);
        });
      } else {
        console.log(`     No specifications found`);
      }
    });

    // Import fs module
    const fs = await import("fs");

    // Export the list to a JSON file
    fs.writeFileSync(
      "products-with-generic-specs.json",
      JSON.stringify(productsWithGenericSpecs, null, 2),
    );

    // Also export as CSV for easier viewing in spreadsheet software
    const csvHeader = "ID,Title,Brand,CategoryPath\n";
    const csvRows = productsWithGenericSpecs
      .map((product) => {
        const id = product._id.replace(/,/g, " ");
        const title = (product.title || "").replace(/,/g, " ");
        const brand = (product.brand || "N/A").replace(/,/g, " ");
        const categoryPath = (
          Array.isArray(product.categoryPath)
            ? product.categoryPath.join("; ")
            : product.categoryPath || "N/A"
        ).replace(/,/g, " ");

        return `"${id}","${title}","${brand}","${categoryPath}"`;
      })
      .join("\n");

    fs.writeFileSync("products-with-generic-specs.csv", csvHeader + csvRows);

    console.log("\nResults exported to:");
    console.log("- products-with-generic-specs.json");
    console.log("- products-with-generic-specs.csv");
  } catch (error) {
    console.error("Error finding products with generic specifications:", error);
  }
}

findProductsWithGenericSpecs();
