#!/usr/bin/env node

/**
 * Script to count total referencing documents
 * Usage: node scripts/count-references.mjs
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const referencesPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "product-references.json");
const referencesData = JSON.parse(readFileSync(referencesPath, "utf-8"));

let totalDocs = 0;
const productCounts = {};

for (const productId in referencesData) {
  const docs = referencesData[productId];
  productCounts[productId] = docs.length;
  totalDocs += docs.length;
}

console.log("=== Reference Count Summary ===\n");
console.log(`Total products: ${Object.keys(referencesData).length}`);
console.log(`Total referencing documents: ${totalDocs}`);
console.log(`Average references per product: ${(totalDocs / Object.keys(referencesData).length).toFixed(1)}`);

console.log("\n=== References by Product ===\n");
for (const productId in productCounts) {
  console.log(`${productId}: ${productCounts[productId]} references`);
}
