#!/usr/bin/env node

/**
 * Script to create a mapping between current catalogue paths and legacy category paths
 * Usage: node scripts/create-current-to-legacy-path-map.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load leaf-id-to-path-map.txt (current paths)
const mapPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "leaf-id-to-path-map.txt");
const mapContent = readFileSync(mapPath, "utf-8");

// Extract current paths
const currentPaths = new Set();
const lines = mapContent.split("\n").filter(line => line && !line.startsWith("#"));
lines.forEach(line => {
  const [id, path] = line.split(":");
  if (id && path) {
    currentPaths.add(path.trim());
  }
});

console.log("Extracted", currentPaths.size, "current paths from leaf-id-to-path-map.txt\n");

// Load products with empty catalogue keys
const emptyKeysPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "products-with-empty-catalogue-keys.json");
const emptyKeysData = JSON.parse(readFileSync(emptyKeysPath, "utf-8"));

// Load legacy products to be deleted
const legacyPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "legacy-products-to-be-deleted.json");
const legacyData = JSON.parse(readFileSync(legacyPath, "utf-8"));

// Extract unique legacy category paths
const legacyPaths = new Set();

function extractCategoryPaths(products) {
  products.forEach(product => {
    if (product.categoryPath && Array.isArray(product.categoryPath)) {
      product.categoryPath.forEach(catPath => {
        if (typeof catPath === 'string') {
          legacyPaths.add(catPath);
        }
      });
    }
  });
}

extractCategoryPaths(emptyKeysData.products);
extractCategoryPaths(legacyData.products);

console.log("Extracted", legacyPaths.size, "unique legacy category paths from product files\n");

// Normalize paths for comparison
function normalizePath(path) {
  return path
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^/, "/");
}

// Create mapping
const mappings = [];
const mappedLegacyPaths = new Set();

// Try to find matches
currentPaths.forEach(currentPath => {
  const normalizedCurrent = normalizePath(currentPath);
  
  // Find legacy paths that might match this current path
  const matchingLegacyPaths = Array.from(legacyPaths).filter(legacyPath => {
    const normalizedLegacy = normalizePath(legacyPath);
    return normalizedLegacy === normalizedCurrent ||
           normalizedLegacy.includes(normalizedCurrent.split("/").pop()) ||
           normalizedCurrent.includes(normalizedLegacy.split("/").pop());
  });

  if (matchingLegacyPaths.length > 0) {
    matchingLegacyPaths.forEach(legacyPath => {
      mappings.push({
        currentPath,
        legacyPath,
        matchType: normalizePath(currentPath) === normalizePath(legacyPath) ? "exact" : "partial"
      });
      mappedLegacyPaths.add(legacyPath);
    });
  }
});

// Find unmapped legacy paths
const unmappedLegacyPaths = Array.from(legacyPaths).filter(p => !mappedLegacyPaths.has(p));

// Write mapping file
let output = "# Current Paths to Legacy Paths Map\n";
output += "# Format: <current_path>: <legacy_path> [match_type: exact|partial]\n";
output += "# This mapping is used to correct the algorithm for matching products to catalogue location keys\n";
output += "# Generated at: " + new Date().toISOString() + "\n\n";

mappings.forEach(({ currentPath, legacyPath, matchType }) => {
  output += `${currentPath}: ${legacyPath} [match_type: ${matchType}]\n`;
});

output += "\n# Unmapped legacy paths (need manual mapping):\n";
unmappedLegacyPaths.forEach(path => {
  output += `# ${path}\n`;
});

const outputPath = join(__dirname, "migrations", "catalogue-location-keys-migration", "current-paths-to-legacy-paths.txt");
writeFileSync(outputPath, output, "utf-8");

console.log("=== Results ===");
console.log("Total mappings created:", mappings.length);
console.log("Unmapped legacy paths:", unmappedLegacyPaths.length);
console.log("\nSample mappings:");
mappings.slice(0, 10).forEach(({ currentPath, legacyPath, matchType }) => {
  console.log(`  ${currentPath} -> ${legacyPath} [${matchType}]`);
});
if (mappings.length > 10) {
  console.log(`  ... and ${mappings.length - 10} more`);
}

if (unmappedLegacyPaths.length > 0) {
  console.log("\nSample unmapped legacy paths:");
  unmappedLegacyPaths.slice(0, 5).forEach(path => {
    console.log(`  - ${path}`);
  });
  if (unmappedLegacyPaths.length > 5) {
    console.log(`  ... and ${unmappedLegacyPaths.length - 5} more`);
  }
}

console.log("\n✅ Mapping file created:", outputPath);
