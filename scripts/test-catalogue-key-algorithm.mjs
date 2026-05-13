#!/usr/bin/env node

/**
 * Algorithm to map legacy categoryPath to catalogue location leaf ID
 * Separates products into:
 * - Matched products (can be mapped to catalogue location keys)
 * - Unmatched products (legacy products to be deleted)
 * Usage: node scripts/test-catalogue-key-algorithm.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load leaf-id-to-path-map.txt
const mapPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "leaf-id-to-path-map.txt");
const mapContent = readFileSync(mapPath, "utf-8");

// Parse the map into a lookup object
const pathToIdMap = new Map();
const lines = mapContent.split("\n").filter(line => line && !line.startsWith("#"));
lines.forEach(line => {
  const [id, path] = line.split(":");
  if (id && path) {
    pathToIdMap.set(path.trim(), id.trim());
  }
});

console.log("Loaded catalogue location map with", pathToIdMap.size, "entries\n");

// Load legacy path mapping file
const legacyMapPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "current-paths-to-legacy-paths.txt");
const legacyMapContent = readFileSync(legacyMapPath, "utf-8");

// Parse legacy path mapping: format: <current_path>: <legacy_path>
const legacyPathMap = new Map();
legacyMapContent.split("\n").forEach(line => {
  if (line && !line.startsWith("#")) {
    const [currentPath, legacyPath] = line.split(":");
    if (currentPath && legacyPath) {
      legacyPathMap.set(legacyPath.trim(), currentPath.trim());
    }
  }
});

console.log("Loaded legacy path mapping with", legacyPathMap.size, "entries\n");

// Load legacy products for testing
const legacyPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "legacy-products-to-be-deleted.json");
const legacyData = JSON.parse(readFileSync(legacyPath, "utf-8"));

console.log("Loaded", legacyData.products.length, "legacy products for testing\n");

// Algorithm: Normalize categoryPath to match leaf path format
function normalizeCategoryPath(categoryPath) {
  // Convert "Speakers/Outdoor Speakers" to "/speakers/outdoor-speakers"
  if (typeof categoryPath !== 'string') {
    console.warn(`Warning: categoryPath is not a string, got ${typeof categoryPath}:`, categoryPath);
    return null;
  }
  const normalized = categoryPath
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^/, "/");
  return normalized;
}

// Updated algorithm: check legacy path mapping first, then fallback to normalization
function findCatalogueLocationId(categoryPath) {
  if (typeof categoryPath !== 'string') {
    return null;
  }

  // First check legacy path mapping
  const mappedPath = legacyPathMap.get(categoryPath);
  if (mappedPath) {
    const id = pathToIdMap.get(mappedPath);
    if (id) {
      return { id, method: 'legacy_mapping', mappedPath };
    }
  }

  // Fallback to normalization
  const normalized = normalizeCategoryPath(categoryPath);
  if (!normalized) return null;
  
  const id = pathToIdMap.get(normalized);
  if (id) {
    return { id, method: 'normalization', normalizedPath: normalized };
  }

  return null;
}

// Test on products with accessories/tips-and-ear-pads categoryPath
const testProducts = legacyData.products.filter(p => 
  p.categoryPath && p.categoryPath.includes("accessories/tips-and-ear-pads")
);

console.log(`=== Testing on ${testProducts.length} products with accessories/tips-and-ear-pads ===\n`);

const testResults = [];

testProducts.forEach(product => {
  console.log(`\n--- Product: ${product.name} (${product._id}) ---`);
  
  if (!product.categoryPath || product.categoryPath.length === 0) {
    console.log("No categoryPath - cannot map");
    testResults.push({ product, result: null, reason: 'no_category_path' });
    return;
  }

  const matchedKeys = [];
  const mappingDetails = [];

  product.categoryPath.forEach(catPath => {
    const result = findCatalogueLocationId(catPath);
    if (result) {
      matchedKeys.push(result.id);
      mappingDetails.push({
        categoryPath: catPath,
        method: result.method,
        mappedPath: result.mappedPath || result.normalizedPath,
        catalogueId: result.id
      });
      console.log(`✓ ${catPath} -> ${result.id} [${result.method}]`);
    } else {
      mappingDetails.push({
        categoryPath: catPath,
        method: 'no_match',
        mappedPath: null,
        catalogueId: null
      });
      console.log(`✗ ${catPath} -> no match`);
    }
  });

  const hasMatch = matchedKeys.length > 0;
  testResults.push({ 
    product, 
    result: hasMatch ? matchedKeys : null, 
    mappingDetails,
    reason: hasMatch ? 'matched' : 'no_match'
  });
});

console.log("\n=== Summary ===");
const matchedCount = testResults.filter(r => r.result).length;
console.log(`Matched: ${matchedCount}/${testProducts.length}`);
console.log(`Unmatched: ${testProducts.length - matchedCount}/${testProducts.length}`);
