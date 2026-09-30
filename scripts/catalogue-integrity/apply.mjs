// Applies human-approved decisions from _project/catalogue-integrity/review-sheet.json.
// Default = dry-run (no Sanity writes). Pass --write to apply.
// Usage: node --env-file=.env.local scripts/catalogue-integrity/apply.mjs --slice=<slice> [--write]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadCatalogue, ROOTS, unroll } from './lib.mjs';
import { sanityQuery } from '../../features/product-filtering/__tests__/proofs/sanityRaw.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')),
);
const slice = args.slice;
const WRITE = 'write' in args;

if (!Object.keys(ROOTS).includes(slice)) {
  console.error(`--slice must be one of: ${Object.keys(ROOTS).join(', ')}`);
  process.exit(1);
}

const catalogue = loadCatalogue();
const nodeTitles = {};
const nodeIds = new Set();
const walk = (nodes) => {
  for (const n of nodes || []) {
    nodeIds.add(n._key);
    nodeTitles[n._key] = n.title;
    walk(n.children);
  }
};
walk(catalogue.tree);
for (const id of Object.keys(catalogue.slotMetadataMap)) nodeIds.add(id);
for (const id of Object.values(catalogue.slugToIdMap)) nodeIds.add(id);

const sliceSubtree = new Set(unroll(ROOTS[slice]));
const title = (k) => `${k} (${nodeTitles[k] ?? 'NOT-IN-INDEX'})`;

const sheetPath = join(repoRoot, '_project', 'catalogue-integrity', 'review-sheet.json');
if (!existsSync(sheetPath)) { console.error('review-sheet.json not found'); process.exit(1); }
const sheet = JSON.parse(readFileSync(sheetPath, 'utf8'));
const rows = sheet[slice] || [];

if (rows.length === 0) { console.log(`No rows for slice "${slice}" — nothing to do.`); process.exit(0); }

const undecided = rows.filter((r) => r.decision === null || r.decision === undefined);
if (undecided.length) {
  console.error(`ABORT: ${undecided.length} undecided row(s) in slice "${slice}":`);
  for (const r of undecided) console.error(`  - ${r._id} ${r.name}`);
  process.exit(1);
}

// Validate every row up-front; abort on any invalid row (nothing half-applied).
const plans = [];
for (const r of rows) {
  if (r.decision === 'keep') {
    if (!r.note || !r.note.trim()) {
      console.error(`ABORT: "keep" row ${r._id} ${r.name} has empty note (reason mandatory).`);
      process.exit(1);
    }
    plans.push({ row: r, action: 'keep' });
  } else if (r.decision === 'move') {
    const nk = r.newKeys || [];
    if (!nk.length) {
      console.error(`ABORT: "move" row ${r._id} ${r.name} has empty newKeys.`);
      process.exit(1);
    }
    const bad = nk.filter((k) => !nodeIds.has(k));
    if (bad.length) {
      console.error(`ABORT: "move" row ${r._id} ${r.name} has unknown key(s): ${bad.join(', ')}`);
      process.exit(1);
    }
    const outside = nk.filter((k) => !sliceSubtree.has(k));
    if (outside.length) {
      console.error(`ABORT: "move" row ${r._id} ${r.name} key(s) outside "${slice}" subtree: ${outside.map(title).join(', ')}`);
      process.exit(1);
    }
    plans.push({ row: r, action: 'patch', newKeys: nk });
  } else if (r.decision === 'remove') {
    const current = (r.currentKeys || []).map((k) => k.id);
    const newKeys = current.filter((k) => !sliceSubtree.has(k));
    if (!newKeys.length) {
      console.error(`ABORT: "remove" on ${r._id} ${r.name} would leave zero keys — needs an explicit "move".`);
      process.exit(1);
    }
    plans.push({ row: r, action: 'patch', newKeys });
  } else {
    console.error(`ABORT: row ${r._id} ${r.name} has unknown decision "${r.decision}".`);
    process.exit(1);
  }
}

// Skip rows whose draft exists
const patchPlans = plans.filter((p) => p.action === 'patch');
const ids = patchPlans.map((p) => p.row._id);
const drafts = ids.length
  ? await sanityQuery('*[(_id in $draftIds)]._id', { draftIds: ids.map((i) => `drafts.${i}`) })
  : [];
const draftSet = new Set((drafts || []).map((d) => d.replace(/^drafts\./, '')));

const applied = [];
for (const p of plans) {
  const r = p.row;
  if (p.action === 'keep') {
    console.log(`KEEP   ${r.name} — note: ${r.note}`);
    continue;
  }
  if (draftSet.has(r._id)) {
    console.log(`SKIP   ${r.name} — drafts.${r._id} exists`);
    continue;
  }
  const before = (r.currentKeys || []).map((k) => title(k.id));
  const after = p.newKeys.map(title);
  console.log(`${r.decision.toUpperCase()}  ${r.name}\n  before: ${before.join(', ') || '(none)'}\n  after:  ${after.join(', ')}`);
  applied.push(p);
}

if (!WRITE) {
  console.log(`\nDRY-RUN: ${applied.length} patch(es) planned, 0 written. Re-run with --write to apply.`);
  process.exit(0);
}

// Record keeps into accepted.json
const keepRows = plans.filter((p) => p.action === 'keep').map((p) => p.row);
if (keepRows.length) {
  const accPath = join(repoRoot, '_project', 'catalogue-integrity', 'accepted.json');
  const acc = existsSync(accPath) ? JSON.parse(readFileSync(accPath, 'utf8')) : [];
  const seen = new Set(acc.map((a) => `${a._id}|${a.slice}`));
  for (const r of keepRows) {
    if (!seen.has(`${r._id}|${slice}`)) acc.push({ _id: r._id, slice, reason: r.note });
  }
  writeFileSync(accPath, JSON.stringify(acc, null, 2));
  console.log(`accepted.json: ${keepRows.length} keep(s) recorded`);
}

if (!applied.length) { console.log('Nothing to patch.'); process.exit(0); }

// Backup BEFORE any patch
const backupsDir = join(repoRoot, 'sanity-cms', 'backups');
mkdirSync(backupsDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = join(backupsDir, `integrity_${slice}_${ts}.json`);
writeFileSync(backupPath, JSON.stringify(
  applied.map((p) => ({ _id: p.row._id, catalogueLocationKeys: (p.row.currentKeys || []).map((k) => k.id) })),
  null, 2,
));
console.log(`backup written: ${backupPath}`);

const { default: client } = await import('../../sanity-cms/utils/getClient.mjs');
let n = 0;
for (let i = 0; i < applied.length; i += 100) {
  const tx = client.transaction();
  for (const p of applied.slice(i, i + 100)) {
    tx.patch(p.row._id, (pt) => pt.set({ catalogueLocationKeys: p.newKeys }));
  }
  await tx.commit();
  n += Math.min(100, applied.length - i);
  console.log(`committed ${n}/${applied.length}`);
}
console.log('DONE');
