import client from "./getClient.mjs";
import fs from "fs/promises";
import path from "path";

async function analyzeProducts() {
  console.log("🚀 Starting Product Category Snapshot...");

  try {
    // 1. Fetch raw categoryPath
    const query = `*[_type == "product"] {
      _id,
      name,
      categoryPath
    }`;

    const allProducts = await client.fetch(query);
    console.log(`📦 Fetched ${allProducts.length} products.`);

    // 2. Transform
    const snapshot = allProducts.map((p) => {
      // Normalize: it seems to be an array of strings like ["audio/cables"]
      const paths = p.categoryPath || [];

      // Extract the "leaf" category from the path strings
      // e.g. "audio/cables" -> "cables"
      const leafSlugs = paths
        .map((pathStr) => {
          if (typeof pathStr === "string") {
            const parts = pathStr.split("/");
            return parts[parts.length - 1]; // Take the last part
          }
          return null;
        })
        .filter(Boolean);

      return {
        product_id: p._id,
        product_name: p.name,
        // The raw legacy data
        legacy_paths: paths,
        // The best guess for a slug match
        legacy_slug_guesses: leafSlugs,
      };
    });

    // 3. Write
    const outputPath = path.resolve("legacy_snapshot.json");
    await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2));

    console.log(`\n✅ Snapshot saved to: ${outputPath}`);
    console.log("Sample Entry:");
    console.log(JSON.stringify(snapshot[0], null, 2));
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

analyzeProducts();
