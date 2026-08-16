import fs from "node:fs";

const data = JSON.parse(
  fs.readFileSync("accessories-all-checked.json", "utf8"),
);

// Group products by their Sanity image asset ID (the part before -1024x1024)
const assetGroups = new Map();
for (const product of data) {
  if (!product.imgSrc) continue;
  const match = product.imgSrc.match(/production\/([a-f0-9]+)-/);
  const assetId = match ? match[1] : product.imgSrc;
  if (!assetGroups.has(assetId)) {
    assetGroups.set(assetId, { assetId, url: product.imgSrc, products: [] });
  }
  assetGroups.get(assetId).products.push(product.name);
}

// Sort by product count descending - images reused across many products are placeholders
const sorted = [...assetGroups.values()].sort(
  (a, b) => b.products.length - a.products.length,
);

console.log(`=== Unique image asset IDs: ${sorted.length} ===\n`);
console.log("=== Images reused across MULTIPLE products (placeholders) ===\n");
let placeholderCount = 0;
for (const group of sorted) {
  if (group.products.length > 1) {
    placeholderCount++;
    console.log(`Asset: ${group.assetId}`);
    console.log(`  Used by ${group.products.length} products:`);
    for (const name of group.products) {
      console.log(`    - ${name}`);
    }
    console.log("");
  }
}

console.log(
  `\n=== Images used by exactly 1 product (unique/OK): ${sorted.length - placeholderCount} ===`,
);

// Total products affected by duplicated images
const affectedProducts = sorted
  .filter((g) => g.products.length > 1)
  .flatMap((g) => g.products);
console.log(
  `\nTotal products using a shared/placeholder image: ${affectedProducts.length} of ${data.length}`,
);
