// ─────────────────────────────────────────────────────────────────────────────
// FLOW: read the declared controls/options/sorts from the definition files →
// fetch every product's stored filter values from Sanity → diff the two sides
// in both directions → print each broken link, exit 1 if any exist.
//
// This proof CHANGES NOTHING. It reads code files and Sanity data and prints
// what it finds. It proves WHAT IS.
//
// Determinism: output is a pure function of (definition files at this commit)
// + (Sanity dataset at run time). Same code + same data → same output, always.
// It is not a fixed historical snapshot; if product data changes, the checked
// relationship is re-evaluated fresh — that is the point of an integrity check.
//
// Run: node --env-file=.env.local tests/product-filtering/data-integrity/filter-sort-data-integrity-proof.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sanityQuery } from '../sanity-raw.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const DEF = 'features/product-filtering/core/definitions';
const CATEGORIES = ['headphones', 'audioElectronics', 'accessories'];
const CATEGORY_SLUG = {
  headphones: 'headphones',
  audioElectronics: 'audio-electronics',
  accessories: 'accessories',
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 · CONTROLS
// IN:  the three category definition files — the rendered control list.
// OUT: per slice, every facet { id, control, options } where options is a
//      static value list, 'derived' (runtime-collected, e.g. brand — cannot
//      corrupt by definition), or null (boolean/range — no vocabulary).
// WHY: these files are what the sidebar actually renders. Any value check
//      must start from this list, not from registries that may be stale.
// ═══════════════════════════════════════════════════════════════════════════
function parseFacets(source) {
  const facetsBlock = source.slice(source.indexOf('FACETS'));
  const ids = [...facetsBlock.matchAll(/id: '([\w-]+)'/g)].map((m) => m.index);
  const facets = [];
  for (let i = 0; i < ids.length; i++) {
    const block = facetsBlock.slice(ids[i], ids[i + 1] ?? facetsBlock.length);
    const id = block.match(/id: '([\w-]+)'/)[1];
    const control = block.match(/control: '(\w+)'/)?.[1] ?? null;
    let options = null;
    if (/"derived"|'derived'/.test(block)) {
      options = 'derived';
    } else {
      const optsCall = block.match(/opts\(\[\[([\s\S]*?)\]\]\)/);
      const optsArr = block.match(/options: \[([\s\S]*?)\]/);
      if (optsCall) {
        options = [...optsCall[0].matchAll(/\[\s*'([^']+)'\s*,\s*'[^']+'\s*\]/g)].map((m) => m[1]);
      } else if (optsArr) {
        options = [...optsArr[1].matchAll(/value: '([^']+)'/g)].map((m) => m[1]);
      }
    }
    facets.push({ id, control, options });
  }
  return facets;
}

const slices = {};
for (const cat of CATEGORIES) {
  slices[cat] = parseFacets(read(`${DEF}/categories/${cat}.ts`));
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 · FIELD MAP
// IN:  adapters/sanity/fieldMap.ts — facet id → Sanity document field path.
// OUT: FACET_FIELD_MAP { facetId: 'filterAttributes.x' }.
// WHY: the map is the declared bridge between a control and product data.
//      A control with no entry here has no declared field — broken by itself.
// ═══════════════════════════════════════════════════════════════════════════
const FACET_FIELD_MAP = Object.fromEntries(
  [...read('features/product-filtering/adapters/sanity/fieldMap.ts').matchAll(/^\s*(\w+): '([^']+)'/gm)]
    .map((m) => [m[1], m[2]]),
);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 · SORTS
// IN:  definitions/sortOptions.ts (rendered sort list) +
//      adapters/sanity/buildProductQuery.ts (ORDER_BY_SORT case clauses) +
//      SORT_FIELD below (each rendered sort → the document field it orders by).
// OUT: sorts both ways: rendered option missing a clause = dead option;
//      clause existing for a non-rendered value = unreachable registry entry.
//      Field presence is checked in STEP 6.
// WHY: sorting has no "option values on products" — its integrity link is
//      option → order clause → field that actually holds data.
// ═══════════════════════════════════════════════════════════════════════════
const SORT_OPTIONS = [...read(`${DEF}/sortOptions.ts`).matchAll(/value: '([\w-]+)'/g)]
  .map((m) => m[1]);
const ORDER_CLAUSES = new Set(
  [...read('features/product-filtering/adapters/sanity/buildProductQuery.ts').matchAll(/case '([\w-]+)'/g)]
    .map((m) => m[1]),
);
const SORT_FIELD = {
  newest: '_createdAt',
  'price-asc': 'price_data.unit_amount',
  'price-desc': 'price_data.unit_amount',
  'alpha-asc': 'name',
  'alpha-desc': 'name',
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 · PRODUCTS
// IN:  live Sanity — every product's id, name, location keys, filter values.
// OUT: per slice, the products that belong to it: a product is in slice X
//      when a catalogueLocationKey equals X or starts with 'X/'.
// WHY: the slice boundary is exactly how the catalogue decides which
//      products a category page shows — the proof uses the same rule.
// ═══════════════════════════════════════════════════════════════════════════
const products = await sanityQuery(
  `*[_type == "product"]{ _id, name, _createdAt, catalogueLocationKeys, filterAttributes, price_data }`,
);
const inSlice = (p, cat) =>
  (p.catalogueLocationKeys ?? []).some(
    (k) => k === CATEGORY_SLUG[cat] || k.startsWith(CATEGORY_SLUG[cat] + '/'),
  );

const getField = (p, path) =>
  path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), p);

// A field may be stored as a scalar OR an array on different products
// (confirmed live — see buildProductQuery.ts's mixed-shape note). Collect
// values from both shapes so neither is silently missed.
const storedValues = (p, path) => {
  const v = getField(p, path);
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).map(String);
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5 · FILTER LINKS — three separate checks, each reported alone.
// CHECK A · control → field:  every control has a FACET_FIELD_MAP entry.
// CHECK B · option → product: every static option value appears on ≥1
//           product in its slice (else it is a dead option).
// CHECK C · product → option: every stored value on slice products resolves
//           to a declared option (else the product is unfilterable by it).
// 'derived' and boolean/range facets run CHECK A only — they have no static
// vocabulary to diff (derived collects from data at runtime, so B and C are
// vacuous for it).
// ═══════════════════════════════════════════════════════════════════════════
const problems = [];
const lines = [];

for (const cat of CATEGORIES) {
  lines.push(`\n${CATEGORY_SLUG[cat]}`);
  const sliceProducts = products.filter((p) => inSlice(p, cat));
  lines.push(`  ${sliceProducts.length} products`);
  for (const facet of slices[cat]) {
    const field = FACET_FIELD_MAP[facet.id];
    if (!field) {
      problems.push(`${CATEGORY_SLUG[cat]} · ${facet.id} — control has no field mapping`);
      lines.push(`  ${facet.id}  NO FIELD MAP`);
      continue;
    }
    if (!Array.isArray(facet.options)) {
      lines.push(`  ${facet.id}  ${facet.options === 'derived' ? 'derived — skipped' : `${facet.control} — no vocabulary`}`);
      continue;
    }
    if (facet.options.length === 0) {
      problems.push(`${CATEGORY_SLUG[cat]} · ${facet.id} — checkbox control declares zero options`);
      lines.push(`  ${facet.id}  EMPTY OPTION LIST`);
      continue;
    }
    const stored = new Set(sliceProducts.flatMap((p) => storedValues(p, field)));
    const declared = new Set(facet.options);
    const orphans = [...stored].filter((v) => !declared.has(v));
    const dead = [...declared].filter((v) => !stored.has(v));
    lines.push(`  ${facet.id}  ${declared.size} options · ${stored.size} stored values`);
    for (const v of orphans) {
      problems.push(`${CATEGORY_SLUG[cat]} · ${facet.id} — ORPHAN product value '${v}' has no option`);
      lines.push(`    ORPHAN  '${v}'`);
    }
    for (const v of dead) {
      problems.push(`${CATEGORY_SLUG[cat]} · ${facet.id} — DEAD option '${v}' matches no product`);
      lines.push(`    DEAD    '${v}'`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6 · SORT LINKS
// CHECK D · rendered option ↔ order clause (both directions).
// CHECK E · the field each sort orders by is defined on ≥1 product per slice
//           (a sort on an all-empty field silently does nothing).
// ═══════════════════════════════════════════════════════════════════════════
lines.push(`\nsort`);
for (const v of SORT_OPTIONS) {
  const hasClause = ORDER_CLAUSES.has(v);
  const field = SORT_FIELD[v];
  const counts = CATEGORIES.map((cat) => {
    const n = products.filter((p) => inSlice(p, cat) && getField(p, field) != null).length;
    if (n === 0) problems.push(`sort · ${v} — backing field '${field}' empty on all ${CATEGORY_SLUG[cat]} products`);
    return `${CATEGORY_SLUG[cat]}:${n}`;
  });
  lines.push(`  ${v}  clause:${hasClause ? 'yes' : 'MISSING'}  field '${field}' defined on ${counts.join(' ')}`);
  if (!hasClause) problems.push(`sort · ${v} — rendered option has no order clause`);
}
for (const v of ORDER_CLAUSES) {
  if (!SORT_OPTIONS.includes(v)) {
    problems.push(`sort · ${v} — order clause exists but no rendered option`);
    lines.push(`  ${v}  UNREACHABLE CLAUSE`);
  }
}

// CHECK F · field map → control: every FACET_FIELD_MAP entry is read by at
// least one slice's control. An entry no control uses is a stale wire — the
// registry still claims a field nothing reads.
lines.push(`\nfield map`);
const usedIds = new Set(Object.values(slices).flat().map((f) => f.id));
// 'price' is exempt: the sidebar renders a bespoke PriceSection that is not a
// FACETS entry — its field mapping is used even though no facet declares it.
for (const id of Object.keys(FACET_FIELD_MAP)) {
  if (id === 'price') continue;
  if (!usedIds.has(id)) {
    problems.push(`field map · ${id} — mapped field '${FACET_FIELD_MAP[id]}' has no control in any slice`);
    lines.push(`  ${id}  NO CONTROL`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 7 · VERDICT
// Exit 0 = every checked link holds. Exit 1 = the printed problems are the
// exact broken links, each naming slice · control · direction · value.
// ═══════════════════════════════════════════════════════════════════════════
console.log(lines.join('\n'));
console.log(`\n${problems.length === 0 ? 'INTEGRITY OK — all links hold' : `${problems.length} broken link(s)`}`);
if (problems.length) {
  console.log(problems.map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
