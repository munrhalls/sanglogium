import catalogueIndex from "../../../data/catalogue-index.json" with { type: "json" };

interface CatalogueIndexData {
  generatedAt: string;
  slugToIdMap: Record<string, string>;
  slotMetadataMap: Record<string, { children: string[]; title: string; type: string; slug?: string }>;
  tree: any[];
}

// Re-implement unrollDescendantKeys as pure function for testing
function unrollDescendantKeys(nodeId: string, slotMetadataMap: Record<string, { children: string[] }>): string[] {
  if (!slotMetadataMap[nodeId]) {
    return [];
  }

  const result = new Set<string>();
  const stack = [nodeId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    if (result.has(currentId)) {
      continue;
    }

    result.add(currentId);
    const children = slotMetadataMap[currentId]?.children || [];
    stack.push(...children);
  }

  return Array.from(result);
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Descendant Unrolling Test Failed: ${message}`);
  }
}

function runTests() {
  const data = catalogueIndex as unknown as CatalogueIndexData;
  const { slotMetadataMap } = data;

  console.log("🧪 Running Descendant Unrolling Tests...");

  // Test 1: Leaf node returns array with only itself
  const openBackKeys = unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh", slotMetadataMap);
  assert(openBackKeys.length === 1, `Leaf node should return 1 key, got ${openBackKeys.length}`);
  assert(openBackKeys[0] === "o7c6baiuobsr7ni2y2vf22sh", "Leaf node should return its own ID");
  console.log("✅ Test 1: Leaf node returns only itself");

  // Test 2: Header with leaves returns header + leaves
  const byDesignKeys = unrollDescendantKeys("ekv4twh175wcse4fl4jjdxfq", slotMetadataMap);
  assert(byDesignKeys.length === 3, `By Design header should return 3 keys, got ${byDesignKeys.length}`);
  assert(byDesignKeys.includes("ekv4twh175wcse4fl4jjdxfq"), "Should include header ID");
  assert(byDesignKeys.includes("o7c6baiuobsr7ni2y2vf22sh"), "Should include open-back leaf");
  assert(byDesignKeys.includes("yq3p9s798zszjkzm5btnebjh"), "Should include closed-back leaf");
  console.log("✅ Test 2: Header with leaves returns correct subtree");

  // Test 3: Root "headphones" returns 12 IDs (1 root + 3 headers + 8 leaves)
  const headphonesKeys = unrollDescendantKeys("ugyeto8653n495dpf89nzoar", slotMetadataMap);
  assert(headphonesKeys.length === 12, `Headphones root should return 12 keys, got ${headphonesKeys.length}`);
  assert(headphonesKeys.includes("ugyeto8653n495dpf89nzoar"), "Should include headphones root");
  assert(headphonesKeys.includes("ekv4twh175wcse4fl4jjdxfq"), "Should include By Design header");
  assert(headphonesKeys.includes("px3eujo0ql1hot9dkoxleao6"), "Should include By Driver header");
  assert(headphonesKeys.includes("fxvwrl18sixw5b9ro2jrlepa"), "Should include In-Ear & Wireless header");
  assert(headphonesKeys.includes("o7c6baiuobsr7ni2y2vf22sh"), "Should include open-back leaf");
  console.log("✅ Test 3: Headphones root returns 12 IDs");

  // Test 4: Verify no duplicate IDs in unrolled results
  const allKeys = headphonesKeys;
  const uniqueKeys = new Set(allKeys);
  assert(allKeys.length === uniqueKeys.size, `Found duplicate IDs in unrolled result`);
  console.log("✅ Test 4: No duplicate IDs in unrolled results");

  // Test 5: Verify all returned IDs exist in slotMetadataMap
  const invalidKeys = allKeys.filter(id => !(id in slotMetadataMap));
  assert(invalidKeys.length === 0, `Invalid keys in unrolled result: ${invalidKeys.join(', ')}`);
  console.log("✅ Test 5: All returned IDs exist in slotMetadataMap");

  // Test 6: Test audio-electronics subtree
  const audioElectronicsKeys = unrollDescendantKeys("ti2wufd15h51jxtq855ogbfa", slotMetadataMap);
  assert(audioElectronicsKeys.length === 11, `Audio Electronics should return 11 keys, got ${audioElectronicsKeys.length}`);
  assert(audioElectronicsKeys.includes("ti2wufd15h51jxtq855ogbfa"), "Should include audio-electronics root");
  assert(audioElectronicsKeys.includes("hqb22ca5czb252r0r7l1xmet"), "Should include Amplification header");
  assert(audioElectronicsKeys.includes("lkuqr2n1gpeivrvxisnfs3ot"), "Should include Digital Sources header");
  console.log("✅ Test 6: Audio Electronics subtree correct");

  // Test 7: Test accessories subtree
  const accessoriesKeys = unrollDescendantKeys("j9ozs17mc0b1nv2gqn2rvmg1", slotMetadataMap);
  assert(accessoriesKeys.length === 12, `Accessories should return 12 keys, got ${accessoriesKeys.length}`);
  assert(accessoriesKeys.includes("j9ozs17mc0b1nv2gqn2rvmg1"), "Should include accessories root");
  assert(accessoriesKeys.includes("lhpqqb5qkfvh4kid6q6455eu"), "Should include Connectivity header");
  assert(accessoriesKeys.includes("e4rct8015rxgy011710isd5e"), "Should include Maintenance header");
  assert(accessoriesKeys.includes("rw0symuvdvebq75r4og53tlf"), "Should include Storage header");
  console.log("✅ Test 7: Accessories subtree correct");

  // Test 8: Test non-existent node returns empty array
  const nonexistentKeys = unrollDescendantKeys("nonexistent-id", slotMetadataMap);
  assert(nonexistentKeys.length === 0, `Non-existent node should return empty array`);
  console.log("✅ Test 8: Non-existent node returns empty array");

  console.log("🎉 All Descendant Unrolling Tests Passed!");
}

try {
  runTests();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
