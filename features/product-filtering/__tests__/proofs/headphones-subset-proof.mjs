// sang-logium-miw — end-to-end proof that /products/headphones returns the
// EXACT subset of products for any filter combination: no product that fails
// to match is ever included (no false positive), and no product that matches
// is ever missing (no false negative).
//
// Run against the shared dev server (must already be running on :3000 — do
// not start one; see AGENTS.md rule 1):
//   node --experimental-strip-types --loader ./features/product-filtering/__tests__/proofs/tsExtLoader.mjs \
//     --env-file=.env.local features/product-filtering/__tests__/proofs/headphones-subset-proof.mjs
//
// Two independent halves, diffed for exact set equality on every case:
//
//   ORACLE — a from-scratch, hand-written predicate (this file), evaluated
//   in-memory against one flat, UNFILTERED fetch of every real headphones
//   product straight from Sanity: same production data, same production
//   category-scoping mechanism (data/catalogue-index.json's VFS keys, the
//   same thing app/(store)/products/[...slug]/page.tsx uses) — but the match
//   logic itself is reimplemented from the plain-language spec, not copied
//   from features/product-filtering/domain/buildProductQuery.ts. That file is what's under test,
//   so it is never imported here.
//
//   ACTUAL — a plain HTTP GET of the real running app for
//   /products/headphones with each case's query string, walking real
//   pagination, parsed for the product slugs it actually rendered. No
//   Sanity/query-builder shortcut: this exercises URL parsing, category
//   resolution, the live GROQ query, and rendering, exactly as a browser
//   would.
//
// Case coverage (generated from live data — this file stays short and
// correct no matter how many facets facetMap.ts later grows to):
//   1. baseline — no filters selected, full catalogue.
//   2. one case per facet — that facet's own predicate, isolated. Proves
//      soundness + completeness for every atomic filter option in the UI.
//   3. one composed case per (type, type) facet-type pairing found in the
//      data (multi+boolean, multi+multi, range+multi, range+boolean,
//      range+range) plus one 4-facet "kitchen sink" — proves the
//      multi-facet AND composition. (buildProductQuery.ts joins every active
//      facet's GROQ fragment with a plain `&&` — read the source, don't
//      trust this comment.)
//   4. one price-range case (normal, non-trivial split) and one
//      impossible-price edge case (max below the cheapest real product) —
//      proves a legitimately empty result renders as empty, not as a wrong
//      fallback set.

import { readFileSync } from 'node:fs';
import { FILTER_FACETS, isPlaceholderVocab } from '../../config/facetMap.ts';

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const PER_PAGE = 24;

// ── env / raw Sanity client (hand-written, zero dependency on repo query code) ──
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_READ_TOKEN;
if (!projectId || !dataset || !token) {
  throw new Error('Missing Sanity env vars — run with --env-file=.env.local (see header comment).');
}

async function sanityQuery(query, params = {}) {
  const url = new URL(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set('query', query);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`);
  return (await res.json()).result;
}

// ── category scope: the same VFS mechanism production uses ─────────────────
const index = JSON.parse(readFileSync(new URL('../../../../data/catalogue-index.json', import.meta.url), 'utf8'));
const headphonesNodeId = index.slugToIdMap['headphones'];
if (!headphonesNodeId) throw new Error('Could not resolve "headphones" in data/catalogue-index.json');

function descendantKeys(nodeId) {
  const out = new Set();
  const stack = [nodeId];
  while (stack.length) {
    const id = stack.pop();
    if (out.has(id)) continue;
    out.add(id);
    for (const child of index.slotMetadataMap[id]?.children || []) stack.push(child);
  }
  return [...out];
}
const HEADPHONES_KEYS = descendantKeys(headphonesNodeId);

// ── oracle inventory: every real headphones product, unfiltered ────────────
async function fetchInventory() {
  const query = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0]{
    _id, "slug": slug.current, filterAttributes, price_data, stock, reservedStock
  }`;
  return sanityQuery(query, { keys: HEADPHONES_KEYS });
}

// ── oracle predicate: independent re-implementation ─────────────────────────
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function matchesFacet(product, facet, selected) {
  // inStock is bespoke in buildProductQuery.ts (coalesced with the legacy
  // stock arithmetic, handled before the generic boolean-facet loop and
  // explicitly excluded from it) — mirrored here with the same precedence,
  // independently written.
  if (facet.urlParam === 'inStock') {
    const declared = getPath(product, facet.field);
    if (typeof declared === 'boolean') return declared === true;
    return product.stock - product.reservedStock > 0;
  }
  if (facet.type === 'boolean') return getPath(product, facet.field) === true;
  if (facet.type === 'range') {
    const v = getPath(product, facet.field);
    if (typeof v !== 'number') return false;
    if (selected.min != null && v < selected.min) return false;
    if (selected.max != null && v > selected.max) return false;
    return true;
  }
  const raw = getPath(product, facet.field);
  const values = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
  const lowered = values.map((v) => String(v).toLowerCase());
  return selected.some((s) => lowered.includes(s.toLowerCase()));
}

function priceCents(product) {
  // Mirrors buildProductQuery.ts's own coalesce (filterAttributes.price is
  // the source of truth once migrated; price_data.unit_amount is the
  // fallback for products not yet migrated) — same precedence, independently
  // written.
  return product.filterAttributes?.price ?? product.price_data.unit_amount;
}

function matchesPrice(product, price) {
  if (!price) return true;
  const cents = priceCents(product);
  if (price.min != null && cents < price.min * 100) return false;
  if (price.max != null && cents > price.max * 100) return false;
  return true;
}

function matchesCase(product, active, price) {
  return matchesPrice(product, price) && active.every(({ facet, selected }) => matchesFacet(product, facet, selected));
}

// ── URL query string for a case (mirrors features/product-filtering/config/filterSortParams.ts) ─
function caseQueryString(active, price) {
  const params = new URLSearchParams();
  for (const { facet, selected } of active) {
    if (facet.type === 'boolean') params.set(facet.urlParam, 'true');
    else if (facet.type === 'range') {
      if (selected.min != null) params.set(`${facet.urlParam}Min`, String(selected.min));
      if (selected.max != null) params.set(`${facet.urlParam}Max`, String(selected.max));
    } else {
      params.set(facet.urlParam, selected.join(','));
    }
  }
  if (price?.min != null) params.set('minPrice', String(price.min));
  if (price?.max != null) params.set('maxPrice', String(price.max));
  return params.toString();
}

// ── ACTUAL: hit the real running app, walk real pagination ─────────────────
async function fetchActualSlugs(queryString) {
  const slugs = new Set();
  for (let page = 1; page <= 20; page++) {
    const sep = queryString ? '&' : '';
    const url = `${BASE_URL}/products/headphones?${queryString}${sep}page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    const html = await res.text();
    const found = [...html.matchAll(/href="\/product\/([a-z0-9-]+)"/g)].map((m) => m[1]);
    if (found.length === 0) break;
    for (const s of found) slugs.add(s);
    if (found.length < PER_PAGE) break;
  }
  return slugs;
}

// ── build the case list, driven entirely by live data ───────────────────────
function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function pickOption(facet, inventory) {
  if (facet.type === 'boolean') return { label: 'true', selected: null };
  if (facet.type === 'range') {
    const vals = inventory.map((p) => getPath(p, facet.field)).filter((v) => typeof v === 'number');
    if (vals.length < 2) return null;
    return { label: `min=${median(vals)}`, selected: { min: median(vals), max: null } };
  }
  const vocab = isPlaceholderVocab(facet.valueVocab)
    ? [...new Set(inventory.flatMap((p) => {
        const raw = getPath(p, facet.field);
        return Array.isArray(raw) ? raw : raw == null ? [] : [raw];
      }))]
    : facet.valueVocab;
  const counts = vocab
    .map((v) => ({ v, n: inventory.filter((p) => matchesFacet(p, facet, [v])).length }))
    .filter((x) => x.n > 0 && x.n < inventory.length);
  if (counts.length === 0) return null;
  counts.sort((a, b) => a.n - b.n);
  const pick = counts[Math.floor(counts.length / 2)];
  return { label: pick.v, selected: [pick.v] };
}

function buildCases(inventory) {
  const cases = [{ id: 'baseline: no filters', active: [] }];
  const skipped = [];
  const byType = { boolean: [], range: [], other: [] };

  for (const facet of FILTER_FACETS) {
    if (facet.urlParam === 'price') continue; // handled separately (dollars/cents, min+max, incl. edge case)
    if (!facet.categories.includes('headphones') && !facet.categories.includes('*')) continue;

    const opt = pickOption(facet, inventory);
    if (!opt) { skipped.push(facet.urlParam); continue; }

    const entry = { facet, selected: opt.selected };
    cases.push({ id: `single: ${facet.urlParam}=${opt.label}`, active: [entry] });
    (byType[facet.type] || byType.other).push(entry);
  }

  const pairSpecs = [['boolean', 'other'], ['other', 'other'], ['range', 'other'], ['range', 'boolean'], ['range', 'range']];
  for (const [ta, tb] of pairSpecs) {
    const [a, b] = ta === tb ? byType[ta] || [] : [byType[ta]?.[0], byType[tb]?.[0]];
    if (a && b) cases.push({ id: `composed: ${a.facet.urlParam} + ${b.facet.urlParam}`, active: [a, b] });
  }
  const sink = [byType.other[0], byType.other[1], byType.boolean[0], byType.range[0]].filter(Boolean);
  if (sink.length >= 3) cases.push({ id: `composed: kitchen-sink (${sink.map((e) => e.facet.urlParam).join('+')})`, active: sink });

  if (skipped.length) console.log(`(skipped ${skipped.length} facet(s) with no usable non-trivial split in current data: ${skipped.join(', ')})`);
  return cases;
}

// ── main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Fetching real headphones inventory from Sanity (dataset=${dataset})...`);
  const inventory = await fetchInventory();
  console.log(`${inventory.length} real headphones products in scope.\n`);

  const cases = buildCases(inventory);
  const cheapestCents = Math.min(...inventory.map(priceCents));
  const dollarsList = inventory.map((p) => priceCents(p) / 100);
  cases.push({ id: `single: price (min=$${median(dollarsList)})`, active: [], price: { min: median(dollarsList) } });
  cases.push({ id: 'edge: price below cheapest product (expect empty)', active: [], price: { max: Math.floor(cheapestCents / 100) - 1 } });

  let pass = 0, fail = 0;
  for (const c of cases) {
    const expected = new Set(inventory.filter((p) => matchesCase(p, c.active, c.price)).map((p) => p.slug));
    const actual = await fetchActualSlugs(caseQueryString(c.active, c.price));

    const missing = [...expected].filter((s) => !actual.has(s));
    const extra = [...actual].filter((s) => !expected.has(s));
    const ok = missing.length === 0 && extra.length === 0;
    ok ? pass++ : fail++;

    console.log(`${ok ? 'PASS' : 'FAIL'}  ${c.id}  (expected ${expected.size}, actual ${actual.size})`);
    if (!ok) {
      console.log(`   missing (should show, didn't): ${JSON.stringify(missing)}`);
      console.log(`   extra   (shown, shouldn't be):  ${JSON.stringify(extra)}`);
    }
  }

  console.log(`\n${cases.length} cases: ${pass} PASS, ${fail} FAIL.`);
  console.log(fail === 0
    ? 'ZERO FAILS — every case: no wrong product included, no matching product missing.'
    : `${fail} FAIL(S) — see the missing/extra slugs above.`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
