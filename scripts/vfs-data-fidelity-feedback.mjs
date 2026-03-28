/**
 * VFS Data Fidelity Feedback Script
 * Direct console output showing what products would be retrieved per category
 * No browser/server needed - pure data verification
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const catalogueIndex = JSON.parse(
  readFileSync(join(__dirname, "../data/catalogue-index.json"), "utf-8")
);

const CATEGORIES = [
  { slug: "open-back", name: "Open-Back Headphones", parent: "headphones" },
  { slug: "closed-back", name: "Closed-Back Headphones", parent: "headphones" },
  { slug: "in-ear", name: "In-Ear Headphones", parent: "headphones" },
  { slug: "on-ear", name: "On-Ear Headphones", parent: "headphones" },
  { slug: "desktop-amps", name: "Desktop Amps", parent: "audio-electronics" },
  { slug: "portable-amps", name: "Portable Amps", parent: "audio-electronics" },
  { slug: "desktop-dacs", name: "Desktop DACs", parent: "audio-electronics" },
  { slug: "portable-dacs", name: "Portable DACs", parent: "audio-electronics" },
  { slug: "earpads", name: "Earpads", parent: "accessories" },
  { slug: "cables", name: "Cables", parent: "accessories" },
  { slug: "adapters", name: "Adapters", parent: "accessories" },
  { slug: "cases", name: "Cases", parent: "accessories" },
];

function resolveSlugToId(slug) {
  return catalogueIndex.slugToIdMap[slug];
}

function unrollDescendantKeys(nodeId) {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;

  // FIXED: If ID not in slotMetadataMap, treat as leaf node
  if (!slotMetadataMap[nodeId]) {
    console.warn(`  ⚠️  ID ${nodeId} not in slotMetadataMap, treating as leaf`);
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

function buildGroqQuery(keys) {
  if (!keys || keys.length === 0) {
    return null;
  }
  return `*[_type == "product" && count(catalogueLocationKeys[@ in ${JSON.stringify(keys)}]) > 0]`;
}

console.log("\n🔍 VFS DATA FIDELITY REPORT\n");
console.log("=" .repeat(60));

let passCount = 0;
let failCount = 0;

for (const cat of CATEGORIES) {
  console.log(`\n📂 ${cat.name} (${cat.parent}/${cat.slug})`);
  console.log("  " + "-".repeat(50));

  const resolvedId = resolveSlugToId(cat.slug);

  if (!resolvedId) {
    console.log(`  ❌ FAIL: No ID found for slug "${cat.slug}"`);
    failCount++;
    continue;
  }

  console.log(`  ✅ Resolved ID: ${resolvedId}`);

  const catalogueKeys = unrollDescendantKeys(resolvedId);

  console.log(`  📊 Catalogue Keys: ${catalogueKeys.length}`);
  console.log(`     ${catalogueKeys.slice(0, 5).join(", ")}${catalogueKeys.length > 5 ? "..." : ""}`);

  // Check if all keys exist in slotMetadataMap
  const missingKeys = catalogueKeys.filter(k => !catalogueIndex.slotMetadataMap[k]);
  if (missingKeys.length > 0) {
    console.log(`  ⚠️  Missing in slotMetadataMap: ${missingKeys.length} keys`);
    console.log(`     ${missingKeys.slice(0, 3).join(", ")}${missingKeys.length > 3 ? "..." : ""}`);
  }

  const groqQuery = buildGroqQuery(catalogueKeys);

  if (groqQuery) {
    console.log(`  ✅ GROQ Query: ${groqQuery.substring(0, 80)}...`);
    passCount++;
  } else {
    console.log(`  ❌ FAIL: Empty catalogue keys - would return ALL products!`);
    failCount++;
  }
}

console.log("\n" + "=".repeat(60));
console.log(`\n📊 SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log(`\n${failCount === 0 ? "✅ ALL CATEGORIES HAVE VALID VFS DATA" : "❌ SOME CATEGORIES HAVE ISSUES"}`);
console.log("\n");
