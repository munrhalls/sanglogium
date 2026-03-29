import { createClient } from "next-sanity";
import fs from "fs/promises";
import path from "path";

// Load env vars from .env.local
const envPath = path.resolve(".env.local");
const envContent = await fs.readFile(envPath, "utf-8");
const envVars = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[match[1]] = value;
  }
});

const projectId = envVars.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = envVars.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = envVars.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";

if (!projectId || !dataset) {
  throw new Error("Missing Sanity environment variables in .env.local");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

async function countProductsByLegacyCategory() {
  console.log("🚀 Fetching products with legacy categoryPath...");

  const query = `*[_type == "product" && defined(categoryPath)] {
    _id,
    name,
    categoryPath
  }`;

  const products = await client.fetch(query);
  console.log(`📦 Found ${products.length} products with categoryPath`);

  // Count by category path
  const pathCounts = {};

  for (const product of products) {
    const paths = product.categoryPath || [];
    for (const pathStr of paths) {
      if (typeof pathStr === "string") {
        pathCounts[pathStr] = (pathCounts[pathStr] || 0) + 1;
      }
    }
  }

  // Also count by "leaf" (last segment) for easier mapping
  const leafCounts = {};

  for (const product of products) {
    const paths = product.categoryPath || [];
    for (const pathStr of paths) {
      if (typeof pathStr === "string") {
        const parts = pathStr.split("/");
        const leaf = parts[parts.length - 1];
        leafCounts[leaf] = (leafCounts[leaf] || 0) + 1;
      }
    }
  }

  // Try to map to legacy categories from the old snapshot
  // This requires the legacy-categories-full.json file
  let legacyCategoryCounts = [];

  try {
    const legacyData = await fs.readFile(
      path.resolve("_temporary/catalogue-mapping/legacy-categories-full.json"),
      "utf-8"
    );
    const legacyCategories = JSON.parse(legacyData);

    // Build a map of category names to counts
    for (const category of legacyCategories) {
      const categoryName = category.name?.toLowerCase() || "";
      const count = leafCounts[categoryName] || 0;

      // Also check subcategories
      const subcategories = category.subcategories || [];
      const subcatCounts = subcategories.map(sub => {
        const subName = sub.name?.toLowerCase() || "";
        const subCount = leafCounts[subName] || 0;
        return {
          name: sub.name,
          header: sub.header || null,
          type: sub._type,
          productCount: subCount
        };
      });

      legacyCategoryCounts.push({
        _id: category._id,
        name: category.name,
        order: category.order,
        productCount: count,
        subcategories: subcatCounts
      });
    }
  } catch (err) {
    console.warn("⚠️ Could not load legacy categories file:", err.message);
    // Fallback to just returning raw path counts
    legacyCategoryCounts = Object.entries(pathCounts).map(([path, count]) => ({
      path,
      productCount: count
    }));
  }

  const result = {
    summary: {
      totalProducts: products.length,
      uniquePaths: Object.keys(pathCounts).length,
      uniqueLeafCategories: Object.keys(leafCounts).length
    },
    pathCounts,
    leafCounts,
    legacyCategoryCounts
  };

  const outputPath = path.resolve("_temporary/catalogue-mapping/legacy-categories-products-counts.json");
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

  console.log(`\n✅ Results saved to: ${outputPath}`);
  console.log("\nSummary:");
  console.log(`- Total products: ${result.summary.totalProducts}`);
  console.log(`- Unique paths: ${result.summary.uniquePaths}`);
  console.log(`- Unique leaf categories: ${result.summary.uniqueLeafCategories}`);

  return result;
}

countProductsByLegacyCategory().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
