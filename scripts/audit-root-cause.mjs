/**
 * Root Cause Audit - Verify slugToIdMap vs Tree Structure
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const catalogueIndex = JSON.parse(
  readFileSync(join(__dirname, "../data/catalogue-index.json"), "utf-8")
);

console.log("\n🔍 ROOT CAUSE AUDIT\n");
console.log("=".repeat(70));

// Get all slugs from tree
const treeSlugs = new Set();
const missingInSlugToIdMap = [];

function extractSlugs(node, path = "") {
  const currentSlug = node.slug?.current;
  const currentPath = currentSlug ? `${path}/${currentSlug}` : path;
  
  // If it's a link type with a slug, it should be in slugToIdMap
  if (node.type === "link" && currentSlug) {
    treeSlugs.add(currentSlug);
    
    // Check if it's in slugToIdMap
    if (!catalogueIndex.slugToIdMap[currentSlug]) {
      missingInSlugToIdMap.push({
        slug: currentSlug,
        id: node._key,
        title: node.title,
        path: currentPath
      });
    }
  }
  
  // Recurse into children
  if (node.children?.length > 0) {
    for (const child of node.children) {
      extractSlugs(child, currentPath);
    }
  }
}

// Process tree
for (const root of catalogueIndex.tree) {
  extractSlugs(root, "");
}

console.log(`\n📊 TREE ANALYSIS:`);
console.log(`   Total link nodes with slugs in tree: ${treeSlugs.size}`);
console.log(`   Slugs in slugToIdMap: ${Object.keys(catalogueIndex.slugToIdMap).length}`);
console.log(`   Missing from slugToIdMap: ${missingInSlugToIdMap.length}`);

if (missingInSlugToIdMap.length > 0) {
  console.log(`\n❌ MISSING SLUGS (will fail to resolve):`);
  for (const item of missingInSlugToIdMap) {
    console.log(`   - "${item.slug}" → ID: ${item.id} (${item.title})`);
  }
}

console.log(`\n✅ PRESENT SLUGS (working):`);
for (const slug of Object.keys(catalogueIndex.slugToIdMap).sort()) {
  console.log(`   - "${slug}" → ${catalogueIndex.slugToIdMap[slug]}`);
}

console.log("\n" + "=".repeat(70));

// Verify slotMetadataMap has all IDs
console.log(`\n📊 SLOT METADATA MAP:`);
const treeIds = new Set();
function extractIds(node) {
  treeIds.add(node._key);
  if (node.children?.length > 0) {
    for (const child of node.children) {
      extractIds(child);
    }
  }
}
for (const root of catalogueIndex.tree) {
  extractIds(root);
}

const metadataIds = new Set(Object.keys(catalogueIndex.slotMetadataMap));
const missingInMetadata = [...treeIds].filter(id => !metadataIds.has(id));

console.log(`   IDs in tree: ${treeIds.size}`);
console.log(`   IDs in slotMetadataMap: ${metadataIds.size}`);
console.log(`   Missing from slotMetadataMap: ${missingInMetadata.length}`);

if (missingInMetadata.length > 0) {
  console.log(`\n⚠️  IDs missing from slotMetadataMap:`);
  for (const id of missingInMetadata.slice(0, 10)) {
    console.log(`   - ${id}${missingInMetadata.length > 10 ? "..." : ""}`);
  }
}

console.log("\n" + "=".repeat(70));
console.log(`\n🔍 ROOT CAUSE VERDICT:`);

if (missingInSlugToIdMap.length > 0) {
  console.log(`\n   ❌ CONFIRMED: Build script is NOT adding all leaf slugs to slugToIdMap`);
  console.log(`      → ${missingInSlugToIdMap.length} slugs are in tree but not in slugToIdMap`);
  console.log(`\n   🔧 FIX REQUIRED: Modify build-catalogue-index.mjs lines 108-111`);
  console.log(`      → Ensure ALL link type nodes with slugs are added to slugToIdMap`);
} else {
  console.log(`\n   ✅ slugToIdMap is complete`);
}

if (missingInMetadata.length > 0) {
  console.log(`\n   ⚠️  slotMetadataMap is incomplete (${missingInMetadata.length} IDs missing)`);
  console.log(`      → unrollDescendantKeys() will fallback to leaf behavior`);
}

console.log("\n");
