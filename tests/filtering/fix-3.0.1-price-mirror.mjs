// ══════════════════════════════════════════════════════════════════
// FIX 3.0.1 — set filterAttributes.price to price_data.unit_amount for the
// products check 3.0.1 marks ✗ (the schema's contract: "Product price in
// cents; mirrors price_data.unit_amount for filter predicates").
// Run: node tests/filtering/fix-3.0.1-price-mirror.mjs           (dry run: prints every change, writes nothing)
//      node tests/filtering/fix-3.0.1-price-mirror.mjs --apply   (one atomic Sanity transaction)
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';

// ── STEP 1: The products of every slice, with both prices ───────────
// IN:  data/catalogue-index.json + the three slice slugs.
// OUT: `products` — _id, _rev, name, price_data.unit_amount, current mirror.
// TRUST: same slice unroll as check 3.0.1, so "drifting" here is exactly
//      what that check lists.
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const keysFor = (slug) => {
  const out = new Set(); const s = [index.slugToIdMap[slug]];
  while (s.length) { const id = s.pop(); if (out.has(id)) continue; out.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); }
  return [...out];
};
const keys = [...new Set(['headphones', 'audio-electronics', 'accessories'].flatMap(keysFor))];
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]{ _id, _rev, name, "unit": price_data.unit_amount, "mirror": filterAttributes.price }`,
  { keys }
);

// ── STEP 2: Pick the drifting ones — never guess a price ────────────
// IN:  products. OUT: `todo` — products whose mirror is present and not
//      the same cents as price_data.
// TRUST: a product with no numeric price_data aborts the run: there is
//      no real price to copy, and this script will not invent one.
const noPrice = products.filter((p) => typeof p.unit !== 'number');
if (noPrice.length) { console.log('ABORT — no numeric price_data.unit_amount:\n' + noPrice.map((p) => p.name).join('\n')); process.exit(1); }
const todo = products.filter((p) => p.mirror != null && p.mirror !== p.unit);

// ── STEP 3: Show every change ───────────────────────────────────────
// IN:  `todo`. OUT: one line per change — id, name, old → new.
// TRUST: this list is the exact write set of step 4 (and the backup).
for (const p of todo) console.log(`${p._id}  ${p.name}\n    filterAttributes.price: ${JSON.stringify(p.mirror)} → ${p.unit}`);
console.log(`\n${todo.length} products to fix`);

// ── STEP 4: Write — only with --apply ───────────────────────────────
// IN:  `todo`. OUT: one transaction setting only filterAttributes.price,
//      each patch pinned to the revision read.
// TRUST: atomic (all or none); a patch fails if the document changed
//      since step 1; aborts if a product has a draft twin (a published
//      write would diverge from it).
if (!process.argv.includes('--apply')) { console.log('dry run — nothing written (add --apply)'); process.exit(0); }
const drafts = await client.withConfig({ perspective: 'raw' }).fetch(`*[_id in $d]{_id}`, { d: todo.map((p) => `drafts.${p._id}`) });
if (drafts.length) { console.log('ABORT — draft twins exist:', drafts.map((d) => d._id).join(', ')); process.exit(1); }
const tx = client.transaction();
for (const p of todo) tx.patch(p._id, { ifRevisionID: p._rev, set: { 'filterAttributes.price': p.unit } });
const res = await tx.commit();
console.log(`applied: ${res.results.length} documents patched`);
