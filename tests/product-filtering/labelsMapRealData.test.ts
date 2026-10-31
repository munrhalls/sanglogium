// Option maps proof: are the raw map and the labels map exactly what they should be? PASS or NO.
//
// The raw map lists, per slice and per control, the distinct values the slice's products hold. The labels map gives each control
// and each option one text: the owner's curated one when there is one, else the automatic one. Only the curated rows are stored.
// Questions, all yes means done:
//   1. the raw map holds, for every control of a slice, exactly the distinct values the slice's products hold
//   3. the labels map has exactly the raw map's controls and options, each with a non-empty text
//   4. each text is the curated one when a non-empty row exists, else the automatic one
//
// A control is an always-on field or a pick of the slice, as the stored picklist says. A value is anything but: missing, null,
// blank text, an empty list. A product is in a slice when its catalogueLocationKeys hold the slice's catalogue item or one below it.
// Question 1 compares the real function with a second way to the same answer (walk every leaf of the products) on the live data.
// Reads only.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/labelsMapRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the self-proof failed.
//
// FLOW  selfProof -> read -> sliceProducts -> judge -> report

import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { autoControlLabel, autoOptionLabel, buildLabelsMap } from '@/features/product-filtering/core/rules/buildLabelsMap';
import type { CuratedLabel, LabelsMap, RawMap } from '@/features/product-filtering/core/types/optionMaps';

type Product = { _id: string; filterAttributes?: Record<string, unknown>; catalogueLocationKeys?: string[]; [key: string]: unknown };
type Item = { _id: string; slug?: string; parent?: string };
type Picklist = { alwaysOn: string[]; picks: Record<string, string[]> };
type Facts = { picklist: Picklist; slices: Record<string, Product[]>; raw: RawMap; curated: CuratedLabel[]; labels: LabelsMap };

// The slice list name in the picklist document -> the slice's slug in the catalogue.
const CATALOGUE_SLUG: Record<string, string> = { headphones: 'headphones', audioElectronics: 'audio-electronics', accessories: 'accessories' };

const QUESTIONS: Record<number, string> = {
  1: "the raw map holds, for every control of a slice, exactly the distinct values the slice's products hold",
  3: "the labels map has exactly the raw map's controls and options, each with a non-empty text",
  4: 'each text is the curated one when a non-empty row exists, else the automatic one',
};

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const filled = (x: unknown) => typeof x === 'string' && x.trim() !== '';

// The second way to the answer: walk every leaf of a product and collect the values per path, instead of looking a path up.
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

// 4. judge: the findings per question. An empty list is a yes.
export function judge(f: Facts): Record<number, string[]> {
  const q1: string[] = [];
  const q3: string[] = [];
  const q4: string[] = [];

  for (const [slice, picks] of Object.entries(f.picklist.picks)) {
    const have = f.raw[slice] ?? {};
    const product = held(f.slices[slice], (p) => p);
    const attributes = held(f.slices[slice], (p) => p.filterAttributes);
    const want = new Map<string, unknown[]>([
      ...f.picklist.alwaysOn.map((x): [string, unknown[]] => [x, product.get(x) ?? []]),
      ...picks.map((x): [string, unknown[]] => [x, attributes.get(x) ?? []]),
    ]);
    for (const path of Object.keys(have)) if (!want.has(path)) q1.push(`${slice}: ${path} is in the raw map but is not a control`);
    for (const [path, values] of want) {
      if (!(path in have)) { q1.push(`${slice}: ${path} is a control but is missing from the raw map`); continue; }
      const expected = [...new Set(values.map((x) => JSON.stringify(x)))];
      const got = have[path].map((x) => JSON.stringify(x));
      if (new Set(got).size !== got.length) q1.push(`${slice}: ${path} lists a value twice`);
      const missing = expected.filter((x) => !got.includes(x));
      const invented = got.filter((x) => !expected.includes(x));
      if (missing.length) q1.push(`${slice}: ${path} lacks ${missing.join(', ')}`);
      if (invented.length) q1.push(`${slice}: ${path} has ${invented.join(', ')}, which no product of the slice holds`);
    }
  }

  const wanted = (field: string, value: string, auto: string) =>
    f.curated.filter((r) => r.field === field && (r.value ?? '') === value && filled(r.text)).at(-1)?.text?.trim() ?? auto;
  for (const slice of Object.keys(f.labels)) if (!(slice in f.raw)) q3.push(`${slice}: labels for a slice the raw map lacks`);
  for (const [slice, controls] of Object.entries(f.raw)) {
    const have = f.labels[slice];
    if (!have) { q3.push(`${slice}: no labels`); continue; }
    for (const field of Object.keys(have)) if (!(field in controls)) q3.push(`${slice}: ${field} has labels but is not a control`);
    for (const [field, values] of Object.entries(controls)) {
      const c = have[field];
      if (!c) { q3.push(`${slice}: ${field} has no label`); continue; }
      const keys = values.map(String);
      if (!filled(c.label)) q3.push(`${slice}: ${field} has an empty name`);
      else if (c.label !== wanted(field, '', autoControlLabel(field))) q4.push(`${slice}: ${field} is named "${c.label}", wanted "${wanted(field, '', autoControlLabel(field))}"`);
      for (const k of Object.keys(c.options)) if (!keys.includes(k)) q3.push(`${slice}: ${field} has a text for ${k}, which is not an option`);
      values.forEach((v, i) => {
        const text = c.options[keys[i]];
        if (text === undefined) q3.push(`${slice}: ${field}: option ${keys[i]} has no text`);
        else if (!filled(text)) q3.push(`${slice}: ${field}: option ${keys[i]} has an empty text`);
        else if (text !== wanted(field, keys[i], autoOptionLabel(v))) q4.push(`${slice}: ${field}: option ${keys[i]} reads "${text}", wanted "${wanted(field, keys[i], autoOptionLabel(v))}"`);
      });
    }
  }
  return { 1: q1, 3: q3, 4: q4 };
}

// 1. selfProof: a proof that cannot say no proves nothing.
// Fake slices, products and rows in real format with alien names, holding the awkward cases: null, blank text, an empty list, a number,
// true/false. Each planted break must make exactly its questions say NO, clean data none.
function selfProof() {
  const picklist: Picklist = { alwaysOn: ['wibble', 'plink.amount'], picks: { zorb: ['quux', 'plomb.min', 'tags'], vex: ['glim'] } };
  const p1: Product = { _id: 'p1', wibble: 'Frob', plink: { amount: 3 }, filterAttributes: { quux: 'a', plomb: { min: 1 }, tags: ['x', 'y'] } };
  const p2: Product = { _id: 'p2', wibble: 'Frob', plink: { amount: 0 }, filterAttributes: { quux: 'b', plomb: { min: null }, tags: ['y'] } };
  const p3: Product = { _id: 'p3', wibble: 'Zed', plink: { amount: 9 }, filterAttributes: { glim: true } };
  const p4: Product = { _id: 'p4', wibble: 'Zed', plink: { amount: 3 }, filterAttributes: { quux: '  ', plomb: { min: 2 }, tags: [] } };
  const slices = { zorb: [p1, p2, p4], vex: [p3] };
  const curated: CuratedLabel[] = [
    { field: 'quux', text: 'Quux control' },
    { field: 'quux', value: 'a', text: 'Alpha' },
    { field: 'tags', value: 'y', text: '   ' },
    { field: 'glim', value: 'true', text: 'Glim on' },
    { field: 'plink.amount', value: '3', text: 'Three' },
    { field: 'nowhere', value: 'x', text: 'Orphan' },
  ];
  const RAW: RawMap = {
    zorb: { wibble: ['Frob', 'Zed'], 'plink.amount': [0, 3], quux: ['a', 'b'], 'plomb.min': [1, 2], tags: ['x', 'y'] },
    vex: { wibble: ['Zed'], 'plink.amount': [9], glim: [true] },
  };
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
  };
  const canon = (r: unknown) => JSON.stringify(r, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v));

  const raw = buildRawMap(picklist, slices);
  if (canon(raw) !== canon(RAW)) throw new Error(`self-proof failed: the raw map is ${canon(raw)}, wanted ${canon(RAW)}`);
  const labels = buildLabelsMap(raw, curated);
  if (canon(labels) !== canon(LABELS)) throw new Error(`self-proof failed: the labels map is ${canon(labels)}, wanted ${canon(LABELS)}`);
  const noes = (f: Facts) => Object.entries(judge(f)).flatMap(([id, found]) => (found.length ? [Number(id)] : []));
  const clean: Facts = { picklist, slices, raw, curated, labels };
  const base = noes(clean);
  if (base.length) throw new Error(`self-proof failed: clean data gave NO on question ${base.join(', ')}`);

  const rawPlants: [string, (r: RawMap) => void, number[]][] = [
    ['a value dropped', (r) => { r.zorb.quux = ['a']; }, [1]],
    ['a value no product holds', (r) => { r.zorb.quux.push('q'); }, [1]],
    ['a value listed twice', (r) => { r.zorb.quux.push('a'); }, [1]],
    ['a control dropped', (r) => { delete r.zorb.tags; }, [1]],
    ['a field that is not a control', (r) => { r.zorb.extra = []; }, [1]],
    ["another slice's value", (r) => { r.vex.wibble.push('Frob'); }, [1]],
    ['a blank text kept as an option', (r) => { r.zorb.quux.push('  '); }, [1, 3]],
    ['a null kept as an option', (r) => { r.zorb['plomb.min'].push(null as never); }, [1, 3]],
  ];
  for (const [what, plant, want] of rawPlants) {
    const broken = structuredClone(raw);
    plant(broken);
    const got = noes({ ...clean, raw: broken, labels: buildLabelsMap(broken, curated) });
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
  const labelPlants: [string, (l: LabelsMap) => void, number[]][] = [
    ['an option without a text', (l) => { delete l.zorb.quux.options.b; }, [3]],
    ['a text for a value that is not an option', (l) => { l.zorb.quux.options.zz = 'ZZ'; }, [3]],
    ['a control without labels', (l) => { delete l.zorb.tags; }, [3]],
    ['labels for a field that is not a control', (l) => { l.zorb.extra = { label: 'E', options: {} }; }, [3]],
    ['a slice without labels', (l) => { delete l.vex; }, [3]],
    ['an empty option text', (l) => { l.zorb.quux.options.b = '  '; }, [3]],
    ['an empty control name', (l) => { l.zorb.quux.label = ''; }, [3]],
    ['a blank curated text used as the text', (l) => { l.zorb.tags.options.y = '   '; }, [3]],
    ['a curated option text ignored', (l) => { l.zorb.quux.options.a = 'A'; }, [4]],
    ['a curated control name ignored', (l) => { l.zorb.quux.label = 'Quux'; }, [4]],
    ['a curated number option ignored', (l) => { l.zorb['plink.amount'].options[3] = '3'; }, [4]],
    ['a curated true/false option ignored', (l) => { l.vex.glim.options.true = 'Yes'; }, [4]],
    ['an invented text where no row exists', (l) => { l.zorb.wibble.label = 'Made up'; }, [4]],
    ['an automatic text wrong where no row exists', (l) => { l.zorb.quux.options.b = 'Bee'; }, [4]],
  ];
  for (const [what, plant, want] of labelPlants) {
    const broken = structuredClone(labels);
    plant(broken);
    const got = noes({ ...clean, labels: broken });
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
  const odd: Product = { _id: 'p5', wibble: 'Zed', plink: { amount: 1 }, filterAttributes: { quux: { a: 1 } } };
  let threw = false;
  try { buildRawMap(picklist, { zorb: [odd], vex: [p3] }); } catch { threw = true; }
  if (!threw) throw new Error('self-proof failed: an object value did not stop the raw map');
}

// 2. read: one request is one snapshot, from api.sanity.io (not the CDN) so nothing is stale. Published only.
// Zero products is no verdict: a wrong dataset would pass. The brand is read as its name: that is the value a shopper picks.
async function read() {
  const env = process.env;
  const published = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';
  const query = `{
    "products": *[_type == "product" && ${published}]{ _id, "brand": brand->name, price_data, stock, filterAttributes, catalogueLocationKeys },
    "items": *[_type == "catalogueItem" && ${published}]{ _id, "slug": slug.current, "parent": parent._ref },
    "picklist": *[_id == "filterPicklist"][0],
    "curated": *[_id == "filterLabels"][0].labels
  }`;
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { result } = await res.json();
  if (!result?.products?.length) throw new Error('read returned no products');
  if (!result.picklist) throw new Error('read found no published picklist document');
  return result as { products: Product[]; items: Item[]; picklist: Record<string, unknown>; curated: CuratedLabel[] | null };
}

// 3. sliceProducts: the products at the slice's catalogue root or anywhere below it.
function sliceProducts(items: Item[], products: Product[], slug: string): Product[] {
  const roots = items.filter((i) => i.slug === slug && !i.parent);
  if (roots.length !== 1) throw new Error(`catalogue root "${slug}": found ${roots.length}, wanted 1`);
  const ids = new Set([roots[0]._id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const i of items) if (i.parent && ids.has(i.parent) && !ids.has(i._id)) { ids.add(i._id); grew = true; }
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k)));
}

// 5. report: the screen text and the exit code.
function report(f: Facts, found: Record<number, string[]>) {
  console.log(Object.entries(f.slices).map(([n, p]) => `${n}: ${p.length} products, ${Object.keys(f.raw[n]).length} controls, ${Object.values(f.raw[n]).flat().length} options`).join('\n'));
  console.log(`curated rows: ${f.curated.length}${f.curated.length ? '' : ' (none stored yet, so the curated side is proven on the self-proof rows only)'}\n`);
  const ids = Object.keys(QUESTIONS).map(Number);
  ids.forEach((id) => {
    if (!found[id].length) return;
    console.log(`${id}. ${QUESTIONS[id]}`);
    found[id].forEach((line) => console.log(`  ${line}`));
    console.log('');
  });
  ids.forEach((id) => console.log(`${id}. ${QUESTIONS[id]}: ${found[id].length ? `NO, ${found[id].length} found` : 'yes'}`));
  const bad = ids.some((id) => found[id].length);
  console.log(bad ? '\nRESULT: NO' : '\nRESULT: PASS');
  return bad ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: each question says NO where it must, and yes on clean data.\n');
  const { products, items, picklist: doc, curated: rows } = await read();
  const picklist: Picklist = { alwaysOn: strings(doc.alwaysOn), picks: Object.fromEntries(Object.keys(CATALOGUE_SLUG).map((n) => [n, strings(doc[n])])) };
  if (!picklist.alwaysOn.length) throw new Error('the picklist has no always-on fields');
  const slices = Object.fromEntries(Object.entries(CATALOGUE_SLUG).map(([name, slug]) => [name, sliceProducts(items, products, slug)]));
  const curated = rows ?? [];
  const raw = buildRawMap(picklist, slices);
  const facts: Facts = { picklist, slices, raw, curated, labels: buildLabelsMap(raw, curated) };
  process.exitCode = report(facts, judge(facts));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exitCode = 2;
}
