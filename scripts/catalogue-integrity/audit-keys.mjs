import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadCatalogue, ROOTS, unroll, fetchProducts, visibleSet, assertParity } from './lib.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const catalogue = loadCatalogue();

// All node ids + titles from the tree (leaves aren't in slotMetadataMap)
const nodeIds = new Set();
const nodeTitles = {};
const walk = (nodes) => {
  for (const n of nodes || []) {
    nodeIds.add(n._key);
    nodeTitles[n._key] = n.title;
    walk(n.children);
  }
};
walk(catalogue.tree);

const SLICES = Object.keys(ROOTS);
const { products, draftCount } = await fetchProducts();
console.log(`published products: ${products.length}, drafts: ${draftCount}`);

const sliceSets = {};
for (const s of SLICES) {
  const parity = await assertParity(s, products);
  sliceSets[s] = visibleSet(s, products);
  console.log(`${s}: visible=${parity.mine} parity=OK (live=${parity.live})`);
}

// V1: visible in >1 slice
const membership = new Map();
for (const s of SLICES) {
  for (const id of sliceSets[s]) {
    if (!membership.has(id)) membership.set(id, []);
    membership.get(id).push(s);
  }
}
const V1 = [...membership.entries()]
  .filter(([, sl]) => sl.length > 1)
  .map(([id, slices]) => {
    const p = products.find((x) => x._id === id);
    return { _id: id, name: p?.name, slices };
  });

// V2: dangling keys
const V2 = [];
for (const p of products) {
  for (const k of p.catalogueLocationKeys || []) {
    if (!nodeIds.has(k)) V2.push({ _id: p._id, name: p.name, badKey: k });
  }
}

// V3: orphans (visible nowhere)
const visibleAnywhere = new Set([...Object.values(sliceSets)].flatMap((s) => [...s]));
const V3 = products
  .filter((p) => !visibleAnywhere.has(p._id))
  .map((p) => ({ _id: p._id, name: p.name, keys: p.catalogueLocationKeys ?? null }));

// APERIO
const aperio = products.filter((p) => (p.name || '').toLowerCase().includes('aperio'));
const APERIO = aperio.map((p) => ({
  _id: p._id,
  name: p.name,
  keys: (p.catalogueLocationKeys || []).map((k) => ({ key: k, title: nodeTitles[k] ?? 'NOT-IN-INDEX' })),
  slices: SLICES.filter((s) => sliceSets[s].has(p._id)),
}));
for (const a of APERIO) {
  console.log(`APERIO ${a._id} "${a.name}" keys=${JSON.stringify(a.keys)} slices=${a.slices.join(',') || 'NONE'}`);
}
console.log(`V1 cross-slice: ${V1.length}  V2 dangling: ${V2.length}  V3 orphans: ${V3.length}`);

const outDir = join(repoRoot, '_project', 'catalogue-integrity');
mkdirSync(outDir, { recursive: true });
writeFileSync(
  join(outDir, 'keys-report.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), draftCount, publishedCount: products.length, sliceCounts: Object.fromEntries(SLICES.map((s) => [s, sliceSets[s].size])), V1, V2, V3, APERIO }, null, 2),
);
console.log('wrote _project/catalogue-integrity/keys-report.json');
