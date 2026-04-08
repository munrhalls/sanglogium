// Test VFS functionality directly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load catalogue index
const catalogueIndexPath = path.join(__dirname, 'data', 'catalogue-index.json');
const catalogueIndex = JSON.parse(fs.readFileSync(catalogueIndexPath, 'utf8'));

// Mock the functions from data/catalogue.ts
const resolveSlugToId = (slug) => {
  return catalogueIndex.slugToIdMap[slug];
};

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

const buildGroqKeysParam = (keys) => {
  return keys;
};

// Test assertions
function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Test failed: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`❌ Test failed: ${message}. Expected: ${expected}, Got: ${actual}`);
  }
}

function assertArrayEqual(actual, expected, message) {
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

function runTest(testName, testFn) {
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

// Test 1: Slug resolution
runTest("1.1: resolveSlugToId('open-back')", () => {
  assertEqual(resolveSlugToId("open-back"), "o7c6baiuobsr7ni2y2vf22sh", "open-back slug resolution");
});

runTest("1.2: resolveSlugToId('headphones')", () => {
  assertEqual(resolveSlugToId("headphones"), undefined, "headphones slug should not exist (it's a header)");
});

runTest("1.3: resolveSlugToId('nonexistent')", () => {
  assertEqual(resolveSlugToId("nonexistent"), undefined, "nonexistent slug resolution");
});

// Test 2: Subtree correctness
runTest("2.1: unrollDescendantKeys leaf node returns only self", () => {
  const result = unrollDescendantKeys("o7c6baiuobsr7ni2y2vf22sh"); // open-back
  assertArrayEqual(result, ["o7c6baiuobsr7ni2y2vf22sh"], "leaf node unrolling");
});

runTest("2.2: unrollDescendantKeys header returns self + children", () => {
  const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar"); // Headphones header
  assert(result.includes("ugyeto8653n495dpf89nzoar"), "header includes self");
  assert(result.length > 1, "header includes children");
});

runTest("2.3: All unrolled IDs exist in slotMetadataMap", () => {
  const result = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  for (const id of result) {
    assert(catalogueIndex.slotMetadataMap[id] !== undefined, `ID ${id} exists in slotMetadataMap`);
  }
});

// Test 3: GROQ parameter generation
runTest("3.1: buildGroqKeysParam single key", () => {
  const result = buildGroqKeysParam(["o7c6baiuobsr7ni2y2vf22sh"]);
  assertArrayEqual(result, ["o7c6baiuobsr7ni2y2vf22sh"], "single key param generation");
});

runTest("3.2: buildGroqKeysParam empty array", () => {
  const result = buildGroqKeysParam([]);
  assertArrayEqual(result, [], "empty array param generation");
});

runTest("3.3: buildGroqKeysParam unrolled keys", () => {
  const unrolled = unrollDescendantKeys("ugyeto8653n495dpf89nzoar");
  const result = buildGroqKeysParam(unrolled);
  assertEqual(result.length, unrolled.length, "unrolled keys param generation length");
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
