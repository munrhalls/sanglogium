// ══════════════════════════════════════════════════════════════════
// FIX 1.3.a — rewrite raw filterAttributes values to the option each
// facet offers, for the products check 2.3 marks ✗.
// Run: node tests/filtering/fix-1.3-normalize-values.mjs           (dry run: prints every change, writes nothing)
//      node tests/filtering/fix-1.3-normalize-values.mjs --apply   (one atomic Sanity transaction)
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: The decisions — off-option value → offered option ───────
// IN:  nothing. OUT: MAP — per facet id, each known off-option value and
//      the option it becomes (null = no option can express it: removed).
// TRUST: this table is the whole fix. A ✗ value not in it aborts step 3,
//      so nothing is ever guessed. Sources of each decision:
//      case/alias → same value spelt as the option; IP54 → water digit
//      only (facet is water resistance); tribrid/hybrid → the 'hybrid-config'
//      bucket (driverConfigDetail holds the detail); '2.5mm' → '2.5mm-balanced'
//      (the schema's own rename note on cableTermination); aptX Classic = aptX;
//      Boosted Bass → Basshead and Neutral-with-bass-boost → Neutral (nearest
//      option); aptX Lossless and Snapdragon Sound have no option → removed
//      (those products keep aptX Adaptive).
const MAP = {
  soundSignature: { warm: 'Warm', neutral: 'Neutral', 'Boosted Bass': 'Basshead', 'Neutral with bass boost': 'Neutral' },
  ipx: { IP54: 'IPX4' },
  codec: { sbc: 'SBC', aac: 'AAC', aptx: 'aptX', 'aptx-hd': 'aptX HD', ldac: 'LDAC', 'aptX Classic': 'aptX', 'aptX Low Latency': 'aptX LL', 'aptX lossless': null, 'aptX Lossless': null, 'Snapdragon Sound': null },
  driverConfig: { hybrid: 'hybrid-config', tribrid: 'hybrid-config' },
  cableTermination: { '2.5mm': '2.5mm-balanced' },
};

// ── STEP 2: Every product of every slice, with what its facets offer ─
// IN:  data/catalogue-index.json, the three category modules, Sanity.
// OUT: `todo` — for each product, each offered checkbox facet's current
//      value, the facet's offered options (null = derived brand), and
//      the product's own brand-reference slug.
// TRUST: same slice unroll and same offered-facet rule as check 2.3, so
//      "off-option" here is exactly what 2.3 marks ✗.
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const keysFor = (slug) => { const out = new Set(); const s = [index.slugToIdMap[slug]]; while (s.length) { const id = s.pop(); if (out.has(id)) continue; out.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } return out; };
const MODS = { 'headphones': 'headphones.ts', 'audio-electronics': 'audioElectronics.ts', 'accessories': 'accessories.ts' };
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const all = await client.fetch(`*[_type == "product"][0...2000]{ _id, _rev, name, catalogueLocationKeys, "brandSlug": brand->slug.current, filterAttributes }`);
const changes = []; // { p, attribute, id, from, to }
const unmapped = [];
for (const [slice, file] of Object.entries(MODS)) {
  const keys = keysFor(slice);
  const { FACETS } = await import(`../../features/product-filtering/core/definitions/categories/${file}`);
  const facets = FACETS.filter((f) => f.control === 'checkbox').map((f) => ({
    id: f.id,
    attribute: FILTER_FACETS.find((x) => x.urlParam === f.id).attribute,
    offered: f.options === 'derived' ? null : new Set(f.options.map((o) => o.value)),
  }));

  // ── STEP 3: Compute each product's corrected value ────────────────
  // IN:  products of this slice + `facets` + MAP.
  // OUT: `changes` — one entry per (product, facet) whose value changes;
  //      `unmapped` — any off-option value MAP does not cover.
  // TRUST: values already offered are never touched; arrays keep their
  //      order, drop removed values and lose duplicates; the brand becomes
  //      ["<its own brand reference slug>"].
  for (const p of all.filter((x) => (x.catalogueLocationKeys ?? []).some((k) => keys.has(k)))) {
    for (const { id, attribute, offered } of facets) {
      const cur = get(p.filterAttributes, attribute);
      if (cur == null) continue;
      let next;
      if (offered === null) {
        const arr = Array.isArray(cur) ? cur : [cur];
        if (arr.length === 1 && arr[0] === p.brandSlug) continue;
        next = [p.brandSlug];
      } else {
        const one = (v) => offered.has(v) ? v : (v in (MAP[id] ?? {}) ? MAP[id][v] : (unmapped.push(`${id}: ${JSON.stringify(v)} on ${p.name}`), v));
        next = Array.isArray(cur)
          ? [...new Set(cur.map(one).filter((v) => v !== null))]
          : one(cur);
      }
      if (JSON.stringify(next) !== JSON.stringify(cur) && !changes.some((c) => c.p._id === p._id && c.attribute === attribute))
        changes.push({ p, attribute, id, from: cur, to: next });
    }
  }
}
if (unmapped.length) { console.log('ABORT — off-option values with no decision in MAP:\n' + unmapped.join('\n')); process.exit(1); }

// ── STEP 4: Show every change ───────────────────────────────────────
// IN:  `changes`. OUT: one line per change — id, product, facet, old → new.
// TRUST: this list is the exact write set of step 5 (and the backup).
for (const c of changes) console.log(`${c.p._id}  ${c.p.name}\n    ${c.id}: ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}`);
const products = new Set(changes.map((c) => c.p._id)).size;
console.log(`\n${changes.length} field changes on ${products} products`);

// ── STEP 5: Write — only with --apply ───────────────────────────────
// IN:  `changes`. OUT: one transaction patching only the changed
//      filterAttributes keys (set), each pinned to the revision read.
// TRUST: atomic (all or none); a patch fails if the document changed
//      since step 2; aborts if a product has a draft twin (a published
//      write would diverge from it).
if (!process.argv.includes('--apply')) { console.log('dry run — nothing written (add --apply)'); process.exit(0); }
const ids = [...new Set(changes.map((c) => c.p._id))];
const drafts = await client.withConfig({ perspective: 'raw' }).fetch(`*[_id in $d]{_id}`, { d: ids.map((i) => `drafts.${i}`) });
if (drafts.length) { console.log('ABORT — draft twins exist:', drafts.map((d) => d._id).join(', ')); process.exit(1); }
const tx = client.transaction();
for (const id of ids) {
  const mine = changes.filter((c) => c.p._id === id);
  tx.patch(id, { ifRevisionID: mine[0].p._rev, set: Object.fromEntries(mine.map((c) => [`filterAttributes.${c.attribute}`, c.to])) });
}
const res = await tx.commit();
console.log(`applied: ${res.results.length} documents patched`);
