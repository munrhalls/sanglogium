// Re-runnable guard: exits 0 only if all 3 slices are clean.
// Usage: node --env-file=.env.local scripts/catalogue-integrity/verify.mjs
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadCatalogue, ROOTS, fetchProducts, visibleSet, assertParity } from './lib.mjs';
import { fieldVote, datasetVote, categoryVote, nameVote } from './rubric.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const catalogue = loadCatalogue();
const nodeIds = new Set();
const walk = (nodes) => {
  for (const n of nodes || []) { nodeIds.add(n._key); walk(n.children); }
};
walk(catalogue.tree);

const acceptedPath = join(repoRoot, '_project', 'catalogue-integrity', 'accepted.json');
const accepted = existsSync(acceptedPath)
  ? new Set(JSON.parse(readFileSync(acceptedPath, 'utf8')).map((a) => `${a._id}|${a.slice}`))
  : new Set();

const { products } = await fetchProducts();
const byId = new Map(products.map((p) => [p._id, p]));
const SLICES = Object.keys(ROOTS);
const sets = Object.fromEntries(SLICES.map((s) => [s, visibleSet(s, products)]));

// Parity (live predicate) per slice — throws on mismatch
const parity = {};
for (const s of SLICES) parity[s] = await assertParity(s, products);

// V1 cross-slice / V2 dangling (per-slice involvement)
const membership = new Map();
for (const s of SLICES) for (const id of sets[s]) {
  membership.set(id, [...(membership.get(id) || []), s]);
}
const V1 = [...membership.entries()].filter(([, sl]) => sl.length > 1);
const V2 = [];
for (const p of products) {
  for (const k of p.catalogueLocationKeys || []) {
    if (!nodeIds.has(k)) V2.push({ _id: p._id, badKey: k });
  }
}

const rows = [];
let fail = false;
for (const s of SLICES) {
  let belongs = 0, acc = 0, violation = 0, ambiguous = 0;
  for (const id of sets[s]) {
    const p = byId.get(id);
    const votes = [fieldVote(p), datasetVote(p), categoryVote(p), nameVote(p)];
    const tally = {};
    for (const v of votes) if (v) tally[v] = (tally[v] || 0) + 1;
    const total = Object.values(tally).reduce((a, b) => a + b, 0);
    const sVotes = tally[s] || 0;
    const maxOther = Math.max(0, ...SLICES.filter((x) => x !== s).map((x) => tally[x] || 0));
    if (accepted.has(`${id}|${s}`)) acc++;
    else if (total >= 2 && sVotes > maxOther) belongs++;
    else if (total >= 2 && maxOther > sVotes) violation++;
    else ambiguous++;
  }
  const v1 = V1.filter(([, sl]) => sl.includes(s)).length;
  const v2 = V2.filter((r) => (sets[s].has(r._id))).length;
  rows.push({ slice: s, visible: sets[s].size, belongs, accepted: acc, violation, ambiguous, v1, v2 });
  if (violation || ambiguous || v1 || v2) fail = true;
}

console.log('| slice | visible | BELONGS | accepted | VIOLATION | AMBIGUOUS | V1 | V2 |');
console.log('|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.slice} | ${r.visible} | ${r.belongs} | ${r.accepted} | ${r.violation} | ${r.ambiguous} | ${r.v1} | ${r.v2} |`);
}
console.log(fail ? 'FAIL: defects found' : 'PASS: all slices clean (parity OK)');
process.exit(fail ? 1 : 0);
