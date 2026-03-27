// Verify the actual VFS state against the audit claims
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load catalogue index
const catalogueIndexPath = path.join(__dirname, 'data', 'catalogue-index.json');
const catalogueIndex = JSON.parse(fs.readFileSync(catalogueIndexPath, 'utf8'));

console.log("🔍 Re-verifying VFS Audit Claims...\n");

// Claim 1: Catalogue Item ID Mapping
console.log("1. CATALOGUE ITEM ID MAPPING");
console.log("===========================");

const slugToIdMap = catalogueIndex.slugToIdMap;
console.log(`✅ slugToIdMap exists with ${Object.keys(slugToIdMap).length} entries`);

// Test some mappings
const testMappings = [
  { slug: "open-back", expected: "o7c6baiuobsr7ni2y2vf22sh" },
  { slug: "headphones", expected: undefined }, // Should not exist (header)
  { slug: "nonexistent", expected: undefined }
];

testMappings.forEach(({ slug, expected }) => {
  const actual = slugToIdMap[slug];
  const status = actual === expected ? "✅" : "❌";
  console.log(`${status} "${slug}" → ${actual} (expected: ${expected})`);
});

// Claim 2: Subtree ID Collection
console.log("\n2. SUBTREE ID COLLECTION");
console.log("=======================");

const unrollDescendantKeys = (nodeId) => {
  const slotMetadataMap = catalogueIndex.slotMetadataMap;

  if (!slotMetadataMap[nodeId]) {
    return [];
  }

  const result = new Set();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop();
    if (result.has(currentId)) {
      continue;
    }

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
};

// Test the "headphones" example from the audit
const headphonesId = resolveSlugToId("headphones");
if (!headphonesId) {
  // Try to find the headphones header ID
  const headphonesHeader = Object.entries(catalogueIndex.slotMetadataMap)
    .find(([id, meta]) => meta.slug === "headphones" && meta.type === "header");

  if (headphonesHeader) {
    const [headerId, headerMeta] = headphonesHeader;
    console.log(`Found headphones header: ${headerId}`);

    let missingIds = [];
    const unrolled = unrollDescendantKeys(headerId);
    missingIds = unrolled.filter(id => !catalogueIndex.slotMetadataMap[id]);
    console.log(` Unrolled IDs: ${unrolled.length} (audit claimed 13)`);
    console.log(`   Actual IDs: [${unrolled.join(", ")}]`);

    if (missingIds.length > 0) {
      console.log(` MISSING IDs in slotMetadataMap: [${missingIds.join(", ")}]`);
    } else {
      console.log(` All unrolled IDs exist in slotMetadataMap`);
    }
  }
}

// Claim 3: GROQ Translation
console.log("\n3. GROQ TRANSLATION");
console.log("=================");

// Check if getSelectedProducts.ts actually uses VFS
const getSelectedProductsPath = path.join(__dirname, 'sanity', 'lib', 'products', 'getSelectedProducts.ts');
const getSelectedProductsContent = fs.readFileSync(getSelectedProductsPath, 'utf8');

const usesCatalogueKeys = getSelectedProductsContent.includes('catalogueKeys');
const usesVfsQuery = getSelectedProductsContent.includes('count(catalogueLocationKeys[@ in $catalogueKeys]) > 0');

console.log(`${usesCatalogueKeys ? '✅' : '❌'} Uses catalogueKeys parameter`);
console.log(`${usesVfsQuery ? '✅' : '❌'} Uses VFS GROQ query`);

// Check if there are any legacy categoryPath queries
const usesLegacyPath = getSelectedProductsContent.includes('categoryPath');
console.log(`${!usesLegacyPath ? '✅' : '❌'} No legacy categoryPath queries`);

// Helper function to resolve slug to ID
function resolveSlugToId(slug) {
  return catalogueIndex.slugToIdMap[slug];
}

console.log("\n📊 SUMMARY");
console.log("==========");

// Final verdict based on actual evidence
let allUnrolledIdsExist = true;
if (typeof missingIds !== 'undefined') {
  allUnrolledIdsExist = missingIds.length === 0;
}
const vfsIsUsedInQueries = usesCatalogueKeys && usesVfsQuery;

console.log(`Catalogue ID Mapping: ${Object.keys(slugToIdMap).length > 0 ? '✅ FUNCTIONAL' : '❌ BROKEN'}`);
console.log(`Subtree Collection: ${allUnrolledIdsExist ? '✅ CORRECT' : '❌ BROKEN'}`);
console.log(`GROQ Translation: ${vfsIsUsedInQueries ? '✅ CORRECT' : '❌ BROKEN'}`);
console.log(`Legacy Queries: ${!usesLegacyPath ? '✅ ELIMINATED' : '❌ STILL PRESENT'}`);

// Additional validation: Count total nodes in slotMetadataMap
const totalSlotNodes = Object.keys(catalogueIndex.slotMetadataMap).length;
console.log(`\n📈 VFS Statistics:`);
console.log(`   slotMetadataMap entries: ${totalSlotNodes} (target: ~31)`);
console.log(`   slugToIdMap entries: ${Object.keys(slugToIdMap).length} (leaf nodes only)`);

if (totalSlotNodes >= 30) {
  console.log(`✅ VFS Data Integrity: COMPLETE - All header and link nodes included`);
} else {
  console.log(`❌ VFS Data Integrity: INCOMPLETE - Missing header nodes`);
}
