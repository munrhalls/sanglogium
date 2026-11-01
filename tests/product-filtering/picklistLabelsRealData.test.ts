// Picklist and labels proof: do the picklist and the labels work correctly? PASS or NO. It tells the truth and nothing else.
//
// ONE snapshot of the live data: one request to api.sanity.io (not the CDN) holding the shop's own query, the product names and the curated rows; published only.
// Nine questions on that data and one on fixtures. All yes means done:
//   1. the stored picklist is valid: both always-on lists hold names; every stored pick is a name, offered for its list, once
//   2. every offered field, filter or sort, is held by a product of its scope, and is offered once
//   3. every always-on field, filter or sort, is held by every product
//   4. every offered sort field is a plain number wherever a product holds it (a list or a text has no single value to order by)
//   5. every product is in a slice (so the all-products scope is the whole catalogue)
//   6. the curated rows are unique on (field, value): the Studio and the shop read the same row
//   7. the raw map equals a second walk over the products: the controls in the owner's order, each with its distinct values, sorted
//   8. the labels map names every control and option of the raw map once, every sort once, and every text is non-empty
//   9. the list the Studio draws is exactly the maps: per scope its controls, options and sorts
//   10. the rules give the hand-written answers on fixtures in the real format with alien content: raw map, labels, sort names, slicing, the read path
//       from the stored document to the list (a missing document, absent and empty lists, a pick only on all products, a product in no slice), the row writer
// A value is anything but: missing, null, blank text, an empty list, an empty object.
// Not checked, because nothing is wrong when it holds: a curated row that names nothing (the labels map ignores it); a stored pick no product holds
// (no control is drawn for it); what the Studio form shows (read-only lists, groups, sortable rows: a hand check).
// No flakiness: one snapshot, no clock, no randomness in a verdict. A read that fails is no verdict.
// The proof can say no: before judging, questions 1-9 are each run once on fixtures with a planted break (a proof that cannot say no exits 2).
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/picklistLabelsRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> read -> derive -> judge + fixtures -> report

import { PICKABLE, SORTABLE } from '@/features/product-filtering/schema/pickableFields';
import { setRowText, type LabelRow } from '@/features/product-filtering/schema/labelRows';
import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { autoControlLabel, autoOptionLabel, buildLabelsMap } from '@/features/product-filtering/core/rules/buildLabelsMap';
import { buildSortLabels } from '@/features/product-filtering/core/rules/buildSortLabels';
import { sortFieldsOf } from '@/features/product-filtering/core/rules/sortFields';
import { sliceByCatalogue } from '@/features/product-filtering/core/rules/sliceByCatalogue';
import { listControlLabels } from '@/features/product-filtering/core/rules/listControlLabels';
import { getControlLabels } from '@/features/product-filtering/queries/getControlLabels';
import { OPTION_MAP_QUERY, toOptionMapData } from '@/features/product-filtering/adapters/sanity/optionMapData';
import type { CatalogueNode, CuratedLabel, LabelsMap, OptionValue, RawMap, SliceControls, SortLabels, SortMap } from '@/features/product-filtering/core/types/optionMaps';

type Product = { _id: string; filterAttributes?: Record<string, unknown>; catalogueLocationKeys?: string[]; [key: string]: unknown };
// One scope of the picklist: its slug in the maps, the picklist document's list names for its filter picks and its sort picks, and what Studio offers for each.
// `all`: the scope holds the products of all the slices.
type Scope = { slug: string; list: string; sortList: string; offer: string[]; sortOffer: string[]; all?: boolean };
type Inputs = { scopes: Scope[]; doc: Record<string, unknown>; products: Product[]; items: CatalogueNode[]; curated: CuratedLabel[] };
type Facts = Inputs & {
  slices: Record<string, Product[]>;
  picklist: { alwaysOn: string[]; picks: Record<string, string[]> };
  raw: RawMap;
  labels: LabelsMap;
  sortMap: SortMap;
  sortNames: SortLabels;
  list: SliceControls[];
};

const QUESTIONS: Record<number, string> = {
  1: 'the stored picklist is valid: both always-on lists hold names; every stored pick is a name, offered for its list, once',
  2: 'every offered field, filter or sort, is held by a product of its scope, and is offered once',
  3: 'every always-on field, filter or sort, is held by every product',
  4: 'every offered sort field is a plain number wherever a product holds it',
  5: 'every product is in a slice',
  6: 'the curated rows are unique on (field, value)',
  7: 'the raw map equals a second walk over the products: the controls in the owner\'s order, each with its distinct values, sorted',
  8: 'the labels map names every control and option of the raw map once, every sort once, and every text is non-empty',
  9: 'the list the Studio draws is exactly the maps: per scope its controls, options and sorts',
  10: 'the rules give the hand-written answers on the fixtures',
};

// The real scopes: the three slices and all products. The picklist document keeps camelCase list names; a sort list is `sort` + the list name.
const SLICE_OF: Record<string, string> = { headphones: 'headphones', audioElectronics: 'audio-electronics', accessories: 'accessories', allProducts: 'all-products' };
const sortListOf = (list: string) => `sort${list[0].toUpperCase()}${list.slice(1)}`;
const SCOPES: Scope[] = Object.entries(SLICE_OF).map(([list, slug]) => ({
  slug,
  list,
  sortList: sortListOf(list),
  offer: PICKABLE[list as keyof typeof PICKABLE],
  sortOffer: SORTABLE[list as keyof typeof SORTABLE],
  all: list === 'allProducts',
}));

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const isText = (x: unknown): x is string => typeof x === 'string' && x.trim() !== '';
const hasValue = (v: unknown): boolean =>
  v !== undefined &&
  v !== null &&
  !(typeof v === 'string' && !v.trim()) &&
  !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);
const at = (object: unknown, path: string): unknown => path.split('.').reduce<any>((value, key) => value?.[key], object);
const repeated = (list: string[]) => [...new Set(list.filter((x, i) => list.indexOf(x) !== i))];
const rank = (v: OptionValue) => (typeof v === 'number' ? 0 : typeof v === 'boolean' ? 1 : 2);
const byKind = (a: OptionValue, b: OptionValue) => rank(a) - rank(b) || (a < b ? -1 : a > b ? 1 : 0);
const canon = (r: unknown) => JSON.stringify(r, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v));

// The second way to the raw map: walk every leaf of a product and collect the values per path, instead of looking a path up.
function leaves(value: unknown, path: string, into: Map<string, unknown[]>) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    for (const [key, inner] of Object.entries(value)) leaves(inner, path ? `${path}.${key}` : key, into);
    return;
  }
  const list = into.get(path) ?? [];
  for (const x of Array.isArray(value) ? value : [value]) if (x !== null && x !== undefined && !(typeof x === 'string' && x.trim() === '')) list.push(x);
  into.set(path, list);
}
const held = (products: Product[], root: (p: Product) => unknown) => {
  const into = new Map<string, unknown[]>();
  for (const p of products) leaves(root(p), '', into);
  return into;
};

// The facts every question judges, worked out from the inputs by the shop's own rules (the slices, the raw map, the labels, the Studio list) and, by hand, the
// stored picks and the sort fields. `list` is the Studio list the real use case gave; without one, the pure rule makes it.
function derive(i: Inputs, list?: SliceControls[]): Facts {
  const slices: Record<string, Product[]> = {};
  for (const s of i.scopes) if (!s.all) slices[s.slug] = sliceByCatalogue(i.items, i.products, s.slug);
  const inSlice = new Set(Object.values(slices).flat().map((p) => p._id));
  for (const s of i.scopes) if (s.all) slices[s.slug] = i.products.filter((p) => inSlice.has(p._id));
  const picklist = { alwaysOn: strings(i.doc.alwaysOn), picks: Object.fromEntries(i.scopes.map((s) => [s.slug, strings(i.doc[s.list])])) };
  const raw = buildRawMap(picklist, slices);
  const sortMap: SortMap = Object.fromEntries(i.scopes.map((s) => [s.slug, [...new Set([...strings(i.doc.sortAlwaysOn), ...strings(i.doc[s.sortList])])]]));
  return { ...i, slices, picklist, raw, labels: buildLabelsMap(raw, i.curated), sortMap, sortNames: buildSortLabels(sortMap, i.curated), list: list ?? listControlLabels(raw, buildSortLabels(sortMap, [])) };
}

// Questions 1 to 9: the findings per question. An empty list is a yes.
export function judge(f: Facts): Record<number, string[]> {
  const found: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
  const always: [string, unknown][] = [['alwaysOn', f.doc.alwaysOn], ['sortAlwaysOn', f.doc.sortAlwaysOn]];
  const lists = f.scopes.flatMap((s) => [
    { name: s.list, slug: s.slug, offer: s.offer, sort: false },
    { name: s.sortList, slug: s.slug, offer: s.sortOffer, sort: true },
  ]);

  // 1. The stored picklist.
  for (const [name, value] of always) {
    if (!Array.isArray(value) || !value.length) { found[1].push(`${name} is missing or empty`); continue; }
    if (!value.every(isText)) found[1].push(`${name} holds a blank entry`);
    for (const v of repeated(value.filter(isText))) found[1].push(`${name}: ${v} is stored twice`);
  }
  for (const l of lists) {
    const value = f.doc[l.name];
    if (value === undefined || value === null) continue;
    if (!Array.isArray(value)) { found[1].push(`${l.name} is not a list`); continue; }
    for (const v of value) {
      if (!isText(v)) found[1].push(`${l.name} holds a blank entry`);
      else if (!l.offer.includes(v)) found[1].push(`${l.name}: ${v} is stored but not offered`);
    }
    for (const v of repeated(value.filter(isText))) found[1].push(`${l.name}: ${v} is stored twice`);
  }

  // 2. Every offered field is held by a product of its scope, and offered once.
  for (const l of lists) {
    for (const path of l.offer) if (!f.slices[l.slug].some((p) => hasValue(at(p.filterAttributes, path)))) found[2].push(`${l.name}: ${path} is offered but no product of the scope holds it`);
    for (const path of repeated(l.offer)) found[2].push(`${l.name}: ${path} is offered twice`);
  }

  // 3. Every always-on field is held by every product.
  for (const [name, value] of always) {
    for (const path of Array.isArray(value) ? value.filter(isText) : []) {
      const lacking = f.products.filter((p) => !hasValue(at(p, path)));
      if (lacking.length) found[3].push(`${name}: ${path} is missing on ${lacking.length} of ${f.products.length} products, first: ${lacking[0]._id}`);
    }
  }

  // 4. Every offered sort field is a plain number wherever a product holds it.
  for (const l of lists.filter((x) => x.sort)) {
    for (const path of l.offer) {
      const odd = f.slices[l.slug].filter((p) => {
        const v = at(p.filterAttributes, path);
        return hasValue(v) && !(typeof v === 'number' && Number.isFinite(v));
      });
      if (odd.length) found[4].push(`${l.name}: ${path} is not a plain number on ${odd.length} products, first: ${odd[0]._id}`);
    }
  }

  // 5. Every product is in a slice.
  const sliced = new Set(f.scopes.filter((s) => !s.all).flatMap((s) => f.slices[s.slug]).map((p) => p._id));
  const orphans = f.products.filter((p) => !sliced.has(p._id));
  if (orphans.length) found[5].push(`${orphans.length} products are in no slice, first: ${orphans[0]._id}`);

  // 6. The curated rows are unique on (field, value).
  const named = new Set<string>();
  f.curated.forEach((row, i) => {
    const key = `${row.field ?? ''}\n${row.value ?? ''}`;
    if (named.has(key)) found[6].push(`row ${i + 1} (${row.field ?? ''} · ${row.value || 'control name'}): the same field and value are named by another row`);
    named.add(key);
  });

  // 7. The raw map equals a second walk: the controls in the owner's order (the always-on fields, then the picks), each with its distinct values, sorted.
  for (const s of f.scopes) {
    const have = f.raw[s.slug];
    if (!have) { found[7].push(`${s.slug}: no raw map`); continue; }
    const product = held(f.slices[s.slug], (p) => p);
    const attributes = held(f.slices[s.slug], (p) => p.filterAttributes);
    const want = new Map<string, unknown[]>([
      ...f.picklist.alwaysOn.map((x): [string, unknown[]] => [x, product.get(x) ?? []]),
      ...f.picklist.picks[s.slug].map((x): [string, unknown[]] => [x, attributes.get(x) ?? []]),
    ]);
    if (Object.keys(have).join('\n') !== [...want.keys()].join('\n')) found[7].push(`${s.slug}: the controls are [${Object.keys(have).join(', ')}], wanted [${[...want.keys()].join(', ')}]`);
    for (const [path, values] of want) {
      const expected = [...new Map(values.map((x) => [JSON.stringify(x), x] as const)).values()].sort((a, b) => byKind(a as OptionValue, b as OptionValue));
      if (canon(have[path]) !== canon(expected)) found[7].push(`${s.slug}: ${path} holds ${canon(have[path])}, wanted ${canon(expected)}`);
    }
  }

  // 8. The labels map names every control and option of the raw map once, every sort once, and every text is non-empty.
  for (const [slice, controls] of Object.entries(f.raw)) {
    const have = f.labels[slice];
    if (!have) { found[8].push(`${slice}: no labels`); continue; }
    if ([...Object.keys(have)].sort().join('\n') !== [...Object.keys(controls)].sort().join('\n')) found[8].push(`${slice}: the labelled controls differ from the raw map's`);
    for (const [field, values] of Object.entries(controls)) {
      const c = have[field];
      if (!c) continue;
      if (!isText(c.label)) found[8].push(`${slice}: ${field} has an empty name`);
      const keys = values.map(String);
      if ([...Object.keys(c.options)].sort().join('\n') !== [...keys].sort().join('\n')) found[8].push(`${slice}: ${field}: the labelled options differ from the raw map's`);
      for (const k of keys) if (!isText(c.options[k])) found[8].push(`${slice}: ${field}: option ${k} has an empty text`);
    }
  }
  for (const [slice, fields] of Object.entries(f.sortMap)) {
    const names = f.sortNames[slice] ?? {};
    if ([...Object.keys(names)].sort().join('\n') !== [...fields].sort().join('\n')) found[8].push(`${slice}: the sort names differ from the sort fields`);
    for (const [field, text] of Object.entries(names)) if (!isText(text)) found[8].push(`${slice}: sort ${field} has an empty name`);
  }

  // 9. The Studio list is exactly the maps: per scope its controls with their options, and its sorts, with the automatic texts.
  const expected = Object.entries(f.raw).map(([slice, controls]) => ({
    slice,
    controls: Object.entries(controls).map(([field, values]) => ({
      field,
      label: autoControlLabel(field),
      options: values.map((v) => ({ value: String(v), text: autoOptionLabel(v) })),
    })),
    sorts: (f.sortMap[slice] ?? []).map((field) => ({ field, label: autoControlLabel(field) })),
  }));
  if (f.list.map((s) => s.slice).join('\n') !== expected.map((s) => s.slice).join('\n')) found[9].push(`the list has the scopes [${f.list.map((s) => s.slice).join(', ')}], wanted [${expected.map((s) => s.slice).join(', ')}]`);
  for (const want of expected) {
    const got = f.list.find((s) => s.slice === want.slice);
    if (!got) continue;
    if (canon(got.controls) !== canon(want.controls)) found[9].push(`${want.slice}: the controls of the list differ from the maps`);
    if (canon(got.sorts) !== canon(want.sorts)) found[9].push(`${want.slice}: the sorts of the list differ from the maps`);
  }
  return found;
}

// Fixtures in the real format with alien content, holding the awkward cases: null, blank text, an empty list, a number, true/false, a nested path,
// a field picked for all products that no slice picks, a field that is both a filter and a sort.
const TREE: CatalogueNode[] = [
  { _id: 'r1', slug: 'zorb' }, { _id: 'c1', slug: 'zorb-kid', parent: 'r1' }, { _id: 'c2', slug: 'deep', parent: 'c1' },
  { _id: 'r2', slug: 'vex' }, { _id: 'r3', slug: 'other' },
];
const alien = (): Inputs => ({
  scopes: [
    { slug: 'zorb', list: 'zorb', sortList: 'sortZorb', offer: ['quux', 'plomb.min', 'tags'], sortOffer: ['plomb.min', 'heft'] },
    { slug: 'vex', list: 'vex', sortList: 'sortVex', offer: ['glim'], sortOffer: ['gram'] },
    { slug: 'omni', list: 'omni', sortList: 'sortOmni', offer: ['zing'], sortOffer: ['heft'], all: true },
  ],
  doc: {
    _id: 'filterPicklist',
    alwaysOn: ['wibble', 'plink.amount'],
    sortAlwaysOn: ['plink.amount', 'blorp'],
    zorb: ['quux', 'plomb.min', 'tags'],
    vex: ['glim'],
    omni: ['zing'],
    sortZorb: ['plomb.min', 'heft'],
    sortVex: [],
    sortOmni: ['heft'],
  },
  products: [
    { _id: 'p1', wibble: 'Frob', blorp: 'n1', plink: { amount: 3 }, filterAttributes: { quux: 'a', plomb: { min: 1 }, tags: ['x', 'y'], zing: 'k', heft: 4 }, catalogueLocationKeys: ['c2'] },
    { _id: 'p2', wibble: 'Frob', blorp: 'n2', plink: { amount: 0 }, filterAttributes: { quux: 'b', plomb: { min: null }, tags: ['y'], heft: 6 }, catalogueLocationKeys: ['r1'] },
    { _id: 'p3', wibble: 'Zed', blorp: 'n3', plink: { amount: 9 }, filterAttributes: { glim: true, gram: 7 }, catalogueLocationKeys: ['r2'] },
    { _id: 'p4', wibble: 'Zed', blorp: 'n4', plink: { amount: 3 }, filterAttributes: { quux: '  ', plomb: { min: 2 }, tags: [] }, catalogueLocationKeys: ['c1'] },
  ],
  items: TREE,
  curated: [
    { field: 'quux', text: 'Quux control' },
    { field: 'quux', value: 'a', text: 'Alpha' },
    { field: 'tags', value: 'y', text: '   ' },
    { field: 'glim', value: 'true', text: 'Glim on' },
    { field: 'plink.amount', value: '3', text: 'Three' },
    { field: 'heft', text: 'Heaviness' },
  ],
});

// Question 10: the rules against hand-written answers.
async function fixtures(): Promise<string[]> {
  const bad: string[] = [];
  const expect = (what: string, got: unknown, want: unknown) => {
    if (canon(got) !== canon(want)) bad.push(`${what}: got ${canon(got)}, wanted ${canon(want)}`);
  };
  const threw = (run: () => unknown) => {
    try { run(); return false; } catch { return true; }
  };
  const f = derive(alien());

  const RAW: RawMap = {
    zorb: { wibble: ['Frob', 'Zed'], 'plink.amount': [0, 3], quux: ['a', 'b'], 'plomb.min': [1, 2], tags: ['x', 'y'] },
    vex: { wibble: ['Zed'], 'plink.amount': [9], glim: [true] },
    omni: { wibble: ['Frob', 'Zed'], 'plink.amount': [0, 3, 9], zing: ['k'] },
  };
  expect('the raw map', f.raw, RAW);

  const LABELS: LabelsMap = {
    zorb: {
      wibble: { label: 'Wibble', options: { Frob: 'Frob', Zed: 'Zed' } },
      'plink.amount': { label: 'Plink amount', options: { 0: '0', 3: 'Three' } },
      quux: { label: 'Quux control', options: { a: 'Alpha', b: 'B' } },
      'plomb.min': { label: 'Plomb min', options: { 1: '1', 2: '2' } },
      tags: { label: 'Tags', options: { x: 'X', y: 'Y' } },
    },
    vex: {
      wibble: { label: 'Wibble', options: { Zed: 'Zed' } },
      'plink.amount': { label: 'Plink amount', options: { 9: '9' } },
      glim: { label: 'Glim', options: { true: 'Glim on' } },
    },
    omni: {
      wibble: { label: 'Wibble', options: { Frob: 'Frob', Zed: 'Zed' } },
      'plink.amount': { label: 'Plink amount', options: { 0: '0', 3: 'Three', 9: '9' } },
      zing: { label: 'Zing', options: { k: 'K' } },
    },
  };
  expect('the labels map (a blank curated text is ignored, a number and true/false are options)', f.labels, LABELS);
  expect(
    'rows that name nothing, or differ by a capital, change nothing',
    buildLabelsMap(f.raw, [...f.curated, { field: 'nowhere', text: 'N' }, { field: 'quux', value: 'zzz', text: 'Z' }, { field: 'quux', value: 'B', text: 'Bee' }]),
    LABELS,
  );

  const SORT_MAP: SortMap = { zorb: ['plink.amount', 'blorp', 'plomb.min', 'heft'], vex: ['plink.amount', 'blorp'], omni: ['plink.amount', 'blorp', 'heft'] };
  expect('the sort fields', sortFieldsOf(['plink.amount', 'blorp'], { zorb: ['plomb.min', 'heft'], vex: [], omni: ['heft'] }), SORT_MAP);
  expect('a sort field that is also an always-on sort is listed once', sortFieldsOf(['a'], { s: ['a', 'b'] }), { s: ['a', 'b'] });
  expect('the sort names (a sort takes its field\'s control-name row)', f.sortNames, {
    zorb: { 'plink.amount': 'Plink amount', blorp: 'Blorp', 'plomb.min': 'Plomb min', heft: 'Heaviness' },
    vex: { 'plink.amount': 'Plink amount', blorp: 'Blorp' },
    omni: { 'plink.amount': 'Plink amount', blorp: 'Blorp', heft: 'Heaviness' },
  });

  expect('the Studio list', f.list, [
    {
      slice: 'zorb',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
        { field: 'plink.amount', label: 'Plink amount', options: [{ value: '0', text: '0' }, { value: '3', text: '3' }] },
        { field: 'quux', label: 'Quux', options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }] },
        { field: 'plomb.min', label: 'Plomb min', options: [{ value: '1', text: '1' }, { value: '2', text: '2' }] },
        { field: 'tags', label: 'Tags', options: [{ value: 'x', text: 'X' }, { value: 'y', text: 'Y' }] },
      ],
      sorts: [{ field: 'plink.amount', label: 'Plink amount' }, { field: 'blorp', label: 'Blorp' }, { field: 'plomb.min', label: 'Plomb min' }, { field: 'heft', label: 'Heft' }],
    },
    {
      slice: 'vex',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Zed', text: 'Zed' }] },
        { field: 'plink.amount', label: 'Plink amount', options: [{ value: '9', text: '9' }] },
        { field: 'glim', label: 'Glim', options: [{ value: 'true', text: 'Yes' }] },
      ],
      sorts: [{ field: 'plink.amount', label: 'Plink amount' }, { field: 'blorp', label: 'Blorp' }],
    },
    {
      slice: 'omni',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
        { field: 'plink.amount', label: 'Plink amount', options: [{ value: '0', text: '0' }, { value: '3', text: '3' }, { value: '9', text: '9' }] },
        { field: 'zing', label: 'Zing', options: [{ value: 'k', text: 'K' }] },
      ],
      sorts: [{ field: 'plink.amount', label: 'Plink amount' }, { field: 'blorp', label: 'Blorp' }, { field: 'heft', label: 'Heft' }],
    },
  ]);

  // The slicing: a product is in a slice at the root or anywhere below it, and may be in two; a slug must be exactly one root.
  const stock: Product[] = [
    { _id: 's1', catalogueLocationKeys: ['c2'] }, { _id: 's2', catalogueLocationKeys: ['r1'] }, { _id: 's3', catalogueLocationKeys: ['r2'] },
    { _id: 's4', catalogueLocationKeys: ['r3'] }, { _id: 's5', catalogueLocationKeys: [] }, { _id: 's6' }, { _id: 's7', catalogueLocationKeys: ['c1', 'r2'] },
  ];
  const ids = (slug: string) => sliceByCatalogue(TREE, stock, slug).map((p) => p._id);
  expect('the slice zorb', ids('zorb'), ['s1', 's2', 's7']);
  expect('the slice vex', ids('vex'), ['s3', 's7']);
  for (const [what, items, slug] of [['no root', TREE, 'nope'], ['two roots', [...TREE, { _id: 'r9', slug: 'vex' }], 'vex'], ['a slug that is not a root', TREE, 'deep']] as const) {
    if (!threw(() => sliceByCatalogue([...items], stock, slug))) bad.push(`the slicing did not stop on ${what}`);
  }
  const odd = { ...alien().products[0], filterAttributes: { quux: { a: 1 } } };
  if (!threw(() => buildRawMap(f.picklist, { zorb: [odd], vex: [], omni: [odd] }))) bad.push('an object value did not stop the raw map');

  // The read path: the stored query's result in real format (the picklist document keeps camelCase list names) through the mapping and the use case.
  // accessories has an empty list, sortAudioElectronics is absent, quux is picked for all products only (accessories does not pick it), q4 is in no slice.
  const result = {
    picklist: {
      _id: 'filterPicklist', _type: 'filterPicklist', alwaysOn: ['wibble'], sortAlwaysOn: ['blorp'],
      headphones: ['quux'], audioElectronics: ['tags'], accessories: [], allProducts: ['quux'],
      sortHeadphones: ['quux'], sortAccessories: [], sortAllProducts: ['tags'],
    },
    items: [{ _id: 'h', slug: 'headphones' }, { _id: 'h1', slug: 'zorb', parent: 'h' }, { _id: 'a', slug: 'audio-electronics' }, { _id: 'x', slug: 'accessories' }],
    products: [
      { _id: 'q1', wibble: 'Frob', filterAttributes: { quux: 'b', tags: ['y'] }, catalogueLocationKeys: ['h1'] },
      { _id: 'q2', wibble: 'Zed', filterAttributes: { quux: 'a', tags: ['x'] }, catalogueLocationKeys: ['a'] },
      { _id: 'q3', wibble: 'Frob', filterAttributes: { quux: 'c' }, catalogueLocationKeys: ['x'] },
      { _id: 'q4', wibble: 'Nope', filterAttributes: { quux: 'z' }, catalogueLocationKeys: [] },
    ],
  };
  expect('the read path', await getControlLabels({ fetchOptionMapData: async () => toOptionMapData(result) }), [
    {
      slice: 'headphones',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }] },
        { field: 'quux', label: 'Quux', options: [{ value: 'b', text: 'B' }] },
      ],
      sorts: [{ field: 'blorp', label: 'Blorp' }, { field: 'quux', label: 'Quux' }],
    },
    {
      slice: 'audio-electronics',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Zed', text: 'Zed' }] },
        { field: 'tags', label: 'Tags', options: [{ value: 'x', text: 'X' }] },
      ],
      sorts: [{ field: 'blorp', label: 'Blorp' }],
    },
    { slice: 'accessories', controls: [{ field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }] }], sorts: [{ field: 'blorp', label: 'Blorp' }] },
    {
      slice: 'all-products',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
        { field: 'quux', label: 'Quux', options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }, { value: 'c', text: 'C' }] },
      ],
      sorts: [{ field: 'blorp', label: 'Blorp' }, { field: 'tags', label: 'Tags' }],
    },
  ]);
  const none = await getControlLabels({ fetchOptionMapData: async () => toOptionMapData({ ...result, picklist: null }) });
  expect('a missing picklist document gives no controls and no sorts', none.map((s) => [s.slice, s.controls.length, s.sorts.length]), [
    ['headphones', 0, 0], ['audio-electronics', 0, 0], ['accessories', 0, 0], ['all-products', 0, 0],
  ]);

  // The row writer: the only way the Studio changes the stored rows.
  const rows: LabelRow[] = [{ _key: 'k1', _type: 'label', field: 'a', text: 'A1' }, { _key: 'k2', _type: 'label', field: 'a', value: 'x', text: 'AX' }];
  const added = setRowText(rows, 'b', '', 'B');
  expect('typing at a new line adds one row and keeps the others', [added.slice(0, 2), added.length, { ...added[2], _key: !!added[2]._key }], [rows, 3, { _key: true, _type: 'label', field: 'b', text: 'B' }]);
  expect('typing at an option replaces its row and keeps its key', setRowText(rows, 'a', 'x', 'AX2'), [rows[0], { _key: 'k2', _type: 'label', field: 'a', value: 'x', text: 'AX2' }]);
  expect('a blank text removes the line and only that line', [setRowText(rows, 'a', '', '  '), setRowText(rows, 'a', 'x', '')], [[rows[1]], [rows[0]]]);
  expect('emptying a line that has no row changes nothing', setRowText(rows, 'z', '', ''), rows);
  expect('a line stored twice collapses to one row', setRowText([...rows, { _key: 'k3', _type: 'label', field: 'a', text: 'A3' }], 'a', '', 'A4'), [{ _key: 'k1', _type: 'label', field: 'a', text: 'A4' }, rows[1]]);

  return bad;
}

// The proof can say no: clean fixtures give yes on questions 1-9, and each planted break makes exactly its questions say NO.
function proofCanFail(): string[] {
  const problems: string[] = [];
  const noes = (f: Facts) => Object.entries(judge(f)).filter(([, found]) => found.length).map(([id]) => Number(id));
  const clean = noes(derive(alien()));
  if (clean.length) problems.push(`clean fixtures gave NO on question ${clean.join(', ')}`);
  const inputPlants: [string, (i: Inputs) => void, number[]][] = [
    ['a stored pick that is not offered', (i) => { i.doc.zorb = [...(i.doc.zorb as string[]), 'frob']; }, [1]],
    ['a blank stored pick', (i) => { i.doc.vex = ['glim', '']; }, [1, 8]],
    ['an offered field no product holds', (i) => { i.scopes[0].offer = [...i.scopes[0].offer, 'frob']; }, [2]],
    ['a field offered twice', (i) => { i.scopes[1].offer = ['glim', 'glim']; }, [2]],
    ['an always-on field missing on a product', (i) => { delete i.products[1].wibble; }, [3]],
    ['an offered sort field that is a list on a product', (i) => { i.products[0].filterAttributes!.heft = [4, 5]; }, [4]],
    ['a product in no slice', (i) => { i.products.push({ _id: 'p9', wibble: 'Z', blorp: 'n9', plink: { amount: 1 }, filterAttributes: {}, catalogueLocationKeys: ['r3'] }); }, [5]],
    ['a curated row twice', (i) => { i.curated.push({ ...i.curated[1] }); }, [6]],
  ];
  for (const [what, plant, want] of inputPlants) {
    const i = alien();
    plant(i);
    const got = noes(derive(i));
    if (got.join() !== want.join()) problems.push(`"${what}": wanted NO on [${want}], got [${got}]`);
  }
  const derivedPlants: [string, (f: Facts) => void, number[]][] = [
    ['a value dropped from the raw map', (f) => { f.raw.zorb.quux = ['a']; f.labels = buildLabelsMap(f.raw, f.curated); f.list = listControlLabels(f.raw, buildSortLabels(f.sortMap, [])); }, [7]],
    ['a blank text', (f) => { f.labels.zorb.quux.options.a = '  '; }, [8]],
    ['a control dropped from the list', (f) => { f.list[0].controls.pop(); }, [9]],
    ['a sort dropped from the list', (f) => { f.list[0].sorts.pop(); }, [9]],
  ];
  for (const [what, plant, want] of derivedPlants) {
    const f = derive(alien());
    plant(f);
    const got = noes(f);
    if (got.join() !== want.join()) problems.push(`"${what}": wanted NO on [${want}], got [${got}]`);
  }
  return problems;
}

// The one read: the shop's own query, the product names (the shop's query does not carry them) and the curated rows, in ONE request.
async function read(): Promise<{ result: any; inputs: Inputs }> {
  const env = process.env;
  const published = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';
  const query = `{ "map": ${OPTION_MAP_QUERY}, "names": *[_type == "product" && ${published}]{ _id, name }, "rows": *[_id == "filterLabels"][0].labels }`;
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { map, names, rows } = (await res.json()).result ?? {};
  if (!map?.products?.length) throw new Error('read returned no products');
  const nameOf = new Map<string, unknown>((names ?? []).map((n: { _id: string; name: unknown }) => [n._id, n.name]));
  const products: Product[] = map.products.map((p: Product) => ({ ...p, name: nameOf.get(p._id) }));
  return { result: map, inputs: { scopes: SCOPES, doc: map.picklist ?? {}, products, items: map.items ?? [], curated: rows ?? [] } };
}

function report(f: Facts, found: Record<number, string[]>) {
  console.log(f.scopes.map((s) => `${s.slug}: ${f.slices[s.slug].length} products, ${Object.keys(f.raw[s.slug]).length} controls, ${Object.values(f.raw[s.slug]).flat().length} options, ${f.sortMap[s.slug].length} sorts`).join('\n'));
  console.log(`${f.products.length} published products; ${f.curated.length} curated rows\n`);
  const ids = Object.keys(QUESTIONS).map(Number);
  ids.forEach((id) => {
    if (!found[id].length) return;
    console.log(`${id}. ${QUESTIONS[id]}`);
    found[id].slice(0, 12).forEach((line) => console.log(`  ${line}`));
    if (found[id].length > 12) console.log(`  (${found[id].length - 12} more)`);
    console.log('');
  });
  ids.forEach((id) => console.log(`${id}. ${QUESTIONS[id]}: ${found[id].length ? `NO, ${found[id].length} found` : 'yes'}`));
  const bad = ids.some((id) => found[id].length);
  console.log(bad ? '\nRESULT: NO' : '\nRESULT: PASS');
  return bad ? 1 : 0;
}

try {
  const broken = proofCanFail();
  if (broken.length) throw new Error(`the proof itself is broken:\n  ${broken.join('\n  ')}`);
  console.log('self-check: questions 1-9 are yes on clean fixtures and each says NO on its planted break.\n');
  const { result, inputs } = await read();
  const live = derive(inputs, await getControlLabels({ fetchOptionMapData: async () => toOptionMapData(result) }));
  const found = judge(live);
  found[10] = await fixtures();
  process.exitCode = report(live, found);
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exitCode = 2;
}
