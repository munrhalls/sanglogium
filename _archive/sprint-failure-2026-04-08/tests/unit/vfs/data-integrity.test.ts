import catalogueIndex from "../../../data/catalogue-index.json" with { type: "json" };

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[]; title: string; type: string; slug?: string }>;
  tree: any[];
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Data Integrity Test Failed: ${message}`);
  }
}

function runTests() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slugToIdMap, slotMetadataMap } = data;

  console.log("🧪 Running Data Integrity Tests...");

  // Test 1: Verify expected node count (31 total: 11 headers + 20 leaf links)
  const totalNodes = Object.keys(slotMetadataMap).length;
  assert(totalNodes === 31, `Expected 31 nodes, got ${totalNodes}`);
  console.log("✅ Test 1: Node count correct (31)");

  // Test 2: Verify all children IDs referenced exist in slotMetadataMap
  const allChildrenIds: string[] = [];
  Object.values(slotMetadataMap).forEach(node => {
    allChildrenIds.push(...node.children);
  });

  const missingChildren = allChildrenIds.filter(id => !(id in slotMetadataMap));
  assert(missingChildren.length === 0, `Missing children in slotMetadataMap: ${missingChildren.join(', ')}`);
  console.log("✅ Test 2: All children IDs exist in slotMetadataMap");

  // Test 3: Verify all slugs in slugToIdMap resolve to valid slotMetadataMap entries
  const invalidSlugMappings = Object.values(slugToIdMap).filter(id => !(id in slotMetadataMap));
  assert(invalidSlugMappings.length === 0, `Invalid slug mappings: ${invalidSlugMappings.join(', ')}`);
  console.log("✅ Test 3: All slug mappings resolve to valid metadata");

  // Test 4: Verify no orphaned nodes (nodes not referenced by any parent)
  const allReferencedIds = new Set<string>(allChildrenIds);
  const rootIds = ["ugyeto8653n495dpf89nzoar", "ti2wufd15h51jxtq855ogbfa", "j9ozs17mc0b1nv2gqn2rvmg1"];
  rootIds.forEach(id => allReferencedIds.add(id));

  const orphanedNodes = Object.keys(slotMetadataMap).filter(id => !allReferencedIds.has(id));
  assert(orphanedNodes.length === 0, `Orphaned nodes found: ${orphanedNodes.join(', ')}`);
  console.log("✅ Test 4: No orphaned nodes found");

  console.log("🎉 All Data Integrity Tests Passed!");
}

try {
  runTests();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
