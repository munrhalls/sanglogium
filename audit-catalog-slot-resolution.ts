import catalogueIndex from "./data/catalogue-index.json";

/**
 * CATALOG SLOT ID TO PRODUCT RESOLUTION AUDIT REPORT
 * Generated: 2026-03-28
 *
 * Purpose: Systematic mapping of every catalog slot ID to:
 * 1. Unrolled descendant keys (subtree resolution)
 * 2. GROQ query generated
 * 3. Expected products retrieved
 */

interface SlotMetadata {
  title: string;
  url: string;
  slug: string;
  breadcrumbs: Array<{ label: string; url: string }>;
  children: string[];
  type: "header" | "link";
}

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, SlotMetadata>;
  tree: any[];
}

const data = catalogueIndex as unknown as CatalogueIndexData;
const { slotMetadataMap, slugToIdMap } = data;

// Unroll descendant keys for a given node ID
function unrollDescendantKeys(nodeId: string): string[] {
  if (!slotMetadataMap[nodeId]) {
    return [nodeId];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) continue;

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
}

// Generate GROQ query for keys
function generateGroqQuery(keys: string[]): string {
  return `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(name asc)`;
}

// Build the audit table
interface AuditEntry {
  slotId: string;
  title: string;
  type: "header" | "link";
  slug: string;
  url: string;
  children: string[];
  childrenCount: number;
  unrolledKeys: string[];
  unrolledCount: number;
  groqQuery: string;
  isLeafNode: boolean;
  isNavigable: boolean;
}

const auditTable: AuditEntry[] = [];

// Process all slots in slotMetadataMap
for (const [slotId, metadata] of Object.entries(slotMetadataMap)) {
  const unrolledKeys = unrollDescendantKeys(slotId);
  const isLeafNode = metadata.children.length === 0;
  const isNavigable = metadata.type === "link" && metadata.slug !== "";

  auditTable.push({
    slotId,
    title: metadata.title,
    type: metadata.type,
    slug: metadata.slug,
    url: metadata.url,
    children: metadata.children,
    childrenCount: metadata.children.length,
    unrolledKeys,
    unrolledCount: unrolledKeys.length,
    groqQuery: generateGroqQuery(unrolledKeys),
    isLeafNode,
    isNavigable
  });
}

// Sort: headers first (by level), then links alphabetically
auditTable.sort((a, b) => {
  if (a.type !== b.type) return a.type === "header" ? -1 : 1;
  return a.title.localeCompare(b.title);
});

// Generate report
console.log("=".repeat(100));
console.log("CATALOG SLOT ID TO PRODUCT RESOLUTION AUDIT REPORT");
console.log("=".repeat(100));
console.log(`Generated: ${new Date().toISOString()}`);
console.log(`Total Catalog Slots: ${auditTable.length}`);
console.log(`Leaf Nodes (Navigable): ${auditTable.filter(e => e.isLeafNode).length}`);
console.log(`Header Nodes: ${auditTable.filter(e => e.type === "header").length}`);
console.log("");

// Summary by category
console.log("-".repeat(100));
console.log("SUMMARY BY ROOT CATEGORY");
console.log("-".repeat(100));

const headphonesSlots = auditTable.filter(e =>
  e.slotId === "ugyeto8653n495dpf89nzoar" ||
  unrollDescendantKeys("ugyeto8653n495dpf89nzoar").includes(e.slotId)
);
const audioElectronicsSlots = auditTable.filter(e =>
  e.slotId === "ti2wufd15h51jxtq855ogbfa" ||
  unrollDescendantKeys("ti2wufd15h51jxtq855ogbfa").includes(e.slotId)
);
const accessoriesSlots = auditTable.filter(e =>
  e.slotId === "j9ozs17mc0b1nv2gqn2rvmg1" ||
  unrollDescendantKeys("j9ozs17mc0b1nv2gqn2rvmg1").includes(e.slotId)
);

console.log(`\n1. HEADPHONES (Root: ugyeto8653n495dpf89nzoar)`);
console.log(`   Total slots in subtree: ${headphonesSlots.length}`);
console.log(`   Leaf categories: ${headphonesSlots.filter(s => s.isLeafNode).length}`);
headphonesSlots.filter(s => s.isLeafNode).forEach(s => {
  console.log(`      - ${s.title}: ${s.slotId} → GROQ matches products with catalogueLocationKeys containing "${s.slotId}"`);
});

console.log(`\n2. AUDIO ELECTRONICS (Root: ti2wufd15h51jxtq855ogbfa)`);
console.log(`   Total slots in subtree: ${audioElectronicsSlots.length}`);
console.log(`   Leaf categories: ${audioElectronicsSlots.filter(s => s.isLeafNode).length}`);
audioElectronicsSlots.filter(s => s.isLeafNode).forEach(s => {
  console.log(`      - ${s.title}: ${s.slotId} → GROQ matches products with catalogueLocationKeys containing "${s.slotId}"`);
});

console.log(`\n3. ACCESSORIES (Root: j9ozs17mc0b1nv2gqn2rvmg1)`);
console.log(`   Total slots in subtree: ${accessoriesSlots.length}`);
console.log(`   Leaf categories: ${accessoriesSlots.filter(s => s.isLeafNode).length}`);
accessoriesSlots.filter(s => s.isLeafNode).forEach(s => {
  console.log(`      - ${s.title}: ${s.slotId} → GROQ matches products with catalogueLocationKeys containing "${s.slotId}"`);
});

// Detailed table
console.log("\n");
console.log("-".repeat(100));
console.log("DETAILED SLOT RESOLUTION TABLE");
console.log("-".repeat(100));
console.log("");

for (const entry of auditTable) {
  console.log(`┌────────────────────────────────────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ SLOT ID: ${entry.slotId.padEnd(82)} │`);
  console.log(`├────────────────────────────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ Title: ${entry.title.padEnd(85)} │`);
  console.log(`│ Type: ${entry.type.padEnd(86)} │`);
  console.log(`│ Slug: ${(entry.slug || "N/A").padEnd(86)} │`);
  console.log(`│ URL: ${entry.url.padEnd(87)} │`);
  console.log(`│ Navigable: ${(entry.isNavigable ? "YES" : "NO").padEnd(80)} │`);
  console.log(`│ Leaf Node: ${(entry.isLeafNode ? "YES" : "NO").padEnd(81)} │`);
  console.log(`├────────────────────────────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ CHILDREN (${entry.childrenCount}):                                                                                           │`);
  if (entry.children.length > 0) {
    for (const childId of entry.children) {
      const childMeta = slotMetadataMap[childId];
      if (childMeta) {
        console.log(`│   → ${childId} (${childMeta.title})`.padEnd(99) + "│");
      } else {
        console.log(`│   → ${childId} (⚠️ NOT IN slotMetadataMap)`.padEnd(99) + "│");
      }
    }
  } else {
    console.log(`│   (none - this is a leaf node)`.padEnd(99) + "│");
  }
  console.log(`├────────────────────────────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ UNROLLED DESCENDANT KEYS (${entry.unrolledCount} total):                                                                  │`);
  for (const key of entry.unrolledKeys) {
    const keyMeta = slotMetadataMap[key];
    const keyDesc = keyMeta ? keyMeta.title : "(self/leaf)";
    console.log(`│   ${key}`.padEnd(99) + "│");
  }
  console.log(`├────────────────────────────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│ GROQ QUERY:                                                                                        │`);
  console.log(`│   *[_type == "product" && count(catalogueLocationKeys[@ in [`.padEnd(99) + "│");
  const keyList = entry.unrolledKeys.map(k => `"${k}"`).join(", ");
  // Wrap lines for readability
  const lines = keyList.match(/.{1,85}/g) || [keyList];
  for (const line of lines) {
    console.log(`│     ${line}`.padEnd(99) + "│");
  }
  console.log(`│   ]]) > 0] | order(name asc)`.padEnd(99) + "│");
  console.log(`└────────────────────────────────────────────────────────────────────────────────────────────────────┘`);
  console.log("");
}

// Data fidelity assessment
console.log("\n");
console.log("=".repeat(100));
console.log("DATA FIDELITY ASSESSMENT");
console.log("=".repeat(100));
console.log("");

// Check for orphaned children
console.log("ORPHANED CHILDREN CHECK:");
let orphanedCount = 0;
for (const [slotId, metadata] of Object.entries(slotMetadataMap)) {
  for (const childId of metadata.children) {
    if (!slotMetadataMap[childId]) {
      console.log(`  ⚠️  Slot "${slotId}" (${metadata.title}) references orphaned child: ${childId}`);
      orphanedCount++;
    }
  }
}
if (orphanedCount === 0) {
  console.log("  ✅ All children referenced in slotMetadataMap exist");
}

// Check slug consistency
console.log("\nSLUG MAPPING CONSISTENCY:");
let slugIssues = 0;
for (const [slug, slotId] of Object.entries(slugToIdMap)) {
  const slot = slotMetadataMap[slotId];
  if (!slot) {
    console.log(`  ⚠️  Slug "${slug}" maps to non-existent slot: ${slotId}`);
    slugIssues++;
  } else if (slot.slug !== slug) {
    console.log(`  ⚠️  Slug "${slug}" maps to slot with different slug "${slot.slug}": ${slotId}`);
    slugIssues++;
  }
}
if (slugIssues === 0) {
  console.log("  ✅ All slug mappings are consistent");
}

// Leaf node verification
console.log("\nLEAF NODE VERIFICATION:");
const leafNodes = auditTable.filter(e => e.isLeafNode);
const nonNavigableLeaves = leafNodes.filter(e => !e.isNavigable);
if (nonNavigableLeaves.length > 0) {
  console.log(`  ⚠️  ${nonNavigableLeaves.length} leaf nodes are not navigable:`);
  for (const leaf of nonNavigableLeaves) {
    console.log(`      - ${leaf.title} (${leaf.slotId}): slug="${leaf.slug}"`);
  }
} else {
  console.log("  ✅ All leaf nodes are navigable (have slugs and URLs)");
}

// Final summary
console.log("\n");
console.log("=".repeat(100));
console.log("FINAL SUMMARY");
console.log("=".repeat(100));
console.log(`Total Catalog Slots: ${auditTable.length}`);
console.log(`  - Header Nodes: ${auditTable.filter(e => e.type === "header").length}`);
console.log(`  - Link Nodes: ${auditTable.filter(e => e.type === "link").length}`);
console.log(`  - Leaf Nodes: ${auditTable.filter(e => e.isLeafNode).length}`);
console.log(`  - Navigable: ${auditTable.filter(e => e.isNavigable).length}`);
console.log("");
console.log("GROQ Query Pattern Used:");
console.log('  *[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(name asc)');
console.log("");
console.log("Where $keys is the unrolled descendant array for each catalog slot.");
console.log("For LEAF nodes: $keys = [leafId] - matches products with that exact catalogLocationKey");
console.log("For HEADER nodes: $keys = [headerId, child1, child2, ...] - matches products in entire subtree");
console.log("=".repeat(100));
