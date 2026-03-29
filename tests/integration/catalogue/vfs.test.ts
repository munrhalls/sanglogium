import { resolveSlugToId, unrollDescendantKeys, buildGroqKeysParam } from "../data/catalogue";
import catalogueIndex from "../data/catalogue-index.json";

const manifest = catalogueIndex as any;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Test failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`❌ Test failed: ${message}. Expected: ${expected}, Got: ${actual}`);
  }
}

function assertArrayEqual<T>(actual: T[], expected: T[], message: string) {
  if (actual.length !== expected.length) {
    throw new Error(`❌ Test failed: ${message}. Expected length: ${expected.length}, Got length: ${actual.length}`);
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`❌ Test failed: ${message}. Expected at index ${i}: ${expected[i]}, Got: ${actual[i]}`);
    }
  }
}

console.log("🧪 Starting VFS Test Suite...\n");

let passedTests = 0;
let totalTests = 0;

function runTest(testName: string, testFn: () => void) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ ${testName}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    throw error;
  }
}

runTest("1.1: resolveSlugToId('headphones')", () => {
  assertEqual(resolveSlugToId("headphones"), undefined, "headphones slug should return undefined (header)");
});

runTest("1.2: resolveSlugToId('accessories')", () => {
  assertEqual(resolveSlugToId("accessories"), undefined, "accessories slug should return undefined (header)");
});

runTest("1.3: resolveSlugToId('open-back')", () => {
  assertEqual(resolveSlugToId("open-back"), "o7c6baiuobsr7ni2y2vf22sh", "open-back slug resolution");
});

runTest("1.4: resolveSlugToId('nonexistent')", () => {
  assertEqual(resolveSlugToId("nonexistent"), undefined, "nonexistent slug resolution");
});

runTest("2.1: Manifest slotMetadataMap title lookup", () => {
  assertEqual(manifest.slotMetadataMap["ugyeto8653n495dpf89nzoar"].title, "Headphones", "title lookup");
});

runTest("2.2: Manifest slotMetadataMap children length", () => {
  assertEqual(manifest.slotMetadataMap["ugyeto8653n495dpf89nzoar"].children.length, 3, "children length lookup");
});

runTest("2.3: Manifest slotMetadataMap breadcrumb label", () => {
  assertEqual(manifest.slotMetadataMap["ugyeto8653n495dpf89nzoar"].breadcrumbs.length, 0, "breadcrumb array length");
});

runTest("2.4: Manifest slotMetadataMap leaf node children length", () => {
  assertEqual(manifest.slotMetadataMap["o7c6baiuobsr7ni2y2vf22sh"].children.length, 0, "leaf node children length");
});

runTest("2.5: Manifest slotMetadataMap fake ID lookup", () => {
  assertEqual(manifest.slotMetadataMap["fake_id"], undefined, "fake ID lookup");
});

runTest("3.1: unrollDescendantKeys leaf node", () => {
  const result = unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh");
  assertArrayEqual(result, ["o7c6baiuobsr7ni2y2vf22sh"], "leaf node unrolling");
});

runTest("3.2: unrollDescendantKeys root node", () => {
  const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  assertEqual(result.length, 11, "root node unrolling length");
  assert(result.includes("ugyeto8653n495dpf89nzoar"), "root node includes self");
});

runTest("3.3: unrollDescendantKeys headphones category", () => {
  const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  assertEqual(result.length, 11, "headphones category unrolling length");
  assert(result.includes("ugyeto8653n495dpf89nzoar"), "headphones category includes self");
});

runTest("3.4: unrollDescendantKeys open-back node", () => {
  const result = unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh");
  assertArrayEqual(result, ["o7c6baiuobsr7ni2y2vf22sh"], "open-back node unrolling");
});

runTest("3.5: unrollDescendantKeys validity check", () => {
  const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  const headphonesData = manifest.slotMetadataMap["ugyeto8653n495dpf89nzoar"];
  const validIds = new Set(["ugyeto8653n495dpf89nzoar", ...headphonesData.children]);

  // Also check descendants (should include all 11 nodes in subtree)
  assertEqual(result.length, 11, "should include all subtree nodes");

  for (const id of result) {
    assert(manifest.slotMetadataMap[id] !== undefined, `ID ${id} exists in slotMetadataMap`);
  }
});

runTest("4.1: buildGroqKeysParam single key", () => {
  const result = buildGroqKeysParam(["o7c6baiuobsr7ni2y2vf22sh"]);
  assertArrayEqual(result, ["o7c6baiuobsr7ni2y2vf22sh"], "single key param generation");
});

runTest("4.2: buildGroqKeysParam empty array", () => {
  const result = buildGroqKeysParam([]);
  assertArrayEqual(result, [], "empty array param generation");
});

runTest("4.3: buildGroqKeysParam unrolled keys", () => {
  const unrolled = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  const result = buildGroqKeysParam(unrolled);
  assertEqual(result.length, 11, "unrolled keys param generation");
});

runTest("5.1: Full path integration - open-back", () => {
  const resolved = resolveSlugToId("open-back");
  assert(resolved !== undefined, "open-back resolved");
  const unrolled = unrollDescendantKeys(resolved);
  assertEqual(unrolled.length, 1, "full path integration length");
});

runTest("5.2: Full path integration - fake category", () => {
  const resolved = resolveSlugToId("fake-category");
  assertEqual(resolved, undefined, "fake category resolution");
});

console.log(`\n🎉 Test Suite Complete!`);
console.log(`📊 Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("✅ All VFS tests passed successfully!");
  process.exit(0);
} else {
  console.log("❌ Some tests failed!");
  process.exit(1);
}
