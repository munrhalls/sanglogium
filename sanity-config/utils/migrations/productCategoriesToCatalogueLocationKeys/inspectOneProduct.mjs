import client from "./../../getClient.mjs";

async function inspectProduct() {
  // Fetch one product, raw, no projection
  const product = await client.fetch(`*[_type == "product"][0]`);

  console.log("🔍 RAW PRODUCT DUMP:");
  console.log("--------------------------------------------------");
  console.log(JSON.stringify(product, null, 2));
  console.log("--------------------------------------------------");

  // Specific checks
  console.log("\n🕵️ FIELD CHECK:");
  console.log("1. 'categories' (New Array):", product.categories);
  console.log("2. 'category' (Old String?):", product.category);
  console.log(
    "3. 'categoryPath' (From your old script?):",
    product.categoryPath
  );
  console.log("4. 'tags' (Keywords?):", product.tags);
}

inspectProduct();
