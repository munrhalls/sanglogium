import catalogueIndex from './data/catalogue-index.json' with { type: 'json' };

function unrollDescendantKeys(nodeId) {
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
}

// Test the headphones category
const keys = unrollDescendantKeys('ugyeto8653n495dpf89nzoar');
console.log('Unrolled keys for headphones:', keys);
console.log('Number of keys:', keys.length);

// Check if all keys exist in metadata
const allExist = keys.every(k => catalogueIndex.slotMetadataMap[k]);
console.log('All keys exist in metadata:', allExist);

// Show any missing keys
const missingKeys = keys.filter(k => !catalogueIndex.slotMetadataMap[k]);
if (missingKeys.length > 0) {
  console.log('Missing keys:', missingKeys);
}
