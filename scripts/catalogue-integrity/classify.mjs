import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadCatalogue, ROOTS, fetchProducts, visibleSet } from './lib.mjs';
import { fieldVote, datasetVote, categoryVote, nameVote } from './rubric.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(repoRoot, '_project', 'catalogue-integrity');
const catalogue = loadCatalogue();

const nodeTitles = {};
const walk = (nodes) => {
  for (const n of nodes || []) {
    nodeTitles[n._key] = n.title;
    walk(n.children);
  }
};
walk(catalogue.tree);

// Slice -> its node ids (for the md node appendix) and leaf/root list
const sliceNodes = {};
for (const s of Object.keys(ROOTS)) {
  const ids = new Set();
  const stack = [ROOTS[s]];
  const rows = [];
  while (stack.length) {
    const id = stack.pop();
    if (ids.has(id)) continue;
    ids.add(id);
    rows.push({ id, title: nodeTitles[id] ?? '?' });
    stack.push(...(catalogue.slotMetadataMap[id]?.children || []));
  }
  sliceNodes[s] = rows;
}

const acceptedPath = join(outDir, 'accepted.json');
const accepted = existsSync(acceptedPath)
  ? new Set(JSON.parse(readFileSync(acceptedPath, 'utf8')).map((a) => `${a._id}|${a.slice}`))
  : new Set();

const { products } = await fetchProducts();
const byId = new Map(products.map((p) => [p._id, p]));
const SLICES = Object.keys(ROOTS);
const sets = Object.fromEntries(SLICES.map((s) => [s, visibleSet(s, products)]));

const reviewRows = { headphones: [], 'audio-electronics': [], accessories: [] };
const counts = {};
const aperioRows = [];

for (const s of SLICES) {
  const c = { visible: sets[s].size, BELONGS: 0, 'BELONGS(accepted)': 0, VIOLATION: 0, AMBIGUOUS: 0 };
  for (const id of sets[s]) {
    const p = byId.get(id);
    const votes = {
      fieldVote: fieldVote(p),
      datasetVote: datasetVote(p),
      categoryVote: categoryVote(p),
      nameVote: nameVote(p),
    };
    const tally = {};
    for (const v of Object.values(votes)) if (v) tally[v] = (tally[v] || 0) + 1;
    const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
    const sVotes = tally[s] || 0;
    const maxOther = Math.max(0, ...SLICES.filter((x) => x !== s).map((x) => tally[x] || 0));

    let verdict;
    if (accepted.has(`${id}|${s}`)) verdict = 'BELONGS(accepted)';
    else if (totalVotes >= 2 && sVotes > maxOther) verdict = 'BELONGS';
    else if (totalVotes >= 2 && maxOther > sVotes) verdict = 'VIOLATION';
    else verdict = 'AMBIGUOUS';
    c[verdict]++;

    const row = {
      _id: id, name: p.name, brand: p.brand ?? null, slice: s, verdict, votes,
      currentKeys: (p.catalogueLocationKeys || []).map((k) => ({ id: k, title: nodeTitles[k] ?? 'NOT-IN-INDEX' })),
      decision: null, newKeys: [], note: '',
    };
    if (verdict === 'VIOLATION' || verdict === 'AMBIGUOUS') reviewRows[s].push(row);
    if ((p.name || '').toLowerCase().includes('aperio')) aperioRows.push(row);
  }
  counts[s] = c;
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'review-sheet.json'), JSON.stringify(reviewRows, null, 2));

const md = ['# Catalogue integrity review sheet', ''];
for (const s of SLICES) {
  md.push(`## ${s} — ${counts[s].visible} visible | BELONGS ${counts[s].BELONGS} (+${counts[s]['BELONGS(accepted)']} accepted) | VIOLATION ${counts[s].VIOLATION} | AMBIGUOUS ${counts[s].AMBIGUOUS}`, '');
  md.push('| name | brand | field | dataset | category | name | verdict |');
  md.push('|---|---|---|---|---|---|---|');
  for (const r of reviewRows[s]) {
    md.push(`| ${r.name} | ${r.brand ?? ''} | ${r.votes.fieldVote ?? '-'} | ${r.votes.datasetVote ?? '-'} | ${r.votes.categoryVote ?? '-'} | ${r.votes.nameVote ?? '-'} | ${r.verdict} |`);
  }
  md.push('');
}
md.push('## Slice nodes (for filling newKeys)', '');
for (const s of SLICES) {
  md.push(`### ${s}`, '');
  for (const n of sliceNodes[s]) md.push(`- \`${n.id}\` — ${n.title}`);
  md.push('');
}
writeFileSync(join(outDir, 'review-sheet.md'), md.join('\n'));

for (const s of SLICES) {
  const c = counts[s];
  console.log(`${s}: visible=${c.visible} BELONGS=${c.BELONGS} accepted=${c['BELONGS(accepted)']} VIOLATION=${c.VIOLATION} AMBIGUOUS=${c.AMBIGUOUS}`);
}
for (const r of aperioRows) {
  console.log(`APERIO ${r._id} slice=${r.slice} verdict=${r.verdict} votes=${JSON.stringify(r.votes)}`);
}
console.log('wrote review-sheet.json + review-sheet.md');
