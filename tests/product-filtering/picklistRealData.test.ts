// Picklist proof: is the picklist exactly what it should be? PASS or NO.
//
// The picklist is one CMS document and the one source of every field that becomes a control or a sort. Studio shows it in two groups:
//   FILTERS  alwaysOn: the fields that are controls in every scope (brand, price, stock). Not a choice: read-only in Studio.
//            four lists, one per slice and one for all products (the /products page): the owner's picks in the owner's order. Studio offers a closed list per slice, signed by the owner, and the three together for all products.
//   SORTING  sortAlwaysOn: the sorts every scope has (price, name). Not a choice: read-only in Studio.
//            four lists, one per scope: the owner's sort picks. Studio offers a closed list per slice, signed by the owner: the fields that hold one plain number per product. All products offers the three together.
// Ten questions, all yes means done:
//   1. every offered field, filter or sort, has a value on a product of its scope (all products: on a product of any slice)
//   2. the offer and the stored always-on fields, filter and sort, are exactly the signed ones (SIGNED below, written by hand)
//   3. every stored pick, filter or sort, is offered by its list, once
//   4. every always-on field, filter or sort, has a value on every product
//   5. Studio shows both always-on lists read-only, and no always-on field is offered or stored as a pick of its own group
//   6. one picklist document, holding only the two always-on lists and the eight lists
//   7. the owner can reorder each list in Studio
//   8. the all-products filter list and every sort list start empty: the schema gives them no initial picks
//   9. every offered sort field is a plain number on each product of its scope that holds it (never a list, text or object)
//   10. Studio keeps sorting apart: the sort lists and sortAlwaysOn sit in the Sorting group, the filter lists and alwaysOn in the Filters group
//
// A value is anything but: missing, null, blank text, an empty list, an empty object.
// A product is in a slice when its catalogueLocationKeys hold the slice's catalogue item or one below it (live catalogueItem tree).
// The offer is read from the real picklist type (schema/filterPicklistType.ts, the object studio/schema.ts registers), not copied. Reads only.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/picklistRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the self-proof failed.
//
// FLOW  selfProof -> read -> sliceProducts -> judge -> report

import { readFileSync } from 'node:fs';
// Not '@/studio/schema': that file reaches the Filter labels input (a .tsx file), which node cannot load. The type below is the object Studio registers;
// the registration itself is checked on the text of studio/schema.ts in studioFacts.
import { filterPicklistType } from '@/features/product-filtering/schema/filterPicklistType';

type Product = { _id: string; catalogueLocationKeys?: string[]; filterAttributes?: Record<string, unknown>; [key: string]: unknown };
type StudioField = { values: string[]; reorderable: boolean; startsEmpty: boolean; readOnly: boolean; group?: string };
type Facts = {
  products: Product[];
  slices: Record<string, Product[]>;
  studio: { fields: Record<string, StudioField> };
  docs: Record<string, unknown>[];
};
// always / picks: the filters (alwaysOn and the four lists); sortAlways / sortPicks: the sorting (sortAlwaysOn and the four sort lists). Both keyed by scope.
type Signed = { always: string[]; picks: Record<string, string[]>; sortAlways: string[]; sortPicks: Record<string, string[]> };

// Signed by Jan, 2026-10-31 (filters) and 2026-11-01 (sorting). Adding or cutting a field means changing it here and in the schema (or the document) together, or question 2 says NO.
const SIGNED: Signed = {
  always: ['brand', 'price_data.unit_amount', 'stock'],
  picks: {
    headphones: [
      'wearingStyle', 'acousticDesign', 'connectivity', 'portable', 'soundSignature', 'impedanceOhms', 'sensitivityDbMw',
      'freqResponseHz.min', 'freqResponseHz.max', 'microphone', 'cableTermination', 'detachableCable', 'cableLengthM',
      'foldable', 'ipxRating', 'bluetoothCodecs', 'anc', 'batteryLifeHours.ancOff', 'batteryLifeHours.ancOn', 'driverType',
    ],
    audioElectronics: [
      'deviceType', 'formFactor', 'deviceConnectivity', 'inputs', 'outputs', 'amplification', 'balancedOutput',
      'powerOutputPerChannelW', 'channelCount', 'phonoStageBuiltIn', 'trigger12v', 'remoteControlIncluded',
      'maxSampleRateBitDepth', 'dsdSupport', 'dacChipsetFamily', 'hiResCertification', 'streamingPlatformSupport',
      'voiceAssistant', 'multiroomSupport', 'rackMountable19', 'condition',
    ],
    accessories: [
      'accessoryType', 'compatibleProductType', 'cableFunction', 'connectorTermination', 'lengthM', 'conductorMaterial',
      'balancedUnbalanced', 'partType', 'material', 'weightCapacityKg', 'adapterFunction',
    ],
  },
  sortAlways: ['price_data.unit_amount', 'name'],
  sortPicks: {
    headphones: [
      'impedanceOhms', 'sensitivityDbMw', 'freqResponseHz.min', 'freqResponseHz.max', 'cableLengthM',
      'batteryLifeHours.ancOff', 'batteryLifeHours.ancOn',
    ],
    audioElectronics: ['powerOutputPerChannelW'],
    accessories: ['weightCapacityKg'],
  },
};

// All products offers the three slice lists together, once each (decided 2026-11-01). It is written from the hand-written lists above, so the sign-off stays one fact.
SIGNED.picks.allProducts = Object.values(SIGNED.picks).flat();
SIGNED.sortPicks.allProducts = Object.values(SIGNED.sortPicks).flat();

// The slice list name in the picklist document -> the slice's slug in the catalogue.
const CATALOGUE_SLUG: Record<string, string> = { headphones: 'headphones', audioElectronics: 'audio-electronics', accessories: 'accessories' };

const QUESTIONS = [
  'every offered field has a value on a product of its scope',
  'the offer and the stored always-on fields are exactly the signed ones',
  'every stored pick is offered by its list, once',
  'every always-on field has a value on every product',
  'Studio shows both always-on lists read-only, and no always-on field is offered or stored as a pick of its own group',
  'one picklist document, holding only the two always-on lists and the eight lists',
  'the owner can reorder each list in Studio',
  'the all-products filter list and every sort list start empty: the schema gives them no initial picks',
  'every offered sort field is a plain number on each product of its scope that holds it',
  'Studio keeps sorting apart: the sort lists in the Sorting group, the filter lists in the Filters group',
];

const SYSTEM_KEYS = new Set(['_id', '_type', '_rev', '_createdAt', '_updatedAt', '_system']);

const hasValue = (v: unknown): boolean =>
  v !== undefined &&
  v !== null &&
  !(typeof v === 'string' && !v.trim()) &&
  !(Array.isArray(v) && v.length === 0) &&
  !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v as object).length === 0);

const at = (object: unknown, path: string): unknown => path.split('.').reduce<any>((value, key) => value?.[key], object);
const repeated = (list: string[]) => [...new Set(list.filter((x, i) => list.indexOf(x) !== i))];
const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

// The lists of the document: a filter list is named by its scope ('headphones'), a sort list by 'sort' and its scope ('sortHeadphones').
const sortField = (scope: string) => `sort${scope[0].toUpperCase()}${scope.slice(1)}`;
type List = { kind: 'filter' | 'sort'; scope: string; field: string; want: string[] };
const listsOf = (s: Signed): List[] => [
  ...Object.entries(s.picks).map(([scope, want]): List => ({ kind: 'filter', scope, field: scope, want })),
  ...Object.entries(s.sortPicks).map(([scope, want]): List => ({ kind: 'sort', scope, field: sortField(scope), want })),
];
const alwaysOf = (s: Signed) => [
  { kind: 'filter' as const, field: 'alwaysOn', want: s.always },
  { kind: 'sort' as const, field: 'sortAlwaysOn', want: s.sortAlways },
];
const groupOf = (kind: 'filter' | 'sort') => (kind === 'sort' ? 'sorting' : 'filters');

// 4. judge: the findings per question, in order. An empty list is a yes.
export function judge(f: Facts, signed: Signed = SIGNED): string[][] {
  const doc = f.docs.find((d) => d._id === 'filterPicklist');
  const stored = (name: string): string[] => strings(doc?.[name]);
  const field = (name: string): StudioField | undefined => f.studio.fields[name];
  const offered = (name: string): string[] => field(name)?.values ?? [];
  const found: string[][] = QUESTIONS.map(() => []);
  const lists = listsOf(signed);
  const always = alwaysOf(signed);
  const known = [...lists.map((l) => l.field), ...always.map((a) => a.field)];

  for (const l of lists) {
    for (const path of offered(l.field)) {
      if (!f.slices[l.scope].some((p) => hasValue(at(p.filterAttributes, path)))) found[0].push(`${l.field}: ${path}`);
    }

    const extra = offered(l.field).filter((x) => !l.want.includes(x));
    const missing = l.want.filter((x) => !offered(l.field).includes(x));
    const twice = repeated(offered(l.field));
    if (extra.length) found[1].push(`${l.field}: offered, not signed: ${extra.join(', ')}`);
    if (missing.length) found[1].push(`${l.field}: signed, not offered: ${missing.join(', ')}`);
    if (twice.length) found[1].push(`${l.field}: offered twice: ${twice.join(', ')}`);

    for (const pick of stored(l.field)) if (!offered(l.field).includes(pick)) found[2].push(`${l.field}: ${pick} is stored but not offered`);
    for (const pick of repeated(stored(l.field))) found[2].push(`${l.field}: ${pick} is stored twice`);

    if (!field(l.field)?.reorderable) found[6].push(`${l.field}: cannot be reordered in Studio`);

    if (l.kind === 'sort' || l.scope === 'allProducts') {
      if (!field(l.field)) found[7].push(`${l.field}: Studio has no such list`);
      else if (!field(l.field)!.startsEmpty) found[7].push(`${l.field}: the schema gives it initial picks`);
    }

    if (l.kind === 'sort') {
      for (const path of offered(l.field)) {
        const bad = f.slices[l.scope].filter((p) => {
          const v = at(p.filterAttributes, path);
          return hasValue(v) && !(typeof v === 'number' && Number.isFinite(v));
        });
        if (bad.length) found[8].push(`${l.field}: ${path} is not a plain number on ${bad.length} products, first: ${bad[0]._id}`);
      }
    }

    if (field(l.field) && field(l.field)!.group !== groupOf(l.kind)) found[9].push(`${l.field}: is in the group ${field(l.field)!.group ?? 'none'}, wanted ${groupOf(l.kind)}`);
  }
  for (const name of Object.keys(f.studio.fields)) if (!known.includes(name)) found[1].push(`Studio has a field that is not signed: ${name}`);

  for (const a of always) {
    const have = stored(a.field);
    if ([...have].sort().join('; ') !== [...a.want].sort().join('; ')) found[1].push(`${a.field} is [${have.join(', ')}], signed [${a.want.join(', ')}]`);

    for (const path of have) {
      const lacking = f.products.filter((p) => !hasValue(at(p, path)));
      if (lacking.length) found[3].push(`${a.field}: ${path}: ${lacking.length} of ${f.products.length} products lack it, first: ${lacking[0]._id}`);
    }

    if (!field(a.field)?.readOnly) found[4].push(`Studio does not show ${a.field} read-only`);
    for (const path of have) {
      for (const l of lists.filter((x) => x.kind === a.kind)) {
        if (offered(l.field).includes(path)) found[4].push(`${l.field}: ${path} is offered`);
        if (stored(l.field).includes(path)) found[4].push(`${l.field}: ${path} is stored as a pick`);
      }
    }

    if (field(a.field) && field(a.field)!.group !== groupOf(a.kind)) found[9].push(`${a.field}: is in the group ${field(a.field)!.group ?? 'none'}, wanted ${groupOf(a.kind)}`);
  }

  if (f.docs.length !== 1 || !doc) found[5].push(`${f.docs.length} published documents, ids: ${f.docs.map((d) => d._id).join(', ') || 'none'}`);
  for (const key of Object.keys(doc ?? {})) if (!SYSTEM_KEYS.has(key) && !known.includes(key)) found[5].push(`the document holds ${key}`);
  return found;
}

// 1. selfProof: a proof that cannot say no proves nothing.
// Fake slices and products in real format with alien names. Each planted break must make exactly its questions say NO, clean data none.
function selfProof() {
  const alien: Signed = {
    always: ['wibble', 'plink.amount'],
    picks: { zorb: ['quux', 'plomb.min'], vex: ['glim'], allProducts: ['quux', 'plomb.min', 'glim'] },
    sortAlways: ['plink.amount', 'blorp'],
    sortPicks: { zorb: ['heft'], vex: ['gram'], allProducts: ['heft', 'gram'] },
  };
  const fld = (values: string[], group: string, more: Partial<StudioField> = {}): StudioField => ({ values, reorderable: values.length > 0, startsEmpty: true, readOnly: false, group, ...more });
  const clean = (): Facts => {
    const p1: Product = { _id: 'p1', wibble: { _ref: 'x' }, blorp: 'n1', plink: { amount: 3 }, filterAttributes: { quux: 'a', plomb: { min: 1 }, heft: 4 } };
    const p2: Product = { _id: 'p2', wibble: { _ref: 'y' }, blorp: 'n2', plink: { amount: 0 }, filterAttributes: { quux: 'b', plomb: { min: 2 }, heft: 6 } };
    const p3: Product = { _id: 'p3', wibble: { _ref: 'z' }, blorp: 'n3', plink: { amount: 9 }, filterAttributes: { glim: true, gram: 7 } };
    return {
      products: [p1, p2, p3],
      slices: { zorb: [p1, p2], vex: [p3], allProducts: [p1, p2, p3] },
      studio: {
        fields: {
          alwaysOn: fld([], 'filters', { readOnly: true }),
          zorb: fld(['quux', 'plomb.min'], 'filters'),
          vex: fld(['glim'], 'filters'),
          allProducts: fld(['quux', 'plomb.min', 'glim'], 'filters'),
          sortAlwaysOn: fld([], 'sorting', { readOnly: true }),
          sortZorb: fld(['heft'], 'sorting'),
          sortVex: fld(['gram'], 'sorting'),
          sortAllProducts: fld(['heft', 'gram'], 'sorting'),
        },
      },
      docs: [{ _id: 'filterPicklist', _type: 'filterPicklist', _rev: 'r', alwaysOn: ['wibble', 'plink.amount'], sortAlwaysOn: ['plink.amount', 'blorp'], zorb: ['quux'], vex: [] }],
    };
  };
  const doc = (f: Facts) => f.docs[0];
  const studio = (f: Facts) => f.studio.fields;
  const plants: [string, (f: Facts) => void, number[]][] = [
    ['an offered field no product holds', (f) => { f.slices.zorb.forEach((p) => { p.filterAttributes!.quux = null; }); }, [1]],
    ['an offered field is unsigned', (f) => { studio(f).zorb.values.push('frob'); f.slices.zorb[0].filterAttributes!.frob = 'z'; }, [2]],
    ['a signed field is not offered', (f) => { studio(f).zorb.values = ['quux']; }, [2]],
    ['a field offered twice', (f) => { studio(f).zorb.values.push('quux'); }, [2]],
    ['a stored always-on list that differs from the signed', (f) => { doc(f).alwaysOn = ['wibble']; }, [2]],
    ['a stored pick is not offered', (f) => { (doc(f).zorb as string[]).push('frob'); }, [3]],
    ['a pick stored twice', (f) => { doc(f).zorb = ['quux', 'quux']; }, [3]],
    ['an always-on field missing on a product', (f) => { delete f.products[1].wibble; }, [4]],
    ['an always-on field with a null value', (f) => { f.products[0].plink = { amount: null }; }, [4]],
    ['Studio does not show the always-on list read-only', (f) => { studio(f).alwaysOn.readOnly = false; }, [5]],
    ['an always-on field stored as a pick', (f) => { (doc(f).zorb as string[]).push('wibble'); }, [3, 5]],
    ['an always-on field offered', (f) => { studio(f).vex.values.push('wibble'); }, [1, 2, 5]],
    ['Studio lacks a slice list', (f) => { delete studio(f).vex; }, [2, 7]],
    ['a slice list drawn as checkboxes', (f) => { studio(f).zorb.reorderable = false; }, [7]],
    ['a second document', (f) => { f.docs.push({ _id: 'other', _type: 'filterPicklist' }); }, [6]],
    ['an extra field in the document', (f) => { doc(f).zorbExtra = []; }, [6]],
    ['no document', (f) => { f.docs = []; }, [2, 6]],
    ['Studio lacks the all-products list', (f) => { delete studio(f).allProducts; }, [2, 7, 8]],
    ['the all-products list starts with picks', (f) => { studio(f).allProducts.startsEmpty = false; }, [8]],
    ['all products offers a field no slice offers', (f) => { studio(f).allProducts.values.push('frob'); f.slices.zorb[0].filterAttributes!.frob = 'z'; }, [2]],
    ['all products leaves out a signed field', (f) => { studio(f).allProducts.values = ['quux', 'plomb.min']; }, [2]],
    ['a stored all-products pick is not offered', (f) => { doc(f).allProducts = ['frob']; }, [3]],
    // The sorting family.
    ['a stored sort always-on list that differs from the signed', (f) => { doc(f).sortAlwaysOn = ['plink.amount']; }, [2]],
    ['a sort always-on field missing on a product', (f) => { delete f.products[1].blorp; }, [4]],
    ['Studio does not show the sort always-on list read-only', (f) => { studio(f).sortAlwaysOn.readOnly = false; }, [5]],
    ['a sort always-on field offered as a sort pick', (f) => { studio(f).sortZorb.values.push('blorp'); }, [1, 2, 5]],
    ['a sort always-on field stored as a sort pick', (f) => { doc(f).sortZorb = ['blorp']; }, [3, 5]],
    ['a stored sort pick is not offered', (f) => { doc(f).sortZorb = ['frob']; }, [3]],
    ['a sort pick stored twice', (f) => { doc(f).sortZorb = ['heft', 'heft']; }, [3]],
    ['an offered sort field no product holds', (f) => { f.slices.zorb.forEach((p) => { p.filterAttributes!.heft = null; }); }, [1]],
    ['an offered sort field that is a list on a product', (f) => { f.slices.zorb[0].filterAttributes!.heft = [4, 5]; }, [9]],
    ['an offered sort field that is text on a product', (f) => { f.slices.zorb[1].filterAttributes!.heft = 'six'; }, [9]],
    ['an unsigned sort field offered', (f) => { studio(f).sortVex.values.push('frob'); f.slices.vex[0].filterAttributes!.frob = 5; }, [2]],
    ['a signed sort field is not offered', (f) => { studio(f).sortZorb.values = []; }, [2]],
    ['all products leaves out a signed sort field', (f) => { studio(f).sortAllProducts.values = ['heft']; }, [2]],
    ['a stored all-products sort pick is not offered', (f) => { doc(f).sortAllProducts = ['frob']; }, [3]],
    ['Studio lacks a sort list', (f) => { delete studio(f).sortVex; }, [2, 7, 8]],
    ['a sort list drawn as checkboxes', (f) => { studio(f).sortZorb.reorderable = false; }, [7]],
    ['a sort list starts with picks', (f) => { studio(f).sortZorb.startsEmpty = false; }, [8]],
    ['a sort list in the Filters group', (f) => { studio(f).sortZorb.group = 'filters'; }, [10]],
    ['a filter list in the Sorting group', (f) => { studio(f).zorb.group = 'sorting'; }, [10]],
    ['the sort always-on list in the Filters group', (f) => { studio(f).sortAlwaysOn.group = 'filters'; }, [10]],
    ['the filter always-on list in the Sorting group', (f) => { studio(f).alwaysOn.group = 'sorting'; }, [10]],
  ];
  const noes = (f: Facts) => judge(f, alien).flatMap((found, i) => (found.length ? [i + 1] : []));
  const base = noes(clean());
  if (base.length) throw new Error(`self-proof failed: clean data gave NO on question ${base.join(', ')}`);
  for (const [what, plant, want] of plants) {
    const f = clean();
    plant(f);
    const got = noes(f);
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
}

// 2. read: one request is one snapshot, from api.sanity.io (not the CDN) so nothing is stale. Published only.
// Zero products is no verdict: a wrong dataset would pass.
async function read() {
  const env = process.env;
  const published = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';
  const query = `{
    "products": *[_type == "product" && ${published}]{ _id, name, brand, price_data, stock, filterAttributes, catalogueLocationKeys },
    "items": *[_type == "catalogueItem" && ${published}]{ _id, "slug": slug.current, "parent": parent._ref },
    "docs": *[_type == "filterPicklist" && ${published}]
  }`;
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { result } = await res.json();
  if (!result?.products?.length) throw new Error('read returned no products');
  return result as { products: Product[]; items: { _id: string; slug?: string; parent?: string }[]; docs: Record<string, unknown>[] };
}

// 3. sliceProducts: the products at the slice's catalogue root or anywhere below it.
function sliceProducts(items: { _id: string; slug?: string; parent?: string }[], products: Product[], slug: string): Product[] {
  const roots = items.filter((i) => i.slug === slug && !i.parent);
  if (roots.length !== 1) throw new Error(`catalogue root "${slug}": found ${roots.length}, wanted 1`);
  const ids = new Set([roots[0]._id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const i of items) if (i.parent && ids.has(i.parent) && !ids.has(i._id)) { ids.add(i._id); grew = true; }
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k)));
}

// What the real picklist type offers, field by field. A list is reorderable when Sanity draws it as sortable rows: its choices sit on the items,
// not on the list itself (that draws checkboxes), and sorting is not turned off. (Read from Sanity's own array input resolver.)
function studioFacts(): Facts['studio'] {
  const type: any = filterPicklistType;
  if (!/^\s*filterPicklistType,/m.test(readFileSync('studio/schema.ts', 'utf8'))) throw new Error('Studio does not register the filterPicklist type');
  const fields: Facts['studio']['fields'] = {};
  for (const f of type.fields) {
    const itemChoices = f.of?.[0]?.options?.list;
    fields[f.name] = {
      values: ((f.options?.list ?? itemChoices ?? []) as any[]).map((o) => o.value),
      reorderable: !f.options?.list && Array.isArray(itemChoices) && itemChoices.length > 0 && f.options?.sortable !== false,
      startsEmpty: f.initialValue === undefined && type.initialValue === undefined,
      readOnly: f.readOnly === true,
      group: f.group,
    };
  }
  return { fields };
}

// 5. report: the screen text and the exit code.
function report(f: Facts, found: string[][]) {
  console.log(`${f.products.length} published products; ${Object.entries(f.slices).map(([n, p]) => `${n} ${p.length}`).join(', ')}\n`);
  QUESTIONS.forEach((q, i) => {
    if (!found[i].length) return;
    console.log(`${i + 1}. ${q}`);
    found[i].forEach((line) => console.log(`  ${line}`));
    console.log('');
  });
  QUESTIONS.forEach((q, i) => console.log(`${i + 1}. ${q}: ${found[i].length ? `NO, ${found[i].length} found` : 'yes'}`));
  const bad = found.some((x) => x.length);
  console.log(bad ? '\nRESULT: NO' : '\nRESULT: PASS');
  return bad ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: each question says NO where it must, and yes on clean data.\n');
  const { products, items, docs } = await read();
  const slices = Object.fromEntries(Object.entries(CATALOGUE_SLUG).map(([name, slug]) => [name, sliceProducts(items, products, slug)]));
  const inSlice = new Set(Object.values(slices).flat().map((p) => p._id));
  slices.allProducts = products.filter((p) => inSlice.has(p._id));
  const facts: Facts = { products, slices, studio: studioFacts(), docs };
  process.exitCode = report(facts, judge(facts));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exitCode = 2;
}
