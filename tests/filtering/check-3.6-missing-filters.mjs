// ══════════════════════════════════════════════════════════════════
// CHECK 3.6 — every attribute distinguishing ≥2 products in a slice is
// offered as a filter. An attribute is OFFERED when the slice's own
// sidebar lists it (a facet in the slice's FACETS, or the price slider).
// Each unoffered key must carry a recorded decision below; a key with
// none, or one marked 'open', counts against the pass.
// Pass = "OPEN: 0".
// Run: node tests/filtering/check-3.6-missing-filters.mjs <slice>
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from '../catalogue/sanity-client.mjs';
import { FILTER_FACETS } from '../../features/product-filtering/core/definitions/facetMap.ts';

// ── STEP 1: Slice → location keys (same unroll as mission 01) ───────
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const root = index.slugToIdMap[process.argv[2]];
if (!root) { console.log('Usage: node tests/filtering/check-3.6-missing-filters.mjs <slice>'); process.exit(1); }
const keys = new Set();
{ const s = [root]; while (s.length) { const id = s.pop(); if (keys.has(id)) continue; keys.add(id); s.push(...(index.slotMetadataMap[id]?.children ?? [])); } }

// ── STEP 2: The decisions on record ─────────────────────────────────
// IN:  nothing. OUT: DECISIONS — per unoffered key, a status and why.
// TRUST: this table is the whole stated-dismissal record. 'deferred' =
//      owner decision 2026-10-14: not built now, revisit later; 'open' =
//      the schema itself calls the field a "Critical filter" and the
//      owner kept it open; 'excluded' = not a product characteristic.
//      Any key not listed here is unclassified and counts as OPEN.
const DECISIONS = {
  category: ['excluded', 'catalogue-routing key (schema: "distinct from the catalogue-routing filterAttributes.category")'],
  powerOutputPerChannelW: ['open', 'schema: "Critical filter" (amplifiers)'],
  phonoStageBuiltIn: ['open', 'schema: "Critical filter" (amplifiers)'],
  compatibility: ['open', 'schema: "Critical filter" (replacement parts); free-text model names'],
  driverConfigDetail: ['deferred', 'free text, display-only (schema)'],
  maxSampleRateBitDepth: ['deferred', 'free text, "no fixed enum" (schema)'],
  compatibleModelOrBrand: ['deferred', 'free text'],
  finishColor: ['deferred', 'free-text colours'],
  countryOfManufacture: ['deferred', 'free-text country names'],
  awards: ['deferred', 'free-text accolades; facet removed from the headphones sidebar per UX cleanup'],
  sourcing: ['deferred', 'provenance citations, not a shopper attribute (schema)'],
  customerRating: ['deferred', 'store-computed review aggregate (schema)'],
  dealsDiscount: ['deferred', 'store-operational (schema)'],
  wearingStyle: ['deferred', 'overlaps the offered Type facet (productCategory)'],
  accessoryCategory: ['deferred', 'duplicate of the offered accessoryType'],
  bluetoothCodecs: ['deferred', 'optional spec; the codec facet exists for headphones only'],
  outputs: ['deferred', 'optional spec'],
  hiResCertification: ['deferred', 'optional spec; mixed value types (true/false and names)'],
  networkConnection: ['deferred', 'optional spec'],
  rackMountable19: ['deferred', 'optional spec'],
  remoteControlIncluded: ['deferred', 'optional spec'],
  trigger12v: ['deferred', 'optional spec'],
  multiroomSupport: ['deferred', 'optional spec'],
  voiceAssistant: ['deferred', 'optional spec'],
  channelCount: ['deferred', 'optional spec'],
  material: ['deferred', 'optional spec (stands only)'],
  weightCapacityKg: ['deferred', 'optional spec (stands only)'],
};

// ── STEP 3: Which attributes the slice's sidebar offers ─────────────
// IN:  the slice's own FACETS (what print-2.1 shows) + FILTER_FACETS.
// OUT: `offered` — the top-level filterAttributes keys behind them,
//      plus 'price' (the shared price slider).
// TRUST: built from the slice's own facets — not from FILTER_FACETS as a
//      whole, whose extra entries (e.g. wearingStyle) are URL-valid but
//      not on the sidebar.
const MOD = {
  'headphones': 'categories/headphones.ts',
  'audio-electronics': 'categories/audioElectronics.ts',
  'accessories': 'categories/accessories.ts',
}[process.argv[2]];
const { FACETS } = await import(`../../features/product-filtering/core/definitions/${MOD}`);
const offered = new Set(['price', ...FACETS.map((f) => FILTER_FACETS.find((x) => x.urlParam === f.id).attribute.split('.')[0])]);

// ── STEP 4: All attribute keys present on slice products ────────────
// IN:  keys. OUT: every filterAttributes key any slice product carries,
//      with its distinct-value count and how many products carry it.
// TRUST: the key list comes from the data itself, not from a hand list —
//      nothing on the products can hide from this scan. Object values
//      count as one value; list items that are objects are compared as JSON.
const products = await client.fetch(
  `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0][0...1000]{ filterAttributes }`,
  { keys: [...keys] }
);
const vals = new Map(); const carried = new Map();
for (const p of products) {
  for (const [k, v] of Object.entries(p.filterAttributes ?? {})) {
    if (v == null) continue;
    carried.set(k, (carried.get(k) ?? 0) + 1);
    if (!vals.has(k)) vals.set(k, new Set());
    if (typeof v === 'object' && !Array.isArray(v)) vals.get(k).add('<object>');
    else for (const x of Array.isArray(v) ? v : [v]) vals.get(k).add(typeof x === 'object' ? JSON.stringify(x) : String(x));
  }
}

// ── STEP 5: Unoffered keys that distinguish products, with decisions ─
// IN:  vals + offered + DECISIONS.
// OUT: one line per key with ≥2 distinct values and no sidebar facet;
//      OPEN counts the 'open' and the unclassified ones.
// TRUST: a key listed here is distinguishing by the blueprint's own
//      definition (≥2 distinct values across the slice's products).
let open = 0; let deferred = 0;
for (const [k, v] of vals) {
  if (v.size < 2 || offered.has(k)) continue;
  const d = DECISIONS[k];
  const status = d ? d[0] : 'unclassified';
  if (status === 'open' || status === 'unclassified') open++;
  if (status === 'deferred') deferred++;
  console.log(`[${status}] ${k} — ${carried.get(k)}/${products.length} products, ${v.size} distinct${d ? ` — ${d[1]}` : ''}`);
}

// ── STEP 6: Report ──────────────────────────────────────────────────
console.log(`\nscanned: ${vals.size} attribute keys over ${products.length} products in ${process.argv[2]}; offered ${offered.size}`);
console.log(`OPEN: ${open}   (deferred: ${deferred})`);
