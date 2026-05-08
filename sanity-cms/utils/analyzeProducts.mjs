import { cachedDataVersionTag } from "v8";
import client from "./getClient.mjs";

async function analyzeProducts() {
  try {
    // Get ALL product details
    const allProducts = await client.fetch(`*[_type == "product"]{
      _id,
      title,
      brand,
      categoryPath,
      description,
      overviewFields,
      specifications
    }`);

    console.log("Total products in database:", allProducts.length);
    console.log("\nDetailed product information (first 10 products):");
    allProducts.slice(0, 10).forEach((product) => {
      console.log(`\nProduct Details:`);
      console.log(`Title: ${product.title}`);
      console.log(`Brand: ${product.brand}`);
      console.log(`Category: ${product.categoryPath}`);

      // Show description if exists
      if (product.description && product.description.length > 0) {
        const text = product.description
          .map((block) => block.children?.map((child) => child.text).join(" "))
          .join(" ")
          .slice(0, 100);
        console.log(`Description preview: ${text}...`);
      }

      // Show specifications if exists
      if (product.specifications && product.specifications.length > 0) {
        console.log("Specifications preview:");
        product.specifications.slice(0, 3).forEach((spec) => {
          console.log(`  ${spec.title}: ${spec.value}`);
        });
      }
    });

    // Count products by category pattern
    const categoryPatterns = new Map();
    allProducts.forEach((product) => {
      const cats = Array.isArray(product.categoryPath)
        ? product.categoryPath
        : [product.categoryPath];

      cats.forEach((cat) => {
        if (cachedDataVersionTag) {
          if (typeof cat !== "string")
            return "Error: CATEGORYPATH IS NOT A STRING";
          const pattern = cat.split("/")[0]; // Get top-level category
          categoryPatterns.set(
            pattern,
            (categoryPatterns.get(pattern) || 0) + 1,
          );
        }
      });
    });

    console.log("\nProducts by top-level category:");
    categoryPatterns.forEach((count, pattern) => {
      console.log(`${pattern}: ${count} products`);
    });
  } catch (error) {
    console.error("Error analyzing products:", error);
  }
}

analyzeProducts();
