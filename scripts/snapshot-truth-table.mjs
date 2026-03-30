#!/usr/bin/env node
/**
 * Snapshot Truth Table to JSON
 * 
 * Parses verification-consolidated-with-ids.md and outputs structured JSON
 * to both /data/ and _temporary/catalogue-mapping/ directories.
 */

import fs from "fs";
import path from "path";

// Configuration
const SOURCE_FILE = "c:/webdev/sang-logium/_temporary/catalogue-mapping/verification-consolidated-with-ids.md";
const OUTPUT_DIR_1 = "c:/webdev/sang-logium/data";
const OUTPUT_DIR_2 = "c:/webdev/sang-logium/_temporary/catalogue-mapping";
const OUTPUT_FILENAME = "catalogue-truth-table.json";

// ============================================================================
// PARSER
// ============================================================================

function parseConsolidatedWithIds(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  const truthTable = {};
  let currentPath = null;
  let pendingProduct = null;
  let totalProducts = 0;
  let leafNodeCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Section header (e.g., "### /headphones/by-design/open-back")
    const pathMatch = line.match(/^###\s+(\/[^\s]+)$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      if (!truthTable[currentPath]) {
        truthTable[currentPath] = [];
        leafNodeCount++;
      }
      continue;
    }
    
    // Product name line (e.g., "- Product Name  ")
    const productMatch = line.match(/^-\s+(.+?)\s*$/);
    if (productMatch && currentPath) {
      const name = productMatch[1].trim();
      // Skip non-product lines
      if (!name.startsWith("[") && !name.startsWith("**")) {
        pendingProduct = { name };
      }
      continue;
    }
    
    // ID line (e.g., "  **ID:** `abc123`")
    const idMatch = line.match(/^\s+\*\*ID:\*\*\s*`([^`]+)`/);
    if (idMatch && pendingProduct && currentPath) {
      pendingProduct.id = idMatch[1];
      truthTable[currentPath].push(pendingProduct);
      totalProducts++;
      pendingProduct = null;
    }
  }
  
  // Sort products within each path by name
  for (const path of Object.keys(truthTable)) {
    truthTable[path].sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Sort paths alphabetically
  const sortedTruthTable = {};
  Object.keys(truthTable).sort().forEach(key => {
    sortedTruthTable[key] = truthTable[key];
  });
  
  return {
    truthTable: sortedTruthTable,
    totalProducts,
    leafNodeCount
  };
}

// ============================================================================
// VALIDATOR
// ============================================================================

function validateTruthTable(truthTable) {
  const issues = [];
  const allIds = new Set();
  
  for (const [path, products] of Object.entries(truthTable)) {
    // Check for empty paths
    if (products.length === 0) {
      issues.push(`Empty path: ${path}`);
    }
    
    // Check for products without IDs
    for (const product of products) {
      if (!product.id) {
        issues.push(`Missing ID: ${product.name} in ${path}`);
      }
      
      // Check for duplicate IDs
      if (product.id) {
        if (allIds.has(product.id)) {
          issues.push(`Duplicate ID: ${product.id} (${product.name} in ${path})`);
        }
        allIds.add(product.id);
      }
    }
  }
  
  return issues;
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  console.log("=" .repeat(70));
  console.log("SNAPSHOT TRUTH TABLE TO JSON");
  console.log("=" .repeat(70));
  console.log();
  
  // Step 1: Parse source file
  console.log("[1/4] Parsing verification-consolidated-with-ids.md...");
  const { truthTable, totalProducts, leafNodeCount } = parseConsolidatedWithIds(SOURCE_FILE);
  console.log(`      Found ${leafNodeCount} leaf nodes`);
  console.log(`      Found ${totalProducts} products`);
  console.log();
  
  // Step 2: Validate
  console.log("[2/4] Validating truth table...");
  const issues = validateTruthTable(truthTable);
  if (issues.length > 0) {
    console.log(`      ⚠️  ${issues.length} issues found:`);
    for (const issue of issues.slice(0, 5)) {
      console.log(`         - ${issue}`);
    }
    if (issues.length > 5) {
      console.log(`         ... and ${issues.length - 5} more`);
    }
    console.log();
  } else {
    console.log("      ✓ Validation passed");
    console.log();
  }
  
  // Step 3: Build JSON
  console.log("[3/4] Building JSON structure...");
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "verification-consolidated-with-ids.md",
      totalLeafNodes: leafNodeCount,
      totalProducts: totalProducts,
      issues: issues.length > 0 ? issues : undefined
    },
    truthTable
  };
  
  // Remove issues key if empty
  if (issues.length === 0) {
    delete output.metadata.issues;
  }
  
  const jsonContent = JSON.stringify(output, null, 2);
  console.log(`      ✓ JSON built (${jsonContent.length} bytes)`);
  console.log();
  
  // Step 4: Write files
  console.log("[4/4] Writing JSON files...");
  
  // Ensure directories exist
  [OUTPUT_DIR_1, OUTPUT_DIR_2].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Write to both locations
  const outputPath1 = path.join(OUTPUT_DIR_1, OUTPUT_FILENAME);
  const outputPath2 = path.join(OUTPUT_DIR_2, OUTPUT_FILENAME);
  
  fs.writeFileSync(outputPath1, jsonContent, "utf-8");
  fs.writeFileSync(outputPath2, jsonContent, "utf-8");
  
  console.log(`      ✓ ${outputPath1}`);
  console.log(`      ✓ ${outputPath2}`);
  console.log();
  
  // Summary
  console.log("=" .repeat(70));
  console.log("SNAPSHOT COMPLETE");
  console.log("=" .repeat(70));
  console.log();
  console.log(`Leaf nodes: ${leafNodeCount}`);
  console.log(`Products: ${totalProducts}`);
  console.log(`Issues: ${issues.length}`);
  console.log();
  
  if (issues.length === 0) {
    console.log('Log: "Master Truth Table .json locked ' + new Date().toISOString().split("T")[0] + 
      ` — ${leafNodeCount} leaf nodes, ${totalProducts} products, 0 duplicates, 0 orphans"`);
    console.log();
    process.exit(0);
  } else {
    console.log("⚠️  Issues detected - review above");
    process.exit(1);
  }
}

main();
