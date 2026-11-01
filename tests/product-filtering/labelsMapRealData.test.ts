// Option maps proof: are the raw map and the labels map exactly what they should be? PASS or NO.
//
// The raw map lists, per slice and per control, the distinct values the slice's products hold. The labels map gives each control
// and each option one text: the owner's curated one when there is one, else the automatic one. Only the curated rows are stored.
// A sort (a field the shopper can sort by) is named by its field's control name, the same row the filter control uses; sort names are computed apart (buildSortLabels).
// Questions, all yes means done:
//   1. the raw map holds, for every control of a slice, exactly the distinct values the slice's products hold
//   2. the curated rows are unique on (field, value)
//   3. the labels map has exactly the raw map's controls and options, each with a non-empty text
//   4. each text is the curated one when a non-empty row exists, else the automatic one
//   5. the list the Studio draws has one section per slice; each holds exactly that slice's controls once, with exactly that slice's options, sorted, and the automatic texts
//   6. typing a wording at a line of that list (a control name, an option or a sort name) sets the text of that line and moves no other, and emptying it returns that line to its automatic text (on every live line)
//   7. the list gives each scope a sorting part: exactly the scope's sort fields (the always-on sorts, then the owner's sort picks, each once), each with its automatic name, apart from the filter controls
//   8. each sort's name is the curated control-name row when a non-empty one exists, else the automatic name
//
// A stored row that names no control or no held value is not a failure: the labels map ignores it.
// A scope is a slice or all products (the products of the three slices together, with the picks the owner chose for /products). The proof treats the four scopes alike.
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
import { buildSortLabels } from '@/features/product-filtering/core/rules/buildSortLabels';
import { sortFieldsOf } from '@/features/product-filtering/core/rules/sortFields';
import { getControlLabels } from '@/features/product-filtering/queries/getControlLabels';
import { OPTION_MAP_QUERY, toOptionMapData } from '@/features/product-filtering/adapters/sanity/optionMapData';
import type { CatalogueNode, ControlLabels, CuratedLabel, LabelsMap, OptionValue, RawMap, SliceControls, SortLabels, SortMap } from '@/features/product-filtering/core/types/optionMaps';
import { setRowText, type LabelRow } from '@/features/product-filtering/schema/labelRows';

type Product = { _id: string; filterAttributes?: Record<string, unknown>; catalogueLocationKeys?: string[]; [key: string]: unknown };
type Picklist = { alwaysOn: string[]; picks: Record<string, string[]> };
type Facts = { picklist: Picklist; slices: Record<string, Product[]>; raw: RawMap; curated: CuratedLabel[]; labels: LabelsMap; sortMap: SortMap; sortNames: SortLabels; list: SliceControls[]; write: typeof setRowText };

// The slice list name in the picklist document -> the slice's slug in the catalogue. The proof keys every slice by its slug, as the list does.
const CATALOGUE_SLUG: Record<string, string> = { headphones: 'headphones', audioElectronics: 'audio-electronics', accessories: 'accessories' };

const QUESTIONS: Record<number, string> = {
  1: "the raw map holds, for every control of a slice, exactly the distinct values the slice's products hold",
  2: 'the curated rows are unique on (field, value)',
  3: "the labels map has exactly the raw map's controls and options, each with a non-empty text",
  4: 'each text is the curated one when a non-empty row exists, else the automatic one',
  5: "the Studio list has one section per slice; each holds exactly that slice's controls once, with exactly that slice's options, sorted, and the automatic texts",
  6: "typing a wording at a line (a control name, an option or a sort name) sets the text of that line and moves no other, and emptying it returns that line to its automatic text",
  7: "the Studio list gives each scope a sorting part: exactly the scope's sort fields (the always-on sorts, then the owner's sort picks, each once), each with its automatic name, apart from the filter controls",
  8: "each sort's name is the curated control-name row when a non-empty one exists, else the automatic name",
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
  const q6: string[] = [];
  const q7: string[] = [];
  const q8: string[] = [];

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

  const named = new Set<string>();
  f.curated.forEach((row, i) => {
    const field = row.field ?? '';
    const value = row.value ?? '';
    if (named.has(`${field}\n${value}`)) q2.push(`row ${i + 1} (${field} · ${value || 'control name'}): the same field and value are named by another row`);
    named.add(`${field}\n${value}`);
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

  // 5. The list: one section per slice; in each, the slice's controls once, each with exactly the options the slice holds in the order
  // numbers, true/false, text, and the automatic texts.
  const plain = buildLabelsMap(f.raw, []);
  const listedSlices = f.list.map((s) => s.slice);
  if (new Set(listedSlices).size !== listedSlices.length) q5.push('a slice is listed twice');
  for (const name of listedSlices) if (!(name in f.raw)) q5.push(`${name} is listed but is not a slice`);
  for (const [slice, controls] of Object.entries(f.raw)) {
    const section = f.list.find((s) => s.slice === slice);
    if (!section) { q5.push(`${slice}: the slice has no section`); continue; }
    const listed = new Map<string, ControlLabels>();
    for (const c of section.controls) {
      if (listed.has(c.field)) q5.push(`${slice}: ${c.field} is listed twice`);
      listed.set(c.field, c);
      if (!(c.field in controls)) q5.push(`${slice}: ${c.field} is listed but is not a control of the slice`);
    }
    for (const [field, values] of Object.entries(controls)) {
      const c = listed.get(field);
      if (!c) { q5.push(`${slice}: ${field} is a control but is not listed`); continue; }
      if (!filled(c.label)) q5.push(`${slice}: ${field} has an empty name`);
      else if (c.label !== plain[slice][field].label) q5.push(`${slice}: ${field} is named "${c.label}", wanted the automatic "${plain[slice][field].label}"`);
      const want = [...values].sort((a, b) => kind(a) - kind(b) || (a < b ? -1 : a > b ? 1 : 0)).map(String);
      const got = c.options.map((o) => o.value);
      const twice = new Set(got).size !== got.length;
      if (twice) q5.push(`${slice}: ${field} lists an option twice`);
      for (const v of want.filter((x) => !got.includes(x))) q5.push(`${slice}: ${field} lacks the option ${v}`);
      for (const v of got.filter((x) => !want.includes(x))) q5.push(`${slice}: ${field} lists ${v}, which the slice does not hold`);
      if (!twice && got.length === want.length && want.every((x) => got.includes(x)) && got.join('\n') !== want.join('\n')) q5.push(`${slice}: ${field}: the options are not in the order numbers, true/false, text`);
      for (const o of c.options) {
        const auto = plain[slice][field].options[o.value];
        if (!filled(o.text)) q5.push(`${slice}: ${field}: option ${o.value} has an empty text`);
        else if (auto !== undefined && o.text !== auto) q5.push(`${slice}: ${field}: option ${o.value} reads "${o.text}", wanted the automatic "${auto}"`);
      }
    }
  }

  // 7. The sorting part: per scope, exactly the scope's sort fields (the always-on sorts, then the owner's sort picks, each once), each with its
  // automatic name, apart from the filter controls.
  for (const [scope, fields] of Object.entries(f.sortMap)) {
    const section = f.list.find((s) => s.slice === scope);
    if (!section) { q7.push(`${scope}: the scope has no section`); continue; }
    const got = section.sorts.map((s) => s.field);
    const want = [...new Set(fields)];
    if (got.join('\n') !== want.join('\n')) q7.push(`${scope}: the sorting part lists [${got.join(', ')}], wanted [${want.join(', ')}]`);
    for (const s of section.sorts) {
      if (!filled(s.label)) q7.push(`${scope}: ${s.field} has an empty sort name`);
      else if (s.label !== autoControlLabel(s.field)) q7.push(`${scope}: ${s.field} is named "${s.label}", wanted the automatic "${autoControlLabel(s.field)}"`);
      if (!(s.field in (f.raw[scope] ?? {})) && section.controls.some((c) => c.field === s.field)) q7.push(`${scope}: ${s.field} is a sort only but is listed as a filter control`);
    }
  }
  for (const s of f.list) if (!(s.slice in f.sortMap) && s.sorts.length) q7.push(`${s.slice}: sorts are listed for a scope that has none`);

  // 8. A sort's name: the curated control-name row when a non-empty one exists, else the automatic name, for exactly the sort fields.
  for (const scope of Object.keys(f.sortNames)) if (!(scope in f.sortMap)) q8.push(`${scope}: sort names for a scope that has no sorts`);
  for (const [scope, fields] of Object.entries(f.sortMap)) {
    const have = f.sortNames[scope];
    if (!have) { q8.push(`${scope}: no sort names`); continue; }
    for (const field of Object.keys(have)) if (!fields.includes(field)) q8.push(`${scope}: ${field} has a sort name but is not a sort`);
    for (const field of fields) {
      const text = have[field];
      if (text === undefined) q8.push(`${scope}: ${field} has no sort name`);
      else if (!filled(text)) q8.push(`${scope}: ${field} has an empty sort name`);
      else if (text !== wanted(field, '', autoControlLabel(field))) q8.push(`${scope}: ${field} is named "${text}", wanted "${wanted(field, '', autoControlLabel(field))}"`);
    }
  }

  // 6. Typing at a line of the list: that line's text becomes the typed one and no other text moves, with exactly one row for the line;
  // emptying the line gives the earlier texts back and leaves no row for it. A line that several slices share is one line.
  const rows0: LabelRow[] = f.curated.map((c, i) => ({ ...c, _key: `k${i}`, _type: 'label' }));
  const before = buildLabelsMap(f.raw, rows0);
  const same = (row: LabelRow, field: string, value: string) => row.field === field && (row.value ?? '') === value;
  const seen = new Set<string>();
  const lines = [
    ...f.list.flatMap((s) => s.controls).flatMap((c) => [{ field: c.field, value: '' }, ...c.options.map((o) => ({ field: c.field, value: o.value }))]),
    ...f.list.flatMap((s) => s.sorts).map((s) => ({ field: s.field, value: '' })),
  ]
    .filter(({ field, value }) => {
      const key = `${field}\n${value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  for (const { field, value } of lines) {
    if (q6.length >= 20) { q6.push('(more lines left out)'); break; }
    const where = `${field} · ${value || 'control name'}`;
    const typed = f.write(rows0, field, value, 'probe');
    const keys = typed.map((r) => r._key);
    if (new Set(keys).size !== keys.length) q6.push(`${where}: two rows share a key after typing`);
    if (typed.filter((r) => same(r, field, value)).length !== 1) q6.push(`${where}: typing does not leave exactly one row for the line`);
    if (typed.filter((r) => !same(r, field, value)).length !== rows0.filter((r) => !same(r, field, value)).length) q6.push(`${where}: typing changed the rows of other lines`);
    const after = buildLabelsMap(f.raw, typed);
    for (const [slice, controls] of Object.entries(before)) {
      for (const [fld, c] of Object.entries(controls)) {
        const wantName = fld === field && value === '' ? 'probe' : c.label;
        if (after[slice][fld].label !== wantName) q6.push(`${where}: the name of ${slice} · ${fld} reads "${after[slice][fld].label}", wanted "${wantName}"`);
        for (const [v, text] of Object.entries(c.options)) {
          const want = fld === field && v === value ? 'probe' : text;
          if (after[slice][fld].options[v] !== want) q6.push(`${where}: ${slice} · ${fld} · ${v} reads "${after[slice][fld].options[v]}", wanted "${want}"`);
        }
      }
    }
    const emptied = f.write(typed, field, value, '');
    if (emptied.some((r) => same(r, field, value))) q6.push(`${where}: emptying the text leaves a row for the line`);
    if (JSON.stringify(buildLabelsMap(f.raw, emptied)) !== JSON.stringify(buildLabelsMap(f.raw, rows0.filter((r) => !same(r, field, value))))) q6.push(`${where}: emptying the text does not return the line to its automatic text and leave every other text as it was`);
    const sortAfter = buildSortLabels(f.sortMap, typed);
    for (const [scope, names] of Object.entries(buildSortLabels(f.sortMap, rows0))) {
      for (const [fld, text] of Object.entries(names)) {
        const wantSort = fld === field && value === '' ? 'probe' : text;
        if (sortAfter[scope][fld] !== wantSort) q6.push(`${where}: the sort name of ${scope} · ${fld} reads "${sortAfter[scope][fld]}", wanted "${wantSort}"`);
      }
    }
    if (JSON.stringify(buildSortLabels(f.sortMap, emptied)) !== JSON.stringify(buildSortLabels(f.sortMap, rows0.filter((r) => !same(r, field, value))))) q6.push(`${where}: emptying the text does not return the sort names to their earlier texts`);
  }
  return { 1: q1, 2: q2, 3: q3, 4: q4, 5: q5, 6: q6, 7: q7, 8: q8 };
}

// 1. selfProof: a proof that cannot say no proves nothing.
// Fake slices, products and rows in real format with alien names, holding the awkward cases: null, blank text, an empty list, a number,
// true/false. Each planted break must make exactly its questions say NO, clean data none.
async function selfProof() {
  // omni stands for all products: it picks zing, a field no slice picks.
  const picklist: Picklist = { alwaysOn: ['wibble', 'plink.amount'], picks: { zorb: ['quux', 'plomb.min', 'tags'], vex: ['glim'], omni: ['zing'] } };
  const p1: Product = { _id: 'p1', wibble: 'Frob', plink: { amount: 3 }, filterAttributes: { quux: 'a', plomb: { min: 1 }, tags: ['x', 'y'], zing: 'k' } };
  const p2: Product = { _id: 'p2', wibble: 'Frob', plink: { amount: 0 }, filterAttributes: { quux: 'b', plomb: { min: null }, tags: ['y'] } };
  const p3: Product = { _id: 'p3', wibble: 'Zed', plink: { amount: 9 }, filterAttributes: { glim: true } };
  const p4: Product = { _id: 'p4', wibble: 'Zed', plink: { amount: 3 }, filterAttributes: { quux: '  ', plomb: { min: 2 }, tags: [] } };
  const slices = { zorb: [p1, p2, p4], vex: [p3], omni: [p1, p2, p4, p3] };
  // The sorts: two always-on (a price-like and a name-like field, product-root paths) and the owner's picks per scope: plomb.min is a filter and a sort, heft a sort only.
  const sortAlwaysOn = ['plink.amount', 'blorp'];
  const sortPicks = { zorb: ['plomb.min', 'heft'], vex: [], omni: ['heft'] };
  const sortMap = sortFieldsOf(sortAlwaysOn, sortPicks);
  const SORT_MAP: SortMap = {
    zorb: ['plink.amount', 'blorp', 'plomb.min', 'heft'],
    vex: ['plink.amount', 'blorp'],
    omni: ['plink.amount', 'blorp', 'heft'],
  };
  const SORT_NAMES: SortLabels = {
    zorb: { 'plink.amount': 'Plink amount', blorp: 'Blorp', 'plomb.min': 'Plomb min', heft: 'Heaviness' },
    vex: { 'plink.amount': 'Plink amount', blorp: 'Blorp' },
    omni: { 'plink.amount': 'Plink amount', blorp: 'Blorp', heft: 'Heaviness' },
  };
  const curated: CuratedLabel[] = [
    { field: 'quux', text: 'Quux control' },
    { field: 'quux', value: 'a', text: 'Alpha' },
    { field: 'tags', value: 'y', text: '   ' },
    { field: 'glim', value: 'true', text: 'Glim on' },
    { field: 'plink.amount', value: '3', text: 'Three' },
    { field: 'heft', text: 'Heaviness' },
  ];
  const RAW: RawMap = {
    zorb: { wibble: ['Frob', 'Zed'], 'plink.amount': [0, 3], quux: ['a', 'b'], 'plomb.min': [1, 2], tags: ['x', 'y'] },
    vex: { wibble: ['Zed'], 'plink.amount': [9], glim: [true] },
    omni: { wibble: ['Frob', 'Zed'], 'plink.amount': [0, 3, 9], zing: ['k'] },
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
    omni: {
      wibble: { label: 'Wibble', options: { Frob: 'Frob', Zed: 'Zed' } },
      'plink.amount': { label: 'Plink amount', options: { 0: '0', 3: 'Three', 9: '9' } },
      zing: { label: 'Zing', options: { k: 'K' } },
    },
  };
  // The Studio list: one section per scope, each with that scope's controls and the options it holds, and its sorts, with the automatic texts (no curated row).
  const LIST: SliceControls[] = [
    {
      slice: 'zorb',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
        { field: 'plink.amount', label: 'Plink amount', options: [{ value: '0', text: '0' }, { value: '3', text: '3' }] },
        { field: 'quux', label: 'Quux', options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }] },
        { field: 'plomb.min', label: 'Plomb min', options: [{ value: '1', text: '1' }, { value: '2', text: '2' }] },
        { field: 'tags', label: 'Tags', options: [{ value: 'x', text: 'X' }, { value: 'y', text: 'Y' }] },
      ],
      sorts: [
        { field: 'plink.amount', label: 'Plink amount' },
        { field: 'blorp', label: 'Blorp' },
        { field: 'plomb.min', label: 'Plomb min' },
        { field: 'heft', label: 'Heft' },
      ],
    },
    {
      slice: 'vex',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Zed', text: 'Zed' }] },
        { field: 'plink.amount', label: 'Plink amount', options: [{ value: '9', text: '9' }] },
        { field: 'glim', label: 'Glim', options: [{ value: 'true', text: 'Yes' }] },
      ],
      sorts: [
        { field: 'plink.amount', label: 'Plink amount' },
        { field: 'blorp', label: 'Blorp' },
      ],
    },
    {
      slice: 'omni',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
        { field: 'plink.amount', label: 'Plink amount', options: [{ value: '0', text: '0' }, { value: '3', text: '3' }, { value: '9', text: '9' }] },
        { field: 'zing', label: 'Zing', options: [{ value: 'k', text: 'K' }] },
      ],
      sorts: [
        { field: 'plink.amount', label: 'Plink amount' },
        { field: 'blorp', label: 'Blorp' },
        { field: 'heft', label: 'Heft' },
      ],
    },
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
  if (canon(sortMap) !== canon(SORT_MAP)) throw new Error(`self-proof failed: the sort fields are ${canon(sortMap)}, wanted ${canon(SORT_MAP)}`);
  const sortNames = buildSortLabels(sortMap, curated);
  if (canon(sortNames) !== canon(SORT_NAMES)) throw new Error(`self-proof failed: the sort names are ${canon(sortNames)}, wanted ${canon(SORT_NAMES)}`);
  const list = listControlLabels(raw, buildSortLabels(sortMap, []));
  if (canon(list) !== canon(LIST)) throw new Error(`self-proof failed: the list is ${canon(list)}, wanted ${canon(LIST)}`);
  const noes = (f: Facts) => Object.entries(judge(f)).flatMap(([id, found]) => (found.length ? [Number(id)] : []));
  const clean: Facts = { picklist, slices, raw, curated, labels, sortMap, sortNames, list, write: setRowText };
  const base = noes(clean);
  if (base.length) throw new Error(`self-proof failed: clean data gave NO on question ${base.join(', ')}`);

  // The list copies the raw map, so a break that leaves a value twice or out of order also reaches the list: question 5 says NO there too.
  const rawPlants: [string, (r: RawMap) => void, number[]][] = [
    ['a value dropped', (r) => { r.zorb.quux = ['a']; }, [1]],
    ['a value no product holds', (r) => { r.zorb.quux.push('q'); }, [1]],
    ['a value listed twice', (r) => { r.zorb.quux.push('a'); }, [1, 5]],
    ['a control dropped', (r) => { delete r.zorb.tags; }, [1]],
    ['a field that is not a control', (r) => { r.zorb.extra = []; }, [1]],
    ["another slice's value", (r) => { r.vex.wibble.push('Frob'); }, [1, 5]],
    ['a blank text kept as an option', (r) => { r.zorb.quux.push('  '); }, [1, 3, 5]],
    ['a null kept as an option', (r) => { r.zorb['plomb.min'].push(null as never); }, [1, 3, 5]],
  ];
  for (const [what, plant, want] of rawPlants) {
    const broken = structuredClone(raw);
    plant(broken);
    const got = noes({ ...clean, raw: broken, labels: buildLabelsMap(broken, curated), list: listControlLabels(broken, buildSortLabels(sortMap, [])) });
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
  const listPlants: [string, (l: SliceControls[]) => void, number[]?][] = [
    ['an option dropped', (l) => { l[0].controls[2].options.pop(); }],
    ['an option the slice does not hold', (l) => { l[0].controls[2].options.push({ value: 'q', text: 'Q' }); }],
    ['an option of another slice', (l) => { l[1].controls[0].options.push({ value: 'Frob', text: 'Frob' }); }],
    ['an option listed twice', (l) => { l[0].controls[2].options.push({ ...l[0].controls[2].options[0] }); }],
    ['a control dropped', (l) => { l[0].controls.pop(); }],
    ['a control of another slice', (l) => { l[0].controls.push(structuredClone(l[1].controls[2])); }],
    ['a control listed twice', (l) => { l[0].controls.push({ ...l[0].controls[0] }); }],
    ['a field that is not a control', (l) => { l[0].controls.push({ field: 'extra', label: 'Extra', options: [] }); }],
    ['a slice dropped', (l) => { l.pop(); }, [5, 7]],
    ['a slice listed twice', (l) => { l.push(structuredClone(l[0])); }],
    ['a slice that does not exist', (l) => { l.push({ slice: 'nowhere', controls: [], sorts: [] }); }],
    ['an empty option text', (l) => { l[0].controls[2].options[1].text = '  '; }],
    ['an empty control name', (l) => { l[0].controls[2].label = ''; }],
    ['a wrong automatic option text', (l) => { l[0].controls[2].options[1].text = 'Bee'; }],
    ['a wrong automatic control name', (l) => { l[0].controls[2].label = 'Quux control'; }],
    ['a curated text in the list', (l) => { l[0].controls[2].options[0].text = 'Alpha'; }],
    ['numbers out of order', (l) => { l[0].controls[1].options.reverse(); }],
    ['text before numbers', (l) => { const o = l[0].controls[1].options; o.push({ value: 'x', text: 'X' }); o.unshift(o.pop()!); }],
  ];
  for (const [what, plant, want = [5]] of listPlants) {
    const broken = structuredClone(list);
    plant(broken);
    const got = noes({ ...clean, list: broken });
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
  const sortPlants: [string, (l: SliceControls[]) => void, number[]][] = [
    ['a sort dropped', (l) => { l[0].sorts.pop(); }, [7]],
    ['a sort listed twice', (l) => { l[0].sorts.push({ ...l[0].sorts[0] }); }, [7]],
    ['a sort of another scope', (l) => { l[1].sorts.push({ field: 'heft', label: 'Heft' }); }, [7]],
    ['the sorts of a scope dropped', (l) => { l[1].sorts = []; }, [7]],
    ['sorts in the wrong order', (l) => { l[0].sorts.reverse(); }, [7]],
    ['an empty sort name', (l) => { l[0].sorts[0].label = '  '; }, [7]],
    ['a wrong automatic sort name', (l) => { l[0].sorts[0].label = 'Cost'; }, [7]],
    ['a curated sort name in the list', (l) => { l[0].sorts[3].label = 'Heaviness'; }, [7]],
    ['a sort only listed as a filter control', (l) => { l[0].controls.push({ field: 'heft', label: 'Heft', options: [] }); }, [5, 7]],
  ];
  for (const [what, plant, want] of sortPlants) {
    const broken = structuredClone(list);
    plant(broken);
    const got = noes({ ...clean, list: broken });
    if (got.join() !== want.join()) throw new Error(`self-proof failed on "${what}": wanted NO on [${want}], got [${got}]`);
  }
  const sortNamePlants: [string, (n: SortLabels) => void][] = [
    ['a curated sort name ignored', (n) => { n.zorb.heft = 'Heft'; }],
    ['an invented sort name', (n) => { n.vex.blorp = 'Made up'; }],
    ['a sort without a name', (n) => { delete n.vex.blorp; }],
    ['a name for a field that is not a sort', (n) => { n.vex.extra = 'E'; }],
    ['a scope without sort names', (n) => { delete n.omni; }],
    ['an empty sort name', (n) => { n.zorb.blorp = '  '; }],
    ['sort names for a scope that has no sorts', (n) => { n.nowhere = {}; }],
  ];
  for (const [what, plant] of sortNamePlants) {
    const broken = structuredClone(sortNames);
    plant(broken);
    const got = noes({ ...clean, sortNames: broken });
    if (got.join() !== '8') throw new Error(`self-proof failed on "${what}": wanted NO on [8], got [${got}]`);
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
  ];
  for (const [what, rows] of curatedPlants) {
    const got = noes({ ...clean, curated: rows, labels: buildLabelsMap(raw, rows) });
    if (got.join() !== '2') throw new Error(`self-proof failed on "${what}": wanted NO on [2], got [${got}]`);
  }
  // A row that names nothing is harmless: the labels map ignores it, so no question says NO.
  const harmless: [string, CuratedLabel[]][] = [
    ['a field that is not a control', [...curated, { field: 'nowhere', text: 'N' }]],
    ['a value no product holds', [...curated, { field: 'quux', value: 'zzz', text: 'Z' }]],
    ['a value of another field', [...curated, { field: 'quux', value: 'x', text: 'X' }]],
    ['a capital that differs', [...curated, { field: 'quux', value: 'B', text: 'Bee' }]],
    ['a number written another way', [...curated, { field: 'plink.amount', value: '3.0', text: 'T' }]],
  ];
  for (const [what, rows] of harmless) {
    const got = noes({ ...clean, curated: rows, labels: buildLabelsMap(raw, rows) });
    if (got.length) throw new Error(`self-proof failed on "${what}": a row that names nothing gave NO on [${got}]`);
  }

  // The Studio input's one way to change rows: each broken writer must make question 6 say NO.
  const own = (r: LabelRow, field: string, value: string) => r.field === field && (r.value ?? '') === value;
  const writePlants: [string, typeof setRowText][] = [
    ['a row added twice', (rows, field, value, text) => [...setRowText(rows, field, value, text), { _key: 'dup', _type: 'label', field, ...(value ? { value } : {}), text }]],
    ['the text stored at another option', (rows, field, value, text) => setRowText(rows, field, value === 'a' ? 'b' : 'a', text)],
    ['the other rows dropped', (_rows, field, value, text) => setRowText([], field, value, text)],
    ['the typed text ignored', (rows) => rows],
    ['emptying that leaves a blank row', (rows, field, value, text) => (text.trim() ? setRowText(rows, field, value, text) : rows.map((r) => (own(r, field, value) ? { ...r, text: '' } : r)))],
    ['emptying that does nothing', (rows, field, value, text) => (text.trim() ? setRowText(rows, field, value, text) : rows)],
    ['one key for every row', (rows, field, value, text) => setRowText(rows, field, value, text).map((r) => ({ ...r, _key: 'same' }))],
  ];
  for (const [what, write] of writePlants) {
    const got = noes({ ...clean, write });
    if (got.join() !== '6') throw new Error(`self-proof failed on "${what}": wanted NO on [6], got [${got}]`);
  }

  // The read path: the stored query's result in real format (the picklist document keeps camelCase list names) through the mapping and the use case.
  const result = {
    picklist: { _id: 'filterPicklist', _type: 'filterPicklist', alwaysOn: ['wibble'], headphones: ['quux'], audioElectronics: ['tags'], accessories: [], sortAlwaysOn: ['blorp'], sortHeadphones: ['quux'], sortAudioElectronics: [], sortAccessories: [], sortAllProducts: ['tags'] },
    items: [{ _id: 'h', slug: 'headphones' }, { _id: 'h1', slug: 'zorb', parent: 'h' }, { _id: 'a', slug: 'audio-electronics' }, { _id: 'x', slug: 'accessories' }],
    products: [
      { _id: 'q1', wibble: 'Frob', filterAttributes: { quux: 'b', tags: ['y'] }, catalogueLocationKeys: ['h1'] },
      { _id: 'q2', wibble: 'Zed', filterAttributes: { quux: 'a', tags: ['x'] }, catalogueLocationKeys: ['a'] },
      { _id: 'q3', wibble: 'Frob', filterAttributes: { quux: 'c' }, catalogueLocationKeys: ['x'] },
      { _id: 'q4', wibble: 'Nope', filterAttributes: { quux: 'z' }, catalogueLocationKeys: [] },
    ],
  };
  const READ_LIST: SliceControls[] = [
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
    {
      slice: 'accessories',
      controls: [{ field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }] }],
      sorts: [{ field: 'blorp', label: 'Blorp' }],
    },
    {
      slice: 'all-products',
      controls: [{ field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] }],
      sorts: [{ field: 'blorp', label: 'Blorp' }, { field: 'tags', label: 'Tags' }],
    },
  ];
  const fromRead = await getControlLabels({ fetchOptionMapData: async () => toOptionMapData(result) });
  if (canon(fromRead) !== canon(READ_LIST)) throw new Error(`self-proof failed: the read path gave ${canon(fromRead)}, wanted ${canon(READ_LIST)}`);
  // The owner picks quux for all products: its options are listed across the slices (accessories does not pick it) and q4's z stays out. Its sorts are unchanged.
  const READ_PICKED: SliceControls[] = [
    ...READ_LIST.slice(0, 3),
    {
      slice: 'all-products',
      controls: [
        { field: 'wibble', label: 'Wibble', options: [{ value: 'Frob', text: 'Frob' }, { value: 'Zed', text: 'Zed' }] },
        { field: 'quux', label: 'Quux', options: [{ value: 'a', text: 'A' }, { value: 'b', text: 'B' }, { value: 'c', text: 'C' }] },
      ],
      sorts: [{ field: 'blorp', label: 'Blorp' }, { field: 'tags', label: 'Tags' }],
    },
  ];
  const picked = await getControlLabels({ fetchOptionMapData: async () => toOptionMapData({ ...result, picklist: { ...result.picklist, allProducts: ['quux'] } }) });
  if (canon(picked) !== canon(READ_PICKED)) throw new Error(`self-proof failed: the read path with an all-products pick gave ${canon(picked)}, wanted ${canon(READ_PICKED)}`);
  const noDocument = await getControlLabels({ fetchOptionMapData: async () => toOptionMapData({ ...result, picklist: null }) });
  if (noDocument.some((s) => s.controls.length || s.sorts.length)) throw new Error('self-proof failed: a missing picklist document gave controls or sorts');

  const odd: Product ={ _id: 'p5', wibble: 'Zed', plink: { amount: 1 }, filterAttributes: { quux: { a: 1 } } };
  let threw = false;
  try { buildRawMap(picklist, { zorb: [odd], vex: [p3], omni: [odd] }); } catch { threw = true; }
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

// The shop's own query (the one the page is read with) and the stored curated rows.
async function read() {
  const result = await ask(OPTION_MAP_QUERY);
  if (!result?.products?.length) throw new Error('read returned no products');
  if (!result.picklist) throw new Error('read found no published picklist document');
  const curated: CuratedLabel[] | null = await ask('*[_id == "filterLabels"][0].labels');
  return { result, products: result.products as Product[], items: result.items as CatalogueNode[], picklist: result.picklist as Record<string, unknown>, curated };
}

// 3. report: the screen text and the exit code.
function report(f: Facts, found: Record<number, string[]>) {
  console.log(Object.entries(f.slices).map(([n, p]) => `${n}: ${p.length} products, ${Object.keys(f.raw[n]).length} controls, ${Object.values(f.raw[n]).flat().length} options`).join('\n'));
  console.log(`Studio list: ${f.list.length} sections, ${f.list.reduce((n, s) => n + s.controls.length, 0)} controls, ${f.list.reduce((n, s) => n + s.controls.reduce((m, c) => m + c.options.length, 0), 0)} options, ${f.list.reduce((n, s) => n + s.sorts.length, 0)} sorts`);
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
  const { result, products, items, picklist: doc, curated: rows } = await read();
  console.log(`read: ${Math.round(JSON.stringify(result).length / 1024)} KB in one query\n`);
  const picklist: Picklist = {
    alwaysOn: strings(doc.alwaysOn),
    picks: { ...Object.fromEntries(Object.entries(CATALOGUE_SLUG).map(([name, slug]) => [slug, strings(doc[name])])), 'all-products': strings(doc.allProducts) },
  };
  if (!picklist.alwaysOn.length) throw new Error('the picklist has no always-on fields');
  const slices = Object.fromEntries(Object.values(CATALOGUE_SLUG).map((slug) => [slug, sliceByCatalogue(items, products, slug)]));
  const inSlice = new Set(Object.values(slices).flat().map((p) => p._id));
  slices['all-products'] = products.filter((p) => inSlice.has(p._id));
  const curated = rows ?? [];
  const raw = buildRawMap(picklist, slices);
  // The expected sort fields, worked out by hand from the stored lists: the always-on sorts, then the scope's picks, each once.
  const scopes: [string, string][] = [...Object.entries(CATALOGUE_SLUG).map(([name, slug]): [string, string] => [slug, name]), ['all-products', 'allProducts'] as [string, string]];
  const sortMap: SortMap = Object.fromEntries(
    scopes.map(([slug, name]) => [slug, [...new Set([...strings(doc.sortAlwaysOn), ...strings(doc[`sort${name[0].toUpperCase()}${name.slice(1)}`])])]]),
  );
  const facts: Facts = { picklist, slices, raw, curated, labels: buildLabelsMap(raw, curated), sortMap, sortNames: buildSortLabels(sortMap, curated), list: await getControlLabels({ fetchOptionMapData: async () => toOptionMapData(result) }), write: setRowText };
  process.exitCode = report(facts, judge(facts));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exitCode = 2;
}
