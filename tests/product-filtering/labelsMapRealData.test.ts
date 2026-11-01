// Option maps proof: are the raw map and the labels map exactly what they should be? PASS or NO.
//
// The raw map lists, per slice and per control, the distinct values the slice's products hold. The labels map gives each control
// and each option one text: the owner's curated one when there is one, else the automatic one. Only the curated rows are stored.
// Questions, all yes means done:
//   1. the raw map holds, for every control of a slice, exactly the distinct values the slice's products hold
//   2. the curated rows are unique on (field, value), each names a control and a value that exists, and Studio's own rule refuses the same bad rows
//   3. the labels map has exactly the raw map's controls and options, each with a non-empty text
//   4. each text is the curated one when a non-empty row exists, else the automatic one
//   5. the list the Studio draws has every control of any slice once, each with exactly the options the slices hold, sorted, and the automatic texts
//
// A control is an always-on field or a pick of the slice, as the stored picklist says. A value is anything but: missing, null,
// blank text, an empty list. A product is in a slice when its catalogueLocationKeys hold the slice's catalogue item or one below it.
// Question 1 compares the real function with a second way to the same answer (walk every leaf of the products) on the live data.
// Reads only.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/labelsMapRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the self-proof failed.
//
// FLOW  selfProof -> read -> slice -> judge -> report

import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { autoControlLabel, autoOptionLabel, buildLabelsMap } from '@/features/product-filtering/core/rules/buildLabelsMap';
import { sliceByCatalogue } from '@/features/product-filtering/core/rules/sliceByCatalogue';
import { listControlLabels } from '@/features/product-filtering/core/rules/listControlLabels';
import type { CatalogueNode, ControlLabels, CuratedLabel, LabelsMap, OptionValue, RawMap } from '@/features/product-filtering/core/types/optionMaps';
import { checkLabelRows } from '@/features/product-filtering/schema/filterLabelsType';

type Product = { _id: string; filterAttributes?: Record<string, unknown>; catalogueLocationKeys?: string[]; [key: string]: unknown };
type Picklist = { alwaysOn: string[]; picks: Record<string, string[]> };
type Facts = { picklist: Picklist; slices: Record<string, Product[]>; raw: RawMap; curated: CuratedLabel[]; labels: LabelsMap; list: ControlLabels[] };

// The slice list name in the picklist document -> the slice's slug in the catalogue.
const CATALOGUE_SLUG: Record<string, string> = { headphones: 'headphones', audioElectronics: 'audio-electronics', accessories: 'accessories' };

const QUESTIONS: Record<number, string> = {
  1: "the raw map holds, for every control of a slice, exactly the distinct values the slice's products hold",
  2: 'the curated rows are unique on (field, value), and each names a control and a value that exists',
  3: "the labels map has exactly the raw map's controls and options, each with a non-empty text",
  4: 'each text is the curated one when a non-empty row exists, else the automatic one',
  5: "the Studio list has every control of any slice once, each with exactly the options the slices hold, sorted, and the automatic texts",
};

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const filled = (x: unknown) => typeof x === 'string' && x.trim() !== '';
const kind = (v: OptionValue) => (typeof v === 'number' ? 0 : typeof v === 'boolean' ? 1 : 2);

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
  const q2: string[] = [];
  const q3: string[] = [];
  const q4: string[] = [];
  const q5: string[] = [];

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

  const optionsOf = new Map<string, Set<string>>();
  for (const controls of Object.values(f.raw)) {
    for (const [field, values] of Object.entries(controls)) {
      const set = optionsOf.get(field) ?? new Set<string>();
      values.forEach((v) => set.add(String(v)));
      optionsOf.set(field, set);
    }
  }
  const named = new Set<string>();
  f.curated.forEach((row, i) => {
    const field = row.field ?? '';
    const value = row.value ?? '';
    const where = `row ${i + 1} (${field} · ${value || 'control name'})`;
    if (named.has(`${field}\n${value}`)) q2.push(`${where}: the same field and value are named by another row`);
    named.add(`${field}\n${value}`);
    const options = optionsOf.get(field);
    if (!options) q2.push(`${where}: ${field} is not a control`);
    else if (value && !options.has(value)) q2.push(`${where}: no product holds "${value}"`);
  });

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

  // 5. The list: every control once, the options any slice holds in the order numbers, true/false, text, each with the automatic text.
  const typed = new Map<string, Map<string, OptionValue>>();
  for (const controls of Object.values(f.raw)) {
    for (const [field, values] of Object.entries(controls)) {
      const options = typed.get(field) ?? new Map<string, OptionValue>();
      values.forEach((v) => options.set(String(v), v));
      typed.set(field, options);
    }
  }
  const plain = buildLabelsMap(f.raw, []);
  const autoName = (field: string) => Object.values(plain).map((controls) => controls[field]?.label).find((t) => t !== undefined);
  const autoText = (field: string, value: string) => Object.values(plain).map((controls) => controls[field]?.options[value]).find((t) => t !== undefined);
  const listed = new Map<string, ControlLabels>();
  for (const c of f.list) {
    if (listed.has(c.field)) q5.push(`${c.field} is listed twice`);
    listed.set(c.field, c);
    if (!typed.has(c.field)) q5.push(`${c.field} is listed but is not a control of any slice`);
  }
  for (const [field, values] of typed) {
    const c = listed.get(field);
    if (!c) { q5.push(`${field} is a control but is not listed`); continue; }
    if (!filled(c.label)) q5.push(`${field} has an empty name`);
    else if (c.label !== autoName(field)) q5.push(`${field} is named "${c.label}", wanted the automatic "${autoName(field)}"`);
    const want = [...values.values()].sort((a, b) => kind(a) - kind(b) || (a < b ? -1 : a > b ? 1 : 0)).map(String);
    const got = c.options.map((o) => o.value);
    const twice = new Set(got).size !== got.length;
    if (twice) q5.push(`${field} lists an option twice`);
    for (const v of want.filter((x) => !got.includes(x))) q5.push(`${field} lacks the option ${v}`);
    for (const v of got.filter((x) => !want.includes(x))) q5.push(`${field} lists ${v}, which no slice holds`);
    if (!twice && got.length === want.length && want.every((x) => got.includes(x)) && got.join('\n') !== want.join('\n')) q5.push(`${field}: the options are not in the order numbers, true/false, text`);
    for (const o of c.options) {
      if (!filled(o.text)) q5.push(`${field}: option ${o.value} has an empty text`);
      else if (o.text !== autoText(field, o.value) && autoText(field, o.value) !== undefined) q5.push(`${field}: option ${o.value} reads "${o.text}", wanted the automatic "${autoText(field, o.value)}"`);
    }
  }
  return { 1: q1, 2: q2, 3: q3, 4: q4, 5: q5 };
}

// 1. selfProof: a proof that cannot say no proves nothing.
// Fake slices, products and rows in real format with alien names, holding the awkward cases: null, blank text, an empty list, a number,
// true/false. Each planted break must make exactly its questions say NO, clean data none.
async function selfProof() {
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
  // The Studio list: the controls of both slices once each, the options of both slices, sorted, with the automatic texts (no curated row).
  const LIST: ControlLabels[] = [
    { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
    { field: 'plink.amount', label: 'Plink amount', options: [{ value: '0', text: '0' }, { value: '3', text: '3' }, { value: '9', text: '9' }] },
    { field: 'quux', label: 'Quux', options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }] },
    { field: 'plomb.min', label: 'Plomb min', options: [{ value: '1', text: '1' }, { value: '2', text: '2' }] },
    { field: 'tags', label: 'Tags', options: [{ value: 'x', text: 'X' }, { value: 'y', text: 'Y' }] },
    { field: 'glim', label: 'Glim', options: [{ value: 'true', text: 'Yes' }] },
  ];
  const canon = (r: unknown) => JSON.stringify(r, (_k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort()) : v));

  // The slicing: a catalogue tree in real format with alien names. A product is in a slice at the root or anywhere below it, and may be in two.
  const tree: CatalogueNode[] = [
    { _id: 'r1', slug: 'zorb' }, { _id: 'c1', slug: 'zorb-kid', parent: 'r1' }, { _id: 'c2', slug: 'deep', parent: 'c1' },
    { _id: 'r2', slug: 'vex' }, { _id: 'r3', slug: 'other' },
  ];
  const stock: Product[] = [
    { _id: 's1', catalogueLocationKeys: ['c2'] }, { _id: 's2', catalogueLocationKeys: ['r1'] }, { _id: 's3', catalogueLocationKeys: ['r2'] },
    { _id: 's4', catalogueLocationKeys: ['r3'] }, { _id: 's5', catalogueLocationKeys: [] }, { _id: 's6' }, { _id: 's7', catalogueLocationKeys: ['c1', 'r2'] },
  ];
  const ids = (slug: string) => sliceByCatalogue(tree, stock, slug).map((p) => p._id).join();
  if (ids('zorb') !== 's1,s2,s7') throw new Error(`self-proof failed: the slice zorb holds ${ids('zorb')}, wanted s1,s2,s7`);
  if (ids('vex') !== 's3,s7') throw new Error(`self-proof failed: the slice vex holds ${ids('vex')}, wanted s3,s7`);
  for (const [what, items, slug] of [['no root', tree, 'nope'], ['two roots', [...tree, { _id: 'r9', slug: 'vex' }], 'vex'], ['a slug that is not a root', tree, 'deep']] as const) {
    let threw = false;
    try { sliceByCatalogue([...items], stock, slug); } catch { threw = true; }
    if (!threw) throw new Error(`self-proof failed: the slicing did not stop on ${what}`);
  }

  const raw = buildRawMap(picklist, slices);
  if (canon(raw) !== canon(RAW)) throw new Error(`self-proof failed: the raw map is ${canon(raw)}, wanted ${canon(RAW)}`);
  const labels = buildLabelsMap(raw, curated);
  if (canon(labels) !== canon(LABELS)) throw new Error(`self-proof failed: the labels map is ${canon(labels)}, wanted ${canon(LABELS)}`);
  const list = listControlLabels(raw);
  if (canon(list) !== canon(LIST)) throw new Error(`self-proof failed: the list is ${canon(list)}, wanted ${canon(LIST)}`);
  const noes = (f: Facts) => Object.entries(judge(f)).flatMap(([id, found]) => (found.length ? [Number(id)] : []));
  const clean: Facts = { picklist, slices, raw, curated, labels, list };
  const base = noes(clean);
  if (base.length) throw new Error(`self-proof failed: clean data gave NO on question ${base.join(', ')}`);

  const rawPlants: [string, (r: RawMap) => void, number[]][] = [
    ['a value dropped', (r) => { r.zorb.quux = ['a']; }, [1]],
    ['a value no product holds', (r) => { r.zorb.quux.push('q'); }, [1]],
    ['a value listed twice', (r) => { r.zorb.quux.push('a'); }, [1]],
    ['a control dropped, which leaves a curated row without its control', (r) => { delete r.zorb.tags; }, [1, 2]],
    ['a field that is not a control', (r) => { r.zorb.extra = []; }, [1]],
    ["another slice's value", (r) => { r.vex.wibble.push('Frob'); }, [1]],
    ['a blank text kept as an option', (r) => { r.zorb.quux.push('  '); }, [1, 3, 5]],
    ['a null kept as an option', (r) => { r.zorb['plomb.min'].push(null as never); }, [1, 3, 5]],
  ];
  for (const [what, plant, want] of rawPlants) {
    const broken = structuredClone(raw);
    plant(broken);
    const got = noes({ ...clean, raw: broken, labels: buildLabelsMap(broken, curated), list: listControlLabels(broken) });
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
  const listPlants: [string, (l: ControlLabels[]) => void][] = [
    ['an option dropped', (l) => { l[2].options.pop(); }],
    ['an option no slice holds', (l) => { l[2].options.push({ value: 'q', text: 'Q' }); }],
    ['an option listed twice', (l) => { l[2].options.push({ ...l[2].options[0] }); }],
    ['a control dropped', (l) => { l.pop(); }],
    ['a control listed twice', (l) => { l.push({ ...l[0] }); }],
    ['a field that is not a control', (l) => { l.push({ field: 'extra', label: 'Extra', options: [] }); }],
    ['an empty option text', (l) => { l[2].options[1].text = '  '; }],
    ['an empty control name', (l) => { l[2].label = ''; }],
    ['a wrong automatic option text', (l) => { l[2].options[1].text = 'Bee'; }],
    ['a wrong automatic control name', (l) => { l[2].label = 'Quux control'; }],
    ['a curated text in the list', (l) => { l[2].options[0].text = 'Alpha'; }],
    ['numbers out of order', (l) => { l[1].options.reverse(); }],
    ['text before numbers', (l) => { l[1].options.push({ value: 'x', text: 'X' }); l[1].options.unshift(l[1].options.pop()!); }],
  ];
  for (const [what, plant] of listPlants) {
    const broken = structuredClone(list);
    plant(broken);
    const got = noes({ ...clean, list: broken });
    if (got.join() !== '5') throw new Error(`self-proof failed on "${what}": wanted NO on [5], got [${got}]`);
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
  const curatedPlants: [string, CuratedLabel[]][] = [
    ['a row twice', [...curated, { field: 'quux', value: 'a', text: 'Again' }]],
    ['a control name twice', [...curated, { field: 'quux', text: 'Again' }]],
    ['a field that is not a control', [...curated, { field: 'nowhere', text: 'N' }]],
    ['a value no product holds', [...curated, { field: 'quux', value: 'zzz', text: 'Z' }]],
    ['a value of another field', [...curated, { field: 'quux', value: 'x', text: 'X' }]],
    ['a capital that differs', [...curated, { field: 'quux', value: 'B', text: 'Bee' }]],
    ['a number written another way', [...curated, { field: 'plink.amount', value: '3.0', text: 'T' }]],
  ];
  for (const [what, rows] of curatedPlants) {
    const got = noes({ ...clean, curated: rows, labels: buildLabelsMap(raw, rows) });
    if (got.join() !== '2') throw new Error(`self-proof failed on "${what}": wanted NO on [2], got [${got}]`);
  }

  // Studio's own rule, on a fake client in real format: the clean rows pass and the same planted rows are refused.
  const doc = { _id: 'filterPicklist', _type: 'filterPicklist', _rev: 'r', alwaysOn: picklist.alwaysOn, zorb: picklist.picks.zorb, vex: picklist.picks.vex };
  const everyProduct = [p1, p2, p3, p4];
  const client = {
    fetch: async (q: string) => {
      if (q.includes('"filterPicklist"')) return doc;
      const expr = q.match(/\{ "v": (.+) \}$/)?.[1] ?? '';
      const always = expr.startsWith('coalesce(');
      const path = always ? expr.slice('coalesce('.length, expr.indexOf('->')) : expr.replace('filterAttributes.', '');
      return everyProduct.map((p) => ({ v: path.split('.').reduce<any>((v, k) => v?.[k], always ? p : p.filterAttributes) }));
    },
  };
  if ((await checkLabelRows(curated, client)) !== true) throw new Error('self-proof failed: Studio refused the clean rows');
  if ((await checkLabelRows(undefined, client)) !== true) throw new Error('self-proof failed: Studio refused no rows');
  for (const [what, rows] of curatedPlants) {
    if ((await checkLabelRows(rows, client)) === true) throw new Error(`self-proof failed: Studio accepted "${what}"`);
  }

  const odd: Product ={ _id: 'p5', wibble: 'Zed', plink: { amount: 1 }, filterAttributes: { quux: { a: 1 } } };
  let threw = false;
  try { buildRawMap(picklist, { zorb: [odd], vex: [p3] }); } catch { threw = true; }
  if (!threw) throw new Error('self-proof failed: an object value did not stop the raw map');
}

// 2. read: one request is one snapshot, from api.sanity.io (not the CDN) so nothing is stale. Published only.
// Zero products is no verdict: a wrong dataset would pass. The brand is read as its name: that is the value a shopper picks.
async function ask(query: string): Promise<any> {
  const env = process.env;
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  return (await res.json()).result;
}

async function read() {
  const published = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';
  const query = `{
    "products": *[_type == "product" && ${published}]{ _id, "brand": brand->name, price_data, stock, filterAttributes, catalogueLocationKeys },
    "items": *[_type == "catalogueItem" && ${published}]{ _id, "slug": slug.current, "parent": parent._ref },
    "picklist": *[_id == "filterPicklist"][0],
    "curated": *[_id == "filterLabels"][0].labels
  }`;
  const result = await ask(query);
  if (!result?.products?.length) throw new Error('read returned no products');
  if (!result.picklist) throw new Error('read found no published picklist document');
  return result as { products: Product[]; items: CatalogueNode[]; picklist: Record<string, unknown>; curated: CuratedLabel[] | null };
}

// 5. report: the screen text and the exit code.
function report(f: Facts, found: Record<number, string[]>) {
  console.log(Object.entries(f.slices).map(([n, p]) => `${n}: ${p.length} products, ${Object.keys(f.raw[n]).length} controls, ${Object.values(f.raw[n]).flat().length} options`).join('\n'));
  console.log(`Studio list: ${f.list.length} controls, ${f.list.reduce((n, c) => n + c.options.length, 0)} options`);
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
  await selfProof();
  console.log('self-proof: each question says NO where it must, and yes on clean data.\n');
  const { products, items, picklist: doc, curated: rows } = await read();
  const picklist: Picklist = { alwaysOn: strings(doc.alwaysOn), picks: Object.fromEntries(Object.keys(CATALOGUE_SLUG).map((n) => [n, strings(doc[n])])) };
  if (!picklist.alwaysOn.length) throw new Error('the picklist has no always-on fields');
  const slices = Object.fromEntries(Object.entries(CATALOGUE_SLUG).map(([name, slug]) => [name, sliceByCatalogue(items, products, slug)]));
  const curated = rows ?? [];
  const raw = buildRawMap(picklist, slices);
  const facts: Facts = { picklist, slices, raw, curated, labels: buildLabelsMap(raw, curated), list: listControlLabels(raw) };
  const found = judge(facts);
  const live = { fetch: (q: string) => ask(q) };
  const studio = await checkLabelRows(curated, live);
  if (studio !== true) found[2].push(...studio.split('\n').map((line) => `Studio rule: ${line}`));
  // The rule on the real data: a genuine row for every control's name and first option must pass, and a made-up value must be refused.
  const fields = [...new Set(Object.values(raw).flatMap((controls) => Object.keys(controls)))];
  const genuine = fields.flatMap((field): CuratedLabel[] => {
    const first = Object.values(raw).map((controls) => controls[field]).find((values) => values?.length)?.[0];
    return [{ field, text: 'probe' }, ...(first === undefined ? [] : [{ field, value: String(first), text: 'probe' }])];
  });
  const accepted = await checkLabelRows(genuine, live);
  if (accepted !== true) found[2].push(...accepted.split('\n').map((line) => `Studio rule refused a genuine row: ${line}`));
  if ((await checkLabelRows([{ field: 'brand', value: 'no-such-brand-zz', text: 'probe' }], live)) === true) found[2].push('Studio rule accepted a made-up brand');
  process.exitCode = report(facts, found);
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exitCode = 2;
}
