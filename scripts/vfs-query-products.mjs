/**
 * VFS Product Query Tool
 * Run: npx tsx scripts/vfs-query-products.mjs <slug>
 * Example: npx tsx scripts/vfs-query-products.mjs open-back
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { sanityFetch } from "../sanity/lib/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load catalogue index
const catalogueIndex = JSON.parse(
  readFileSync(join(__dirname, "../data/catalogue-index.json"), "utf-8")
);

const slug = process.argv[2];

if (!slug) {
  console.log("\n📦 VFS Product Query Tool\n");
  console.log("Usage: npx tsx scripts/vfs-query-products.mjs <slug>");
  console.log("\nAvailable slugs:");
  console.log("  headphones: open-back, closed-back, in-ear, on-ear");
  console.log("  amps: desktop-amps, portable-amps");
  console.log("  dacs: desktop-dacs, portable-dacs");
  console.log("  accessories: earpads, cables, adapters, cases");
  console.log("\nExample: npx tsx scripts/vfs-query-products.mjs open-back\n");
  process.exit(0);
}

function resolveSlugToId(slug) {
  return catalogueIndex.slugToIdMap[slug] || null;
}

function unrollDescendantKeys(nodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;
  
  if (!slotMetadataMap[nodeId]) {
    return [nodeId];
  }
  
  const result = new Set();
  const stack = [nodeId];
  
  while (stack.length > 0) {
    const currentId = stack.pop();
    if (result.has(currentId)) continue;
    
    result.add(currentId);
    const metadata = slotMetadataMap[currentId];
    
    if (metadata?.children?.length > 0) {
      for (const childId of metadata.children) {
        if (!result.has(childId)) {
          stack.push(childId);
        }
      }
    }
  }
  
  return Array.from(result);
}

async function main() {
  console.log(`\n🔍 Querying products for: ${slug}\n`);
  console.log("─".repeat(70));

  // Step 1: Resolve slug to ID
  const catalogId = resolveSlugToId(slug);
  if (!catalogId) {
    console.log(`\n❌ No catalog ID found for slug: ${slug}`);
    console.log(`   Available slugs: ${Object.keys(catalogueIndex.slugToIdMap).join(", ")}\n`);
    process.exit(1);
  }
  console.log(`\n📌 Catalog ID: ${catalogId}`);

  // Step 2: Unroll descendant keys
  const catalogueKeys = unrollDescendantKeys(catalogId);
  console.log(`📊 Catalogue Keys (${catalogueKeys.length}): ${catalogueKeys.join(", ")}`);

  // Step 3: Build GROQ query
  const query = `*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(catalogueKeys)}]) > 0] {
    _id,
    name,
    brand,
    price,
    catalogueLocationKeys,
    "imageUrl": images[0].asset->url
  }`;

  console.log(`\n📝 GROQ Query:`);
  console.log(`   ${query.substring(0, 80)}...\n`);

  // Step 4: Query Sanity
  try {
    const products = await sanityFetch({ query, tags: [`category-${slug}`] });
    
    console.log("─".repeat(70));
    console.log(`\n✅ Retrieved ${products.length} products\n`);
    
    if (products.length === 0) {
      console.log("   No products found for this category.\n");
      return;
    }

    // Format output
    products.forEach((p, i) => {
      const price = p.price ? `$${p.price}` : "Price N/A";
      const brand = p.brand || "Unknown Brand";
      const keys = p.catalogueLocationKeys?.slice(0, 3).join(", ") || "No keys";
      
      console.log(`${(i + 1).toString().padStart(2)}. ${p.name}`);
      console.log(`    Brand: ${brand}`);
      console.log(`    Price: ${price}`);
      console.log(`    Keys:  ${keys}${p.catalogueLocationKeys?.length > 3 ? "..." : ""}`);
      if (p.imageUrl) {
        console.log(`    Image: ${p.imageUrl.substring(0, 60)}...`);
      }
      console.log();
    });

    // Summary
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    const priceRange = products.filter(p => p.price).map(p => p.price);
    const minPrice = priceRange.length ? Math.min(...priceRange) : null;
    const maxPrice = priceRange.length ? Math.max(...priceRange) : null;

    console.log("─".repeat(70));
    console.log(`\n📊 Summary:`);
    console.log(`   Total Products: ${products.length}`);
    console.log(`   Brands: ${brands.slice(0, 5).join(", ")}${brands.length > 5 ? "..." : ""}`);
    if (minPrice && maxPrice) {
      console.log(`   Price Range: $${minPrice} - $${maxPrice}`);
    }
    console.log();

  } catch (error) {
    console.error(`\n❌ Query failed: ${error.message}\n`);
    process.exit(1);
  }
}

main();
