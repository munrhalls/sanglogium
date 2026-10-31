// Picklist proof: is the picklist exactly what it should be? PASS or NO.
//
// The picklist is one CMS document and the one source of every field that becomes a control:
//   alwaysOn   the fields that are controls in every slice (brand, price, stock). Not a choice: read-only in Studio.
//   three lists, one per slice, the owner's picks in the owner's order. Studio offers a closed list per slice, signed by the owner.
// Seven questions, all yes means done:
//   1. every offered field has a value on a product of its slice
//   2. the offer and the stored always-on fields are exactly the signed ones (SIGNED below, written by hand)
//   3. every stored pick is offered by its slice, once
//   4. every always-on field has a value on every product
//   5. Studio shows the always-on list read-only, and no always-on field is offered or stored as a pick
//   6. one picklist document, holding only the always-on list and the three slice lists
//   7. the owner can reorder each slice list in Studio
//
// A value is anything but: missing, null, blank text, an empty list, an empty object.
// A product is in a slice when its catalogueLocationKeys hold the slice's catalogue item or one below it (live catalogueItem tree).
// The offer is read from the real Studio schema (studio/schema.ts), not copied. Reads only.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/picklistRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the self-proof failed.
//
// FLOW  selfProof -> read -> sliceProducts -> judge -> report

import { schema } from '@/studio/schema';

type Product = { _id: string; catalogueLocationKeys?: string[]; filterAttributes?: Record<string, unknown>; [key: string]: unknown };
type Facts = {
  products: Product[];
  slices: Record<string, Product[]>;
  studio: { lists: Record<string, { values: string[]; reorderable: boolean }>; alwaysOnReadOnly: boolean };
  docs: Record<string, unknown>[];
};
type Signed = { always: string[]; picks: Record<string, string[]> };

// Signed by Jan, 2026-10-31. Adding or cutting a field means changing it here and in the schema (or the document) together, or question 2 says NO.
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
};

// The slice list name in the picklist document -> the slice's slug in the catalogue.
const CATALOGUE_SLUG: Record<string, string> = { headphones: 'headphones', audioElectronics: 'audio-electronics', accessories: 'accessories' };

const QUESTIONS = [
  'every offered field has a value on a product of its slice',
  'the offer and the stored always-on fields are exactly the signed ones',
  'every stored pick is offered by its slice, once',
  'every always-on field has a value on every product',
  'Studio shows the always-on list read-only, and no always-on field is offered or stored as a pick',
  'one picklist document, holding only the always-on list and the three slice lists',
  'the owner can reorder each slice list in Studio',
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

// 4. judge: the findings per question, in order. An empty list is a yes.
export function judge(f: Facts, signed: Signed = SIGNED): string[][] {
  const names = Object.keys(signed.picks);
  const doc = f.docs.find((d) => d._id === 'filterPicklist');
  const always = strings(doc?.alwaysOn);
  const stored = (name: string): string[] => strings(doc?.[name]);
  const offered = (name: string): string[] => f.studio.lists[name]?.values ?? [];
  const found: string[][] = QUESTIONS.map(() => []);

  for (const name of names) {
    for (const field of offered(name)) {
      if (!f.slices[name].some((p) => hasValue(at(p.filterAttributes, field)))) found[0].push(`${name}: ${field}`);
    }

    const want = signed.picks[name];
    const extra = offered(name).filter((x) => !want.includes(x));
    const missing = want.filter((x) => !offered(name).includes(x));
    const twice = repeated(offered(name));
    if (extra.length) found[1].push(`${name}: offered, not signed: ${extra.join(', ')}`);
    if (missing.length) found[1].push(`${name}: signed, not offered: ${missing.join(', ')}`);
    if (twice.length) found[1].push(`${name}: offered twice: ${twice.join(', ')}`);

    for (const pick of stored(name)) if (!offered(name).includes(pick)) found[2].push(`${name}: ${pick} is stored but not offered`);
    for (const pick of repeated(stored(name))) found[2].push(`${name}: ${pick} is stored twice`);

    if (!f.studio.lists[name]?.reorderable) found[6].push(`${name}: cannot be reordered in Studio`);
  }
  for (const name of Object.keys(f.studio.lists)) if (!names.includes(name)) found[1].push(`Studio has a list that is not signed: ${name}`);
  if ([...always].sort().join('; ') !== [...signed.always].sort().join('; ')) {
    found[1].push(`always-on is [${always.join(', ')}], signed [${signed.always.join(', ')}]`);
  }

  for (const path of always) {
    const lacking = f.products.filter((p) => !hasValue(at(p, path)));
    if (lacking.length) found[3].push(`${path}: ${lacking.length} of ${f.products.length} products lack it, first: ${lacking[0]._id}`);
  }

  if (!f.studio.alwaysOnReadOnly) found[4].push('Studio does not show the always-on list read-only');
  for (const path of always) {
    for (const name of names) {
      if (offered(name).includes(path)) found[4].push(`${name}: ${path} is offered`);
      if (stored(name).includes(path)) found[4].push(`${name}: ${path} is stored as a pick`);
    }
  }

  if (f.docs.length !== 1 || !doc) found[5].push(`${f.docs.length} published documents, ids: ${f.docs.map((d) => d._id).join(', ') || 'none'}`);
  for (const key of Object.keys(doc ?? {})) if (!SYSTEM_KEYS.has(key) && key !== 'alwaysOn' && !names.includes(key)) found[5].push(`the document holds ${key}`);
  return found;
}

// 1. selfProof: a proof that cannot say no proves nothing.
// Fake slices and products in real format with alien names. Each planted break must make exactly its questions say NO, clean data none.
function selfProof() {
  const alien: Signed = { always: ['wibble', 'plink.amount'], picks: { zorb: ['quux', 'plomb.min'], vex: ['glim'] } };
  const clean = (): Facts => {
    const p1: Product = { _id: 'p1', wibble: { _ref: 'x' }, plink: { amount: 3 }, filterAttributes: { quux: 'a', plomb: { min: 1 } } };
    const p2: Product = { _id: 'p2', wibble: { _ref: 'y' }, plink: { amount: 0 }, filterAttributes: { quux: 'b', plomb: { min: 2 } } };
    const p3: Product = { _id: 'p3', wibble: { _ref: 'z' }, plink: { amount: 9 }, filterAttributes: { glim: true } };
    return {
      products: [p1, p2, p3],
      slices: { zorb: [p1, p2], vex: [p3] },
      studio: {
        lists: { zorb: { values: ['quux', 'plomb.min'], reorderable: true }, vex: { values: ['glim'], reorderable: true } },
        alwaysOnReadOnly: true,
      },
      docs: [{ _id: 'filterPicklist', _type: 'filterPicklist', _rev: 'r', alwaysOn: ['wibble', 'plink.amount'], zorb: ['quux'], vex: [] }],
    };
  };
  const doc = (f: Facts) => f.docs[0];
  const plants: [string, (f: Facts) => void, number[]][] = [
    ['an offered field no product holds', (f) => { f.slices.zorb.forEach((p) => { p.filterAttributes!.quux = null; }); }, [1]],
    ['an offered field is unsigned', (f) => { f.studio.lists.zorb.values.push('frob'); f.slices.zorb[0].filterAttributes!.frob = 'z'; }, [2]],
    ['a signed field is not offered', (f) => { f.studio.lists.zorb.values = ['quux']; }, [2]],
    ['a field offered twice', (f) => { f.studio.lists.zorb.values.push('quux'); }, [2]],
    ['a stored always-on list that differs from the signed', (f) => { doc(f).alwaysOn = ['wibble']; }, [2]],
    ['a stored pick is not offered', (f) => { (doc(f).zorb as string[]).push('frob'); }, [3]],
    ['a pick stored twice', (f) => { doc(f).zorb = ['quux', 'quux']; }, [3]],
    ['an always-on field missing on a product', (f) => { delete f.products[1].wibble; }, [4]],
    ['an always-on field with a null value', (f) => { f.products[0].plink = { amount: null }; }, [4]],
    ['Studio does not show the always-on list read-only', (f) => { f.studio.alwaysOnReadOnly = false; }, [5]],
    ['an always-on field stored as a pick', (f) => { (doc(f).zorb as string[]).push('wibble'); }, [3, 5]],
    ['an always-on field offered', (f) => { f.studio.lists.vex.values.push('wibble'); }, [1, 2, 5]],
    ['Studio lacks a slice list', (f) => { delete f.studio.lists.vex; }, [2, 7]],
    ['a slice list drawn as checkboxes', (f) => { f.studio.lists.zorb.reorderable = false; }, [7]],
    ['a second document', (f) => { f.docs.push({ _id: 'other', _type: 'filterPicklist' }); }, [6]],
    ['an extra field in the document', (f) => { doc(f).zorbExtra = []; }, [6]],
    ['no document', (f) => { f.docs = []; }, [2, 6]],
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
    "products": *[_type == "product" && ${published}]{ _id, brand, price_data, stock, filterAttributes, catalogueLocationKeys },
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

// What the real picklist type offers. A list is reorderable when Sanity draws it as sortable rows: its choices sit on the items,
// not on the list itself (that draws checkboxes), and sorting is not turned off. (Read from Sanity's own array input resolver.)
function studioFacts(): Facts['studio'] {
  const type: any = schema.types.find((t: any) => t.name === 'filterPicklist');
  if (!type) throw new Error('Studio has no filterPicklist type');
  const lists: Facts['studio']['lists'] = {};
  for (const f of type.fields.filter((x: any) => x.name !== 'alwaysOn')) {
    const itemChoices = f.of?.[0]?.options?.list;
    lists[f.name] = {
      values: ((f.options?.list ?? itemChoices ?? []) as any[]).map((o) => o.value),
      reorderable: !f.options?.list && Array.isArray(itemChoices) && itemChoices.length > 0 && f.options?.sortable !== false,
    };
  }
  const always = type.fields.find((x: any) => x.name === 'alwaysOn');
  return { lists, alwaysOnReadOnly: always?.readOnly === true };
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
  const facts: Facts = { products, slices, studio: studioFacts(), docs };
  process.exitCode = report(facts, judge(facts));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exitCode = 2;
}
