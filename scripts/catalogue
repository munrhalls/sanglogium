// Debug VFS subtree issue
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load catalogue index
const catalogueIndexPath = path.join(__dirname, 'data', 'catalogue-index.json');
const catalogueIndex = JSON.parse(fs.readFileSync(catalogueIndexPath, 'utf8'));

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

console.log("🔍 Debugging VFS subtree for headphones header...\n");

const headerId = "ugyeto8653n495dpf89nzoar"; // Headphones header
const unrolled = unrollDescendantKeys(headerId);

console.log("Unrolled IDs:");
unrolled.forEach(id => {
  const exists = catalogueIndex.slotMetadataMap[id] !== undefined;
  console.log(`  ${id}: ${exists ? '✅ exists' : '❌ missing'}`);
  if (!exists) {
    console.log(`    This ID was in children array but not in slotMetadataMap`);
  }
});

console.log(`\nHeader metadata:`);
console.log(JSON.stringify(catalogueIndex.slotMetadataMap[headerId], null, 2));

console.log(`\nChildren of header:`);
catalogueIndex.slotMetadataMap[headerId].children.forEach(childId => {
  console.log(`  ${childId}: ${catalogueIndex.slotMetadataMap[childId] ? '✅' : '❌'}`);
  if (catalogueIndex.slotMetadataMap[childId]) {
    console.log(`    title: ${catalogueIndex.slotMetadataMap[childId].title}`);
    console.log(`    children: ${catalogueIndex.slotMetadataMap[childId].children?.length || 0}`);
  }
});
