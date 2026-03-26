import { resolveSlugToId, unrollDescendantKeys, buildGroqKeysParam } from "@/data/catalogue";
import catalogueIndex from "@/data/catalogue-index.json";

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
  assertEqual(resolveSlugToId("headphones"), "zemHaTBY7QMZEyx6WgMYi", "headphones slug resolution");
});

runTest("1.2: resolveSlugToId('accessories')", () => {
  assertEqual(resolveSlugToId("accessories"), "_EDhByj4HR6NH7X1DHHfr", "accessories slug resolution");
});

runTest("1.3: resolveSlugToId('nonexistent')", () => {
  assertEqual(resolveSlugToId("nonexistent"), undefined, "nonexistent slug resolution");
});

runTest("1.4: resolveSlugToId('')", () => {
  assertEqual(resolveSlugToId(""), undefined, "empty slug resolution");
});

runTest("2.1: Manifest slotMetadataMap title lookup", () => {
  assertEqual(manifest.slotMetadataMap["zemHaTBY7QMZEyx6WgMYi"].title, "Headphones & Personal Audio ", "title lookup");
});

runTest("2.2: Manifest slotMetadataMap children length", () => {
  assertEqual(manifest.slotMetadataMap["zemHaTBY7QMZEyx6WgMYi"].children.length, 3, "children length lookup");
});

runTest("2.3: Manifest slotMetadataMap breadcrumb label", () => {
  assertEqual(manifest.slotMetadataMap["zemHaTBY7QMZEyx6WgMYi"].breadcrumbs[0].label, "Headphones & Personal Audio ", "breadcrumb label lookup");
});

runTest("2.4: Manifest slotMetadataMap leaf node children length", () => {
  assertEqual(manifest.slotMetadataMap["sXIqLWIxMpCT5E2VxPkad"].children.length, 0, "leaf node children length");
});

runTest("2.5: Manifest slotMetadataMap fake ID lookup", () => {
  assertEqual(manifest.slotMetadataMap["fake_id"], undefined, "fake ID lookup");
});

runTest("3.1: unrollDescendantKeys leaf node", () => {
  const result = unrollDescendantKeys("sXIqLWIxMpCT5E2VxPkad");
  assertArrayEqual(result, ["sXIqLWIxMpCT5E2VxPkad"], "leaf node unrolling");
});

runTest("3.2: unrollDescendantKeys root node", () => {
  const result = unrollDescendantKeys("zemHaTBY7QMZEyx6WgMYi");
  assertEqual(result.length, 4, "root node unrolling length");
  assert(result.includes("zemHaTBY7QMZEyx6WgMYi"), "root node includes self");
});

runTest("3.3: unrollDescendantKeys headphones category", () => {
  const result = unrollDescendantKeys("zemHaTBY7QMZEyx6WgMYi");
  assertEqual(result.length, 4, "headphones category unrolling length");
  assert(result.includes("zemHaTBY7QMZEyx6WgMYi"), "headphones category includes self");
});

runTest("3.4: unrollDescendantKeys on-sale node", () => {
  const result = unrollDescendantKeys("sXIqLWIxMpCT5E2VxPkad");
  assertArrayEqual(result, ["sXIqLWIxMpCT5E2VxPkad"], "on-sale node unrolling");
});

runTest("3.5: unrollDescendantKeys validity check", () => {
  const result = unrollDescendantKeys("zemHaTBY7QMZEyx6WgMYi");
  const headphonesData = manifest.slotMetadataMap["zemHaTBY7QMZEyx6WgMYi"];
  const validIds = new Set(["zemHaTBY7QMZEyx6WgMYi", ...headphonesData.children]);

  for (const id of result) {
    assert(validIds.has(id), `ID ${id} is either the root node or a valid child`);
  }
});

runTest("4.1: buildGroqKeysParam single key", () => {
  const result = buildGroqKeysParam(["sXIqLWIxMpCT5E2VxPkad"]);
  assertArrayEqual(result, ["sXIqLWIxMpCT5E2VxPkad"], "single key param generation");
});

runTest("4.2: buildGroqKeysParam empty array", () => {
  const result = buildGroqKeysParam([]);
  assertArrayEqual(result, [], "empty array param generation");
});

runTest("4.3: buildGroqKeysParam unrolled keys", () => {
  const unrolled = unrollDescendantKeys("zemHaTBY7QMZEyx6WgMYi");
  const result = buildGroqKeysParam(unrolled);
  assertEqual(result.length, 4, "unrolled keys param generation");
});

runTest("5.1: Full path integration - headphones", () => {
  const resolved = resolveSlugToId("headphones");
  assert(resolved !== undefined, "headphones resolved");
  const unrolled = unrollDescendantKeys(resolved);
  assertEqual(unrolled.length, 4, "full path integration length");
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
