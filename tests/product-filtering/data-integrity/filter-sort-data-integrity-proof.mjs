// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS IS, IN ONE BREATH:
//
//   The code says "products can be filtered by these options".
//   Sanity stores the actual values on each product.
//   This script checks the two sides match — in both directions —
//   and prints every place they don't. It changes nothing.
//
//   Think of it like checking a guest list at the door:
//   everyone on the list should be inside, everyone inside should be on
//   the list. Any mismatch is printed by name.
//
//   Same code + same Sanity data = same output. Every run. No randomness.
//
// RUN: node --env-file=.env.local tests/product-filtering/data-integrity/filter-sort-data-integrity-proof.mjs
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
// STEP 1 · READ THE MENU
// IN:  the three files that define what filter controls the shop shows.
// OUT: for each slice: its controls, and for each control its allowed values.
// WHY: this is the "guest list" — the values a product is ALLOWED to have.
//      Some controls say 'derived' (their list is built from the data itself,
//      like Brand) or are sliders/toggles — those have no fixed list to check.
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
// STEP 2 · READ THE WIRING DIAGRAM
// IN:  fieldMap.ts — says which product field each control reads.
// OUT: { controlId: 'filterAttributes.someField' }
// WHY: a control with no wire to a field can't filter anything at all.
// ═══════════════════════════════════════════════════════════════════════════
const FACET_FIELD_MAP = Object.fromEntries(
  [...read('features/product-filtering/adapters/sanity/fieldMap.ts').matchAll(/^\s*(\w+): '([^']+)'/gm)]
    .map((m) => [m[1], m[2]]),
);

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 · READ THE SORT SETUP
// IN:  sortOptions.ts (the dropdown the user sees) + buildProductQuery.ts
//      (the actual sort instructions behind each choice) + SORT_FIELD below
//      (which product field each sort looks at).
// OUT: two lists to compare — visible sort choices vs. existing instructions.
// WHY: sorting has no "allowed values" like filters do. A sort is broken if
//      the dropdown offers a choice with no instruction behind it, or if an
//      instruction exists for a choice the dropdown doesn't offer.
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
// STEP 4 · FETCH THE PRODUCTS
// IN:  Sanity — every product's name, which shelf it sits on, and all its
//      stored filter values.
// OUT: for each slice, the products on its shelf. "Shelf" = the same rule
//      the shop uses: a product belongs to 'headphones' when one of its
//      location keys is 'headphones' or starts with 'headphones/'.
// WHY: this is "who is actually in the room" — the real data being checked.
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

// A product may store one value ('wired') or a list (['SBC','AAC']) in a
// field — both shapes exist in the live data. Read both, miss nothing.
const storedValues = (p, path) => {
  const v = getField(p, path);
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).map(String);
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5 · CHECK EVERY FILTER, BOTH DIRECTIONS
// For each control in each slice, three questions:
//
//   A · does the control have a wire to a product field?
//       (no wire = it filters nothing)
//   B · is every allowed value actually used by some product?
//       (unused value = a checkbox that always shows zero results)
//   C · does every stored product value appear on the allowed list?
//       (unlisted value = a product no checkbox can ever find)
//
// 'derived' and toggle/slider controls only get question A — they have no
// fixed list, so B and C can't apply.
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
// STEP 6 · CHECK THE SORTS AND THE WIRING LEFTOVERS
//   D · every dropdown sort choice has a sort instruction, and every
//       instruction has a dropdown choice (both directions).
//   E · the field each sort looks at isn't empty on every product in a
//       slice — sorting by a field nobody has does nothing.
//   F · every wire in the field map is used by some control — a wire to a
//       control that no longer exists is a leftover from deleted filters.
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

lines.push(`\nfield map`);
const usedIds = new Set(Object.values(slices).flat().map((f) => f.id));
// 'price' is exempt: its slider is built specially, not from the facet list.
for (const id of Object.keys(FACET_FIELD_MAP)) {
  if (id === 'price') continue;
  if (!usedIds.has(id)) {
    problems.push(`field map · ${id} — mapped field '${FACET_FIELD_MAP[id]}' has no control in any slice`);
    lines.push(`  ${id}  NO CONTROL`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 7 · VERDICT
// Prints everything found, then one summary line.
// Exit 0 = clean. Exit 1 = the printed lines name every broken link.
// ═══════════════════════════════════════════════════════════════════════════
console.log(lines.join('\n'));
console.log(`\n${problems.length === 0 ? 'INTEGRITY OK — all links hold' : `${problems.length} broken link(s)`}`);
if (problems.length) {
  console.log(problems.map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
