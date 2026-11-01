// Sections proof: do the stored headings and the rule that places them give each route the right sections? PASS or NO. It tells the truth and nothing else.
//
// Three questions. All yes means done:
//   1. the stored heading rows are valid: each list is a list of rows, each with a text title, a "shown above" control offered for its list and an icon from the closed list or none
//   2. on the real routes of the four scopes, the sections hold every control of the model exactly once, in the model's order, as unbroken runs; and with headings planted into the real order (authored last-first, one on the same control twice, one on no control, one above a control the route lacks, one over a run of controls the route lacks) they equal an independent cut of that order
//   3. hand-written rows, orders and documents give the written sections: positions, the first of two headings on a control, a heading above a control the route lacks, a section with no control, the text __proto__, icons, no controls, and the read path from the stored document (a missing document, a malformed list, malformed rows, each scope's own picks, a failed read)
// No flakiness: live, the stored rows and the route come from one request per scope, so nothing can change between them; fixtures, every input is literal and every section is written by hand; no clock, no randomness.
// Not checked, because nothing is wrong when it holds: a heading whose control is not picked (it is ignored); two rows on one control (the first counts). How the Studio form looks is a hand check.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/sectionsRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> live -> fixtures -> report

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { PICKABLE } from '@/features/product-filtering/schema/pickableFields';
import { SECTION_ICONS } from '@/features/product-filtering/schema/sectionIcons';
import { PUBLISHED } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { SECTION_QUERY, toSectionData } from '@/features/product-filtering/adapters/sanity/sectionData';
import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import { getRouteSections } from '@/features/product-filtering/queries/getRouteSections';
import { buildControlModel } from '@/features/product-filtering/core/rules/buildControlModel';
import { buildSections } from '@/features/product-filtering/core/rules/buildSections';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { Section, SectionData, SectionRow } from '@/features/product-filtering/core/types/sections';

// A string for comparison: object keys sorted at every level, array order kept.
const canon = (x: unknown): string =>
  JSON.stringify(
    (function sort(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sort((value as Record<string, unknown>)[k])]));
      return value;
    })(x),
  );

// One POST to the Sanity query API. A network failure throws: that is no verdict.
async function ask(query: string, params: Record<string, unknown>) {
  const env = process.env;
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params }),
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, result: body.result, error: body.error?.description ?? body.message };
}

const isText = (x: unknown): x is string => typeof x === 'string' && x.trim() !== '';
const R = (title: string, before: string, icon?: string): SectionRow => (icon === undefined ? { title, before } : { title, icon, before });
const S = (key: string, label: string, icon: string, paths: string[]): Section => ({ key, label, icon, paths });
const LEAD = (paths: string[]): Section => S('', '', '', paths);
const portOf = (data: SectionData) => ({ fetchSections: async () => data });

// ---- Question 1: the stored rows -------------------------------------------------------------------------------------------------

const LISTS = [
  { list: 'sectionsHeadphones', offer: PICKABLE.headphones },
  { list: 'sectionsAudioElectronics', offer: PICKABLE.audioElectronics },
  { list: 'sectionsAccessories', offer: PICKABLE.accessories },
  { list: 'sectionsAllProducts', offer: PICKABLE.allProducts },
];

// The findings on one picklist document, as the shop's query returns it. A list the owner has not filled is fine.
function judgeStored(doc: unknown): string[] {
  const found: string[] = [];
  for (const { list, offer } of LISTS) {
    const value = (doc as Record<string, unknown> | null)?.[list];
    if (value === undefined || value === null) continue;
    if (!Array.isArray(value)) {
      found.push(`${list} is not a list`);
      continue;
    }
    value.forEach((row, i) => {
      const where = `${list}[${i}]`;
      if (row === null || typeof row !== 'object' || Array.isArray(row)) {
        found.push(`${where} is not a row`);
        return;
      }
      const { title, icon, before } = row as Record<string, unknown>;
      if (!isText(title)) found.push(`${where} has no title`);
      if (!isText(before)) found.push(`${where} has no "shown above" control`);
      else if (!offer.includes(before)) found.push(`${where}: ${before} is not offered for this list`);
      if (icon !== undefined && icon !== null && !(typeof icon === 'string' && SECTION_ICONS.includes(icon))) found.push(`${where}: icon ${JSON.stringify(icon)} is not in the closed list`);
    });
  }
  return found;
}

const CLEAN_DOC = {
  sectionsHeadphones: [{ title: 'Sound', icon: SECTION_ICONS[0], before: 'impedanceOhms' }, { title: 'Cable', before: 'cableLengthM' }],
  sectionsAudioElectronics: [],
  sectionsAccessories: null,
};
const BAD_DOCS: [string, unknown][] = [
  ['a list that is not a list', { sectionsHeadphones: 'x' }],
  ['a row that is not an object', { sectionsHeadphones: ['x'] }],
  ['a blank title', { sectionsHeadphones: [{ title: ' ', before: 'impedanceOhms' }] }],
  ['a missing "shown above"', { sectionsAllProducts: [{ title: 'T' }] }],
  ['a "shown above" not offered for its list', { sectionsAccessories: [{ title: 'T', before: 'impedanceOhms' }] }],
  ['an icon outside the closed list', { sectionsHeadphones: [{ title: 'T', icon: 'rocket', before: 'impedanceOhms' }] }],
  ['an icon that is not text', { sectionsHeadphones: [{ title: 'T', icon: 5, before: 'impedanceOhms' }] }],
];

// ---- Question 3: the rule and the read path, on hand-written inputs ---------------------------------------------------------------

// The order of the controls: the always-on fields, then the picks. Alien names; one is dotted, one is the text __proto__.
const ORDER = ['zed', 'quux.lo', '__proto__', 'blip', 'wumpus', 'frob', 'glorp', 'nix'];
const WITHOUT = (...gone: string[]) => ORDER.filter((p) => !gone.includes(p));

type BuildFn = (rows: SectionRow[], order: string[], paths: string[]) => Section[];
const CHECKS: { name: string; rows: SectionRow[]; paths: string[]; expected: Section[] }[] = [
  { name: 'no heading: one block holds every control', rows: [], paths: ORDER, expected: [LEAD(ORDER)] },
  { name: 'a heading splits the order at its control, and its own control is below it', rows: [R('Blip heading', 'blip')], paths: ORDER, expected: [LEAD(['zed', 'quux.lo', '__proto__']), S('blip', 'Blip heading', '', ['blip', 'wumpus', 'frob', 'glorp', 'nix'])] },
  { name: 'a heading above the first control leaves no leading block', rows: [R('Top', 'zed', 'bluetooth')], paths: ORDER, expected: [S('zed', 'Top', 'bluetooth', ORDER)] },
  {
    name: 'headings are placed by position, not by the order they were stored in',
    rows: [R('Late', 'glorp'), R('Early', 'quux.lo')],
    paths: ORDER,
    expected: [LEAD(['zed']), S('quux.lo', 'Early', '', ['quux.lo', '__proto__', 'blip', 'wumpus', 'frob']), S('glorp', 'Late', '', ['glorp', 'nix'])],
  },
  { name: 'two headings on one control: the first stored counts', rows: [R('First', 'blip'), R('Second', 'blip')], paths: ORDER, expected: [LEAD(['zed', 'quux.lo', '__proto__']), S('blip', 'First', '', ['blip', 'wumpus', 'frob', 'glorp', 'nix'])] },
  { name: 'a heading above a control that is not in the order is ignored', rows: [R('Nowhere', 'absent')], paths: ORDER, expected: [LEAD(ORDER)] },
  {
    name: 'a heading above a control the route lacks keeps its range',
    rows: [R('F', 'frob'), R('N', 'nix')],
    paths: WITHOUT('frob'),
    expected: [LEAD(['zed', 'quux.lo', '__proto__', 'blip', 'wumpus']), S('frob', 'F', '', ['glorp']), S('nix', 'N', '', ['nix'])],
  },
  {
    name: 'a heading with no control left on the route is left out',
    rows: [R('F', 'frob'), R('N', 'nix')],
    paths: WITHOUT('frob', 'glorp'),
    expected: [LEAD(['zed', 'quux.lo', '__proto__', 'blip', 'wumpus']), S('nix', 'N', '', ['nix'])],
  },
  {
    name: 'the text __proto__ is an ordinary control, and a second heading on it is a duplicate',
    rows: [R('Proto', '__proto__'), R('Proto again', '__proto__')],
    paths: ORDER,
    expected: [LEAD(['zed', 'quux.lo']), S('__proto__', 'Proto', '', ['__proto__', 'blip', 'wumpus', 'frob', 'glorp', 'nix'])],
  },
  {
    name: 'an icon is carried, none gives an empty icon, a dotted control is a control',
    rows: [R('A', 'quux.lo', 'tag'), R('B', 'wumpus')],
    paths: ORDER,
    expected: [LEAD(['zed']), S('quux.lo', 'A', 'tag', ['quux.lo', '__proto__', 'blip']), S('wumpus', 'B', '', ['wumpus', 'frob', 'glorp', 'nix'])],
  },
  { name: 'a heading on the last control', rows: [R('Last', 'nix')], paths: ORDER, expected: [LEAD(WITHOUT('nix')), S('nix', 'Last', '', ['nix'])] },
  {
    name: 'neighbouring headings: the first holds only its own control',
    rows: [R('A', 'blip'), R('B', 'wumpus')],
    paths: ORDER,
    expected: [LEAD(['zed', 'quux.lo', '__proto__']), S('blip', 'A', '', ['blip']), S('wumpus', 'B', '', ['wumpus', 'frob', 'glorp', 'nix'])],
  },
  { name: 'a route with no control has no sections', rows: [R('A', 'blip')], paths: [], expected: [] },
];

// The proof's own implementations of the written rules. `cutOracle` walks the order and cuts it at each heading (the independent method the live question uses);
// `referenceSections` has the rule's shape with one switch per planted defect.
function cutOracle(rows: SectionRow[], order: string[], paths: string[]): Section[] {
  const first = new Map<string, SectionRow>();
  for (const row of rows) if (order.includes(row.before) && !first.has(row.before)) first.set(row.before, row);
  const groups: Section[] = [LEAD([])];
  for (const path of order) {
    const heading = first.get(path);
    if (heading) groups.push(S(path, heading.title, heading.icon ?? '', []));
    if (paths.includes(path)) groups[groups.length - 1].paths.push(path);
  }
  return groups.filter((group) => group.paths.length > 0);
}

const DEFECTS = [
  'stored-order', 'last-duplicate', 'all-duplicates', 'object-seen', 'unknown-at-top', 'dropped-heading-ignored',
  'own-control-above', 'empty-section-kept', 'empty-leading-kept', 'icon-lost', 'label-is-key',
] as const;
type Defect = (typeof DEFECTS)[number];

function referenceSections(rows: SectionRow[], order: string[], paths: string[], defect?: Defect): Section[] {
  const taken = new Set<string>();
  const plain: Record<string, boolean> = {};
  const headings: { index: number; row: SectionRow }[] = [];
  for (const row of rows) {
    let index = order.indexOf(row.before);
    if (index < 0 && defect === 'unknown-at-top') index = 0;
    if (index < 0) continue;
    if (defect === 'dropped-heading-ignored' && !paths.includes(row.before)) continue;
    const seen = defect === 'object-seen' ? plain[row.before] === true : taken.has(row.before);
    taken.add(row.before);
    plain[row.before] = true;
    if (seen && defect === 'last-duplicate') {
      headings[headings.findIndex((h) => h.row.before === row.before)] = { index, row };
      continue;
    }
    if (seen && defect !== 'all-duplicates') continue;
    headings.push({ index, row });
  }
  if (defect !== 'stored-order') headings.sort((a, b) => a.index - b.index);
  const sections = [LEAD([]), ...headings.map(({ row }) => S(row.before, defect === 'label-is-key' ? row.before : row.title, defect === 'icon-lost' ? '' : row.icon ?? '', []))];
  for (const path of paths) {
    const at = order.indexOf(path);
    let owner = 0;
    headings.forEach((h, i) => {
      if (defect === 'own-control-above' ? h.index < at : h.index <= at) owner = i + 1;
    });
    sections[owner].paths.push(path);
  }
  return sections.filter((section, i) => defect === 'empty-section-kept' || (defect === 'empty-leading-kept' && i === 0) || section.paths.length > 0);
}

// The read path: a hand-written picklist document in the real format, the lists it holds and what the shop reads from it.
const DOC = {
  alwaysOn: ['zed', 'quux.lo'],
  headphones: ['blip', 'wumpus'],
  audioElectronics: ['frob'],
  accessories: [],
  allProducts: ['glorp', 'nix', 'blip'],
  sectionsHeadphones: [
    { _key: 'k1', _type: 'section', title: 'Hh', icon: 'plug', before: 'wumpus' },
    { _key: 'k2', _type: 'section', title: '  ', before: 'blip' },
    { _key: 'k3', _type: 'section', title: 'No target' },
    'junk',
    null,
    { _key: 'k4', _type: 'section', title: 'Bad icon', icon: 5, before: 'blip' },
  ],
  sectionsAudioElectronics: 'not a list',
  sectionsAllProducts: [{ _key: 'k5', _type: 'section', title: 'Ap', before: 'nix' }],
};

const READS: { name: string; run: () => Promise<unknown>; expected: unknown }[] = [
  {
    name: 'a missing document gives no controls and no headings',
    run: async () => toSectionData(null),
    expected: {
      alwaysOn: [],
      picks: { headphones: [], 'audio-electronics': [], accessories: [], 'all-products': [] },
      rows: { headphones: [], 'audio-electronics': [], accessories: [], 'all-products': [] },
    },
  },
  {
    name: 'the document is read list by list: malformed lists and rows are dropped, an icon that is not text is left off, the stored order is kept',
    run: async () => toSectionData(DOC),
    expected: {
      alwaysOn: ['zed', 'quux.lo'],
      picks: { headphones: ['blip', 'wumpus'], 'audio-electronics': ['frob'], accessories: [], 'all-products': ['glorp', 'nix', 'blip'] },
      rows: { headphones: [{ title: 'Hh', icon: 'plug', before: 'wumpus' }, { title: 'Bad icon', before: 'blip' }], 'audio-electronics': [], accessories: [], 'all-products': [{ title: 'Ap', before: 'nix' }] },
    },
  },
  {
    name: 'a scope reads its own picks and its own headings',
    run: () => getRouteSections(portOf(toSectionData(DOC)), { scope: 'headphones', controlPaths: ['zed', 'quux.lo', 'blip', 'wumpus'] }),
    expected: [LEAD(['zed', 'quux.lo']), S('blip', 'Bad icon', '', ['blip']), S('wumpus', 'Hh', 'plug', ['wumpus'])],
  },
  {
    name: 'all products reads its own picks and its own headings',
    run: () => getRouteSections(portOf(toSectionData(DOC)), { scope: 'all-products', controlPaths: ['zed', 'quux.lo', 'glorp', 'nix', 'blip'] }),
    expected: [LEAD(['zed', 'quux.lo', 'glorp']), S('nix', 'Ap', '', ['nix', 'blip'])],
  },
  {
    name: 'a scope with no heading has the leading block alone',
    run: () => getRouteSections(portOf(toSectionData(DOC)), { scope: 'audio-electronics', controlPaths: ['zed', 'quux.lo', 'frob'] }),
    expected: [LEAD(['zed', 'quux.lo', 'frob'])],
  },
  {
    name: 'a failed read gives the leading block alone and logs once',
    run: async () => {
      const original = console.error;
      let logged = 0;
      console.error = () => {
        logged++;
      };
      try {
        const got = await getRouteSections({ fetchSections: async () => { throw new Error('read failed'); } }, { scope: 'headphones', controlPaths: ['zed', 'blip'] });
        return { got, logged };
      } finally {
        console.error = original;
      }
    },
    expected: { got: [LEAD(['zed', 'blip'])], logged: 1 },
  },
];

// ---- Question 2: sections against the real routes ----------------------------------------------------------------------------------

// Findings on one set of sections: they must hold exactly the route's controls in the route's order (every control once, runs unbroken) and equal the expected sections.
function sectionFindings(where: string, got: Section[], expected: Section[], paths: string[]): string[] {
  const out: string[] = [];
  const flat = got.flatMap((s) => s.paths);
  if (canon(flat) !== canon(paths)) out.push(`${where}: the sections hold ${canon(flat).slice(0, 200)} but the route's controls are ${canon(paths).slice(0, 200)}`);
  if (canon(got) !== canon(expected)) out.push(`${where}: expected ${canon(expected).slice(0, 300)}, got ${canon(got).slice(0, 300)}`);
  return out;
}

// Headings planted into a real order: above every third control, authored last-first, one more on the same control as the first, one on a field nobody has.
function planted(order: string[]): SectionRow[] {
  const rows: SectionRow[] = [];
  order.forEach((path, i) => {
    if (i % 3 === 2) rows.push(R(`Heading ${i}`, path, i % 2 ? SECTION_ICONS[i % SECTION_ICONS.length] : undefined));
  });
  rows.reverse();
  rows.push(R('Second heading on the same control', order[2]));
  rows.push(R('Heading on a field nobody has', 'not-a-field'));
  return rows;
}

type Item = { _id: string; slug?: string; parent?: string };

async function live(): Promise<{ q1: string[]; q2: string[]; summaries: string[] }> {
  const a = await ask(`{ "items": *[_type == "catalogueItem" && ${PUBLISHED}]{ _id, "slug": slug.current, "parent": parent._ref } }`, {});
  if (a.status !== 200) throw new Error(`catalogue items read failed: HTTP ${a.status} ${a.error ?? ''}`);
  const items: Item[] = a.result?.items ?? [];
  const children = new Map<string, string[]>();
  for (const item of items) {
    if (!item.parent) continue;
    children.set(item.parent, [...(children.get(item.parent) ?? []), item._id]);
  }
  const subtree = (id: string): string[] => {
    const ids = [id];
    for (let i = 0; i < ids.length; i++) ids.push(...(children.get(ids[i]) ?? []));
    return ids;
  };

  const q1: string[] = [];
  const q2: string[] = [];
  const summaries: string[] = [];
  let first = true;
  for (const scope of [...CATEGORIES, 'all-products'] as PicklistScope[]) {
    let keys: string[];
    if (scope === 'all-products') keys = items.map((i) => i._id);
    else {
      const root = items.find((i) => !i.parent && i.slug === scope);
      if (!root) throw new Error(`no root catalogue item with slug "${scope}"`);
      keys = subtree(root._id);
    }
    const r = await ask(`{ "sections": ${SECTION_QUERY}, "route": ${ROUTE_MAP_QUERY} }`, { keys });
    if (r.status !== 200) throw new Error(`read failed for ${scope}: HTTP ${r.status} ${r.error ?? ''}`);
    if (!r.result?.sections) throw new Error(`scope ${scope}: the picklist document is missing`);
    if (first) {
      q1.push(...judgeStored(r.result.sections).map((f) => `1 ${f}`));
      first = false;
    }
    const answer = await getRouteControls({ fetchRouteMapData: async () => toRouteMapData(r.result.route) }, { keys, scope });
    if (Object.keys(answer.raw).length === 0) throw new Error(`scope ${scope}: the answer holds no controls`);
    const paths = buildControlModel(answer).controls.map((c) => c.path);
    const data = toSectionData(r.result.sections);
    const order = [...data.alwaysOn, ...data.picks[scope]];
    if (order.length < 6) throw new Error(`scope ${scope}: the order holds ${order.length} controls, too few to plant headings`);

    // The rule relies on the model's controls being the order's controls, in the order's order.
    if (!paths.every((p) => order.includes(p)) || canon(order.filter((p) => paths.includes(p))) !== canon(paths))
      q2.push(`2 ${scope}: the model's controls are not the picklist order restricted to the route`);

    const rows = planted(order);
    const variants: { name: string; rows: SectionRow[]; paths: string[] }[] = [
      { name: 'stored rows', rows: data.rows[scope], paths },
      { name: 'planted headings', rows, paths },
      { name: 'planted headings, a control the route lacks under a heading', rows, paths: paths.filter((p) => p !== order[2]) },
      { name: 'planted headings, a run of controls the route lacks', rows, paths: paths.filter((p) => !order.slice(2, 5).includes(p)) },
    ];
    const counts: number[] = [];
    for (const [v, variant] of variants.entries()) {
      const got = await getRouteSections(portOf({ ...data, rows: { ...data.rows, [scope]: variant.rows } }), { scope, controlPaths: variant.paths });
      const expected = cutOracle(variant.rows, order, variant.paths);
      q2.push(...sectionFindings(`2 ${scope} / ${variant.name}`, got, expected, variant.paths));
      counts.push(got.length);
      // The planted variants must exercise what they are for, else the pass would say nothing.
      const heads = expected.map((s) => s.key);
      if (v === 1 && heads.length < 3) throw new Error(`scope ${scope}: the planted headings give fewer than two sections`);
      if (v === 2 && !heads.includes(order[2])) throw new Error(`scope ${scope}: the heading above a control the route lacks did not keep its range`);
      if (v === 3 && heads.includes(order[2])) throw new Error(`scope ${scope}: the heading over a run of missing controls was not left out`);
    }
    summaries.push(
      `Scope ${scope}: ${paths.length} controls of ${order.length} in the order, ${data.rows[scope].length} stored headings; sections: ${counts[0]} from the stored rows, ${counts[1]} with planted headings, ${counts[2]} and ${counts[3]} with controls the route lacks.`,
    );
  }
  return { q1, q2, summaries };
}

// The checks can say no: the reference and the independent cut must give the written sections, each planted defect must differ somewhere, the stored-row judge must pass a clean document and refuse each bad one, and the section comparison must refuse each broken set.
function proofCanFail(): string[] {
  const problems: string[] = [];
  for (const check of CHECKS) {
    const ref = referenceSections(check.rows, ORDER, check.paths);
    if (canon(ref) !== canon(check.expected)) problems.push(`the reference does not give the written sections for ${check.name}: expected ${canon(check.expected)}, got ${canon(ref)}`);
    const cut = cutOracle(check.rows, ORDER, check.paths);
    if (canon(cut) !== canon(check.expected)) problems.push(`the independent cut does not give the written sections for ${check.name}: expected ${canon(check.expected)}, got ${canon(cut)}`);
  }
  for (const defect of DEFECTS) {
    const differs = CHECKS.some((check) => canon(referenceSections(check.rows, ORDER, check.paths, defect)) !== canon(check.expected));
    if (!differs) problems.push(`the cases do not say NO to ${defect}`);
  }
  if (judgeStored(CLEAN_DOC).length) problems.push(`the stored-row judge refuses a clean document: ${judgeStored(CLEAN_DOC).join('; ')}`);
  for (const [name, doc] of BAD_DOCS) if (judgeStored(doc).length === 0) problems.push(`the stored-row judge accepts ${name}`);

  const base = CHECKS[1];
  const paths = base.paths;
  const lost = base.expected.map((s, i, all) => (i === all.length - 1 ? { ...s, paths: s.paths.slice(0, -1) } : s));
  const swapped = base.expected.map((s, i, all) => (i === all.length - 1 ? { ...s, paths: [s.paths[1], s.paths[0], ...s.paths.slice(2)] } : s));
  const twice = base.expected.map((s, i) => (i === 0 ? { ...s, paths: [...s.paths, s.paths[0]] } : s));
  const renamed = base.expected.map((s, i) => (i === 1 ? { ...s, label: 'other' } : s));
  const reversed = [...base.expected].reverse();
  for (const [name, got] of [['a lost control', lost], ['two controls swapped', swapped], ['a control twice', twice], ['a changed title', renamed], ['sections in reverse', reversed]] as [string, Section[]][])
    if (sectionFindings(name, got, base.expected, paths).length === 0) problems.push(`the section comparison accepts ${name}`);
  if (sectionFindings('clean', base.expected, base.expected, paths).length) problems.push('the section comparison refuses the clean sections');
  return problems;
}

// Question 3.
async function fixtures(): Promise<string[]> {
  const findings: string[] = [];
  for (const check of CHECKS) {
    try {
      const got = buildSections(check.rows, ORDER, check.paths);
      if (canon(got) !== canon(check.expected)) findings.push(`3 ${check.name}: expected ${canon(check.expected)}, got ${canon(got)}`);
    } catch (e) {
      findings.push(`3 ${check.name}: threw ${(e as Error).message}`);
    }
  }
  for (const read of READS) {
    try {
      const got = await read.run();
      if (canon(got) !== canon(read.expected)) findings.push(`3 ${read.name}: expected ${canon(read.expected)}, got ${canon(got)}`);
    } catch (e) {
      findings.push(`3 ${read.name}: threw ${(e as Error).message}`);
    }
  }
  return findings;
}

const QUESTIONS: Record<number, string> = {
  1: 'the stored heading rows are valid',
  2: 'on the real routes of the four scopes, the sections hold every control of the model exactly once, in the model\'s order, as unbroken runs, and with headings planted into the real order they equal an independent cut of that order',
  3: 'hand-written rows, orders and documents give the written sections',
};

function report(summaries: string[], found: Record<number, string[]>) {
  if (summaries.length) console.log(`${summaries.join('\n')}\n`);
  for (const id of [1, 2, 3]) {
    const lines = found[id] ?? [];
    if (!lines.length) console.log(`${id} yes - ${QUESTIONS[id]}\n`);
    else console.log(`${id} NO - ${QUESTIONS[id]}\n${lines.map((l) => `  ${l}`).join('\n')}\n`);
  }
  const bad = [1, 2, 3].some((id) => (found[id] ?? []).length);
  console.log(bad ? 'RESULT: NO' : 'RESULT: PASS');
  return bad ? 1 : 0;
}

try {
  const broken = proofCanFail();
  if (broken.length) {
    console.error(`NO VERDICT: the proof itself is broken\n${broken.map((l) => `  ${l}`).join('\n')}`);
    process.exit(2);
  }
  console.log(
    'Self-check: the written sections agree with a reference and with an independent cut of the order, and say NO to eleven planted defects of the reference (sections in the order they were stored, the last of two headings counting, both counting, a duplicate missed for the text __proto__, an unknown control taking the top, a heading above a missing control ignored, a heading\'s own control left above it, empty sections kept, an empty leading block kept, the icon lost, the key as the title); the stored-row judge passes a clean document and refuses seven bad ones; the section comparison refuses five broken sets.\n',
  );
  const { q1, q2, summaries } = await live();
  const q3 = await fixtures();
  process.exit(report(summaries, { 1: q1, 2: q2, 3: q3 }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
