// ══════════════════════════════════════════════════════════════════
// DELETE every product that belongs to NO slice.
// Run: node tests/catalogue/delete-no-slice-products.mjs
//
// Companion to list-no-slice-products.mjs — same selection, then:
// remove every incoming reference, then delete each document.
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from './sanity-client.mjs';

// ── STEP 1: Collect every location key that belongs to a slice ─────
// IN:  data/catalogue-index.json + the three slice slugs.
// OUT: `keys` — every location id inside headphones, audio-electronics,
//      accessories (all descendants).
// TRUST: identical to step 1 of list-no-slice-products.mjs — same
//      recursive walk the app uses, so "in a slice" means the same
//      thing here as on the list you reviewed.
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const keysFor = (slug) => {
  const root = index.slugToIdMap[slug];
  const out = new Set();
  const stack = [root];
  while (stack.length) {
    const id = stack.pop();
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(index.slotMetadataMap[id]?.children ?? []));
  }
  return [...out];
};

const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const keys = [...new Set(SLICES.flatMap(keysFor))];

// ── STEP 2: Fetch the delete-candidate ids ─────────────────────────
// IN:  `keys` from step 1.
// OUT: `candidates` — `{ _id, name, brand }` for every product with no
//      keys, or keys that hit no slice.
// TRUST: same two complementary filters as the list script — empty
//      array (unkeyed) or no member in `keys` (unplaced); together
//      they cover every way to sit outside all slices.
const NO_KEYS = `count(coalesce(catalogueLocationKeys, [])) == 0`;
const UNPLACED = `*[_type == "product" && !(${NO_KEYS}) && count(catalogueLocationKeys[@ in $keys]) == 0] { _id, name, "brand": brand->name }`;
const UNKEYED = `*[_type == "product" && ${NO_KEYS}] { _id, name, "brand": brand->name }`;

const candidates = [
  ...(await client.fetch(UNPLACED, { keys })),
  ...(await client.fetch(UNKEYED)),
];

// ── STEP 3: Remove every incoming reference to a candidate ─────────
// IN:  one candidate `_id`.
// OUT: every document that pointed at it no longer does.
// TRUST: `references($id)` finds ALL referrers regardless of type or
//      field (homepage rows, "On Sale", anything). It runs with the
//      `previewDrafts` perspective so draft documents (e.g.
//      drafts.homepageData) are found and unreferenced too — a draft
//      ref blocks deletion exactly like a published one. Every referrer
//      is cleaned under BOTH ids — `x` and `drafts.x` — because a draft
//      twin can hold the ref while the overlay reports the base _id, so
//      patching the base alone leaves the draft blocking the delete.
//      The walker collects
//      every path whose value is `{_ref: <id>}` — object or array item —
//      and unsets exactly those paths, so nothing else in the referrer
//      is touched. Sanity refuses to delete a referenced doc, so any
//      missed ref shows up as a failed delete in step 4 — never silent.
const refPaths = (node, targetId, base = '') => {
  const paths = [];
  if (Array.isArray(node)) {
    node.forEach((item, i) => {
      if (item && typeof item === 'object') {
        if (item._ref === targetId) paths.push(`${base}[${i}]`);
        else paths.push(...refPaths(item, targetId, `${base}[${i}]`));
      }
    });
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (v && typeof v === 'object') {
        if (v._ref === targetId) paths.push(base ? `${base}.${k}` : k);
        else paths.push(...refPaths(v, targetId, base ? `${base}.${k}` : k));
      }
    }
  }
  return paths;
};

// ── STEP 4: Unreference, then delete, one product at a time ────────
// IN:  `candidates` from step 2 + `refPaths` from step 3.
// OUT: each candidate deleted; per-product line says what happened.
// TRUST: deletion is attempted only after its own unreference pass; a
//      failure prints FAILED with the error, so the count at the end
//      is the real result, not an assumption.
const draftAware = client.withConfig({ perspective: 'previewDrafts' });
let deleted = 0;
for (const p of candidates) {
  try {
    const referrers = await draftAware.fetch(`*[references($id)]{_id}`, { id: p._id });
    const docIds = [...new Set(referrers.flatMap((r) => {
      const base = r._id.replace(/^drafts\./, '');
      return [base, `drafts.${base}`];
    }))];
    // Ref paths are collected from every fetchable variant, then unset on
    // BOTH ids — a draft twin may not be fetchable yet still block deletion.
    const paths = new Set();
    for (const docId of docIds) {
      const doc = await draftAware.fetch(`*[_id == $docId][0]`, { docId });
      if (!doc) continue;
      refPaths(doc, p._id)
        .filter((path) => path !== '_id' && !path.startsWith('_id.'))
        .forEach((path) => paths.add(path));
    }
    for (const docId of docIds) {
      if (paths.size) await client.patch(docId).unset([...paths]).commit().catch(() => {});
    }
    await client.delete(p._id);
    deleted++;
    console.log(`deleted  ${p._id}  ${p.brand ?? '(no brand)'} — ${p.name}${referrers.length ? `  (unreferenced ${referrers.length} doc${referrers.length === 1 ? '' : 's'})` : ''}`);
  } catch (err) {
    console.log(`FAILED   ${p._id}  ${p.brand ?? '(no brand)'} — ${p.name}  :: ${err.message}`);
  }
}

// ── STEP 5: Report ─────────────────────────────────────────────────
// OUT: deleted count vs candidate count — they must be equal.
console.log(`\n=== deleted ${deleted} of ${candidates.length} delete candidates ===`);
