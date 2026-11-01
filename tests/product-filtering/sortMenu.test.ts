// Sort menu proof: does the menu offer the model's sorts, show the current one, and write the chosen one? PASS or NO. It tells the truth and nothing else.
//
// Three questions. All yes means done:
//   1. buildSortOptions: a control model gives the written menu (the route's own order first, each sort ascending then descending, in the model's order, the words for a text sort and for a number sort,
//      no sorts no menu, a field with a colon and the text __proto__ kept whole)
//   2. currentSortId: the URL's sort gives the written entry (no sort or a sort that is not an entry is the route's own order, each entry is found by field and direction, wrong shapes are no sort)
//   3. sortAddress, with the real URL contract: choosing an entry gives the written address (the sort replaced, the route's own order removing it, filters and foreign keys kept, `page` dropped, awkward fields),
//      and EVERY entry, chosen from the address of EVERY entry, reads back as the current entry with one sort key in the address
// No flakiness: every input is literal and every expected output is written by hand or enumerated from the same literal; no clock, no randomness, no network.
//
// Human-run: node --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/sortMenu.test.ts
// (it imports nuqs, so node_modules must be reachable)
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: the proof itself is broken.
//
// FLOW  proofCanFail -> fixtures -> report

import { buildUrlContract } from '@/features/product-filtering/url/controlUrl';
import { buildSortOptions } from '@/features/product-filtering/core/rules/buildSortOptions';
import { currentSortId } from '@/features/product-filtering/core/rules/currentSortId';
import { sortAddress } from '@/features/product-filtering/core/rules/sortAddress';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { SortOption } from '@/features/product-filtering/core/types/sortMenu';
import type { UrlContract, UrlValue } from '@/features/product-filtering/core/types/urlState';

// A string for comparison: object keys sorted at every level, array order kept.
const canon = (x: unknown): string =>
  JSON.stringify(
    (function sort(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sort((value as Record<string, unknown>)[k])]));
      return value;
    })(x),
  );

// Frozen at every level: a rule that changes its input throws, which is a finding.
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') for (const v of Object.values(value)) deepFreeze(v);
  return Object.freeze(value);
}

// An address as sorted key-value pairs (the sort is stable: one key's values keep their order).
const pairs = (address: string): [string, string][] => [...new URLSearchParams(address)].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

const MAKER = { path: 'maker', kind: 'checkbox' as const, label: 'Maker', options: [{ value: 'Zed', text: 'Zed works' }, { value: 'Yu', text: 'Yu works' }] };
const model = (sorts: [string, string][]): ControlModel => ({ controls: [MAKER], sorts: sorts.map(([value, text]) => ({ value, text })) });
// Alien content: the price path (a number), the text sort, a plain number, a field with a colon, the text __proto__.
const MODEL = model([['price_data.unit_amount', 'Price'], ['name', 'Name'], ['impedanceOhms', 'Impedance'], ['a:b', 'Colon'], ['__proto__', 'Proto']]);
const CONTRACT = buildUrlContract(MODEL);

const DEFAULT: SortOption = { id: '', label: 'Recently added', selection: null };
const SO = (field: string, direction: 'asc' | 'desc', label: string): SortOption => ({ id: JSON.stringify([field, direction]), label, selection: { field, direction } });
const PAIR = (field: string, text: string, up: string, down: string): SortOption[] => [SO(field, 'asc', `${text}: ${up}`), SO(field, 'desc', `${text}: ${down}`)];
const NUM = 'low to high';
const NUM_DOWN = 'high to low';
const EXPECTED_MENU: SortOption[] = [
  DEFAULT,
  ...PAIR('price_data.unit_amount', 'Price', NUM, NUM_DOWN),
  ...PAIR('name', 'Name', 'A to Z', 'Z to A'),
  ...PAIR('impedanceOhms', 'Impedance', NUM, NUM_DOWN),
  ...PAIR('a:b', 'Colon', NUM, NUM_DOWN),
  ...PAIR('__proto__', 'Proto', NUM, NUM_DOWN),
];

// ---- Question 1: the menu --------------------------------------------------------------------------------------------------------

type MenuCheck = { name: string; model: ControlModel; expected: SortOption[] };
const MENU_CHECKS: MenuCheck[] = [
  { name: 'a model with no sort has no menu', model: model([]), expected: [] },
  { name: 'one number sort: the route\'s own order, then ascending and descending', model: model([['impedanceOhms', 'Impedance']]), expected: [DEFAULT, ...PAIR('impedanceOhms', 'Impedance', NUM, NUM_DOWN)] },
  { name: 'the text sort `name` reads A to Z', model: model([['name', 'Name']]), expected: [DEFAULT, ...PAIR('name', 'Name', 'A to Z', 'Z to A')] },
  { name: 'only the exact field `name` is text', model: model([['nameTag', 'Tag']]), expected: [DEFAULT, ...PAIR('nameTag', 'Tag', NUM, NUM_DOWN)] },
  { name: 'sorts come in the model\'s order, ascending before descending; a colon and __proto__ stay whole', model: MODEL, expected: EXPECTED_MENU },
];

const MENU_DEFECTS = ['desc-first', 'default-missing', 'default-last', 'name-wording-lost', 'words-for-all', 'one-direction', 'label-lost', 'prefix-name'] as const;
type MenuDefect = (typeof MENU_DEFECTS)[number];

// The proof's own implementation of the written rules, one switch per planted defect.
function referenceMenu(m: ControlModel, defect?: MenuDefect): SortOption[] {
  if (m.sorts.length === 0) return defect === 'default-missing' ? [] : [];
  const out: SortOption[] = [];
  for (const s of m.sorts) {
    const isText = defect === 'prefix-name' ? s.value.startsWith('name') : s.value === 'name';
    const words = defect === 'words-for-all' ? ['A to Z', 'Z to A'] : isText && defect !== 'name-wording-lost' ? ['A to Z', 'Z to A'] : [NUM, NUM_DOWN];
    const label = (w: string) => (defect === 'label-lost' ? w : `${s.text}: ${w}`);
    const asc = SO(s.value, 'asc', label(words[0]));
    const desc = SO(s.value, 'desc', label(words[1]));
    out.push(...(defect === 'desc-first' ? [desc, asc] : defect === 'one-direction' ? [asc] : [asc, desc]));
  }
  if (defect === 'default-missing') return out;
  return defect === 'default-last' ? [...out, DEFAULT] : [DEFAULT, ...out];
}

// ---- Question 2: the current entry -----------------------------------------------------------------------------------------------

const idOf = (field: string, direction: 'asc' | 'desc') => JSON.stringify([field, direction]);
const CURRENT_CHECKS: { name: string; sort: UrlValue | undefined; expected: string }[] = [
  { name: 'no sort is the route\'s own order', sort: null, expected: '' },
  { name: 'a missing sort is the route\'s own order', sort: undefined, expected: '' },
  { name: 'an ascending sort is found', sort: { field: 'price_data.unit_amount', direction: 'asc' }, expected: idOf('price_data.unit_amount', 'asc') },
  { name: 'a descending sort of the same field is another entry', sort: { field: 'price_data.unit_amount', direction: 'desc' }, expected: idOf('price_data.unit_amount', 'desc') },
  { name: 'the text sort', sort: { field: 'name', direction: 'desc' }, expected: idOf('name', 'desc') },
  { name: 'a field with a colon', sort: { field: 'a:b', direction: 'asc' }, expected: idOf('a:b', 'asc') },
  { name: 'the text __proto__', sort: { field: '__proto__', direction: 'desc' }, expected: idOf('__proto__', 'desc') },
  { name: 'a sort that is not an entry is the route\'s own order', sort: { field: 'weight', direction: 'asc' }, expected: '' },
  { name: 'a direction that is not asc or desc is the route\'s own order', sort: { field: 'name', direction: 'up' } as unknown as UrlValue, expected: '' },
  { name: 'values of the wrong shape are no sort', sort: ['name'] as unknown as UrlValue, expected: '' },
  { name: 'a range-shaped value is no sort', sort: { min: 1, max: 2 }, expected: '' },
  { name: 'a text is no sort', sort: 'name:asc' as unknown as UrlValue, expected: '' },
];
const CURRENT_DEFECTS = ['first-when-absent', 'ignores-direction', 'throws-on-null', 'throws-on-text'] as const;
type CurrentDefect = (typeof CURRENT_DEFECTS)[number];

function referenceCurrent(options: SortOption[], sort: UrlValue | undefined, defect?: CurrentDefect): string {
  if (defect === 'throws-on-null') return (sort as { field: string; direction: string }).field === undefined ? '' : '';
  if (defect === 'throws-on-text' && sort !== null && sort !== undefined && 'field' in (sort as object)) return referenceCurrent(options, sort);
  const real = options.filter((o) => o.selection !== null);
  const s = sort as { field?: unknown; direction?: unknown } | null | undefined;
  if (s === null || s === undefined || typeof s !== 'object' || Array.isArray(s) || typeof s.field !== 'string') return defect === 'first-when-absent' ? real[0].id : '';
  const hits = real.filter((o) => o.selection!.field === s.field && (defect === 'ignores-direction' || o.selection!.direction === s.direction));
  const hit = hits[0];
  return hit ? hit.id : defect === 'first-when-absent' ? real[0].id : '';
}

// ---- Question 3: the addresses ---------------------------------------------------------------------------------------------------

type AddressFn = (contract: UrlContract, address: string, options: SortOption[], id: string) => string;
type AddressCheck = { name: string; address: string; id: string; expected: [string, string][] };
const ADDRESS_CHECKS: AddressCheck[] = [
  { name: 'choosing a sort writes it', address: '', id: idOf('price_data.unit_amount', 'desc'), expected: [['sort', 'price_data.unit_amount:desc']] },
  { name: 'choosing the route\'s own order removes the sort', address: '?sort=name%3Aasc', id: '', expected: [] },
  { name: 'a sort replaces the earlier sort', address: '?sort=name%3Aasc', id: idOf('price_data.unit_amount', 'asc'), expected: [['sort', 'price_data.unit_amount:asc']] },
  { name: 'filters and foreign keys are kept and the page is dropped', address: '?maker=Zed&q=abc&page=3', id: idOf('name', 'desc'), expected: [['maker', 'Zed'], ['q', 'abc'], ['sort', 'name:desc']] },
  { name: 'a field with a colon', address: '', id: idOf('a:b', 'asc'), expected: [['sort', 'a:b:asc']] },
  { name: 'the text __proto__', address: '', id: idOf('__proto__', 'desc'), expected: [['sort', '__proto__:desc']] },
  { name: 'an id that is not an entry means the route\'s own order', address: '?sort=name%3Aasc&maker=Yu', id: 'nonsense', expected: [['maker', 'Yu']] },
  { name: 'choosing the route\'s own order keeps the filters and drops the page', address: '?sort=name%3Adesc&maker=Zed&page=2', id: '', expected: [['maker', 'Zed']] },
];

function addressFindings(fn: AddressFn): string[] {
  const found: string[] = [];
  const options = buildSortOptions(MODEL);
  for (const c of ADDRESS_CHECKS) {
    try {
      const got = fn(CONTRACT, c.address, options, c.id);
      if (canon(pairs(got)) !== canon(c.expected)) found.push(`3 ${c.name}: expected ${canon(c.expected)}, got ${canon(pairs(got))} (address ${got || '(empty)'})`);
    } catch (e) {
      found.push(`3 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  // Every entry, chosen from the address of every entry: the address carries at most one sort key and reads back as exactly that entry.
  let n = 0;
  for (const from of options) {
    const start = sortAddress(CONTRACT, '?maker=Yu', options, from.id);
    for (const to of options) {
      n++;
      try {
        const got = fn(CONTRACT, start, options, to.id);
        const sortKeys = pairs(got).filter(([k]) => k === 'sort').length;
        if (sortKeys > 1) found.push(`3 from ${from.id || 'default'} to ${to.id || 'default'}: ${sortKeys} sort keys in ${got}`);
        const back = currentSortId(options, CONTRACT.decode(got).sort);
        if (back !== to.id) found.push(`3 from ${from.id || 'default'} to ${to.id || 'default'}: the address ${got || '(empty)'} reads back as ${back || 'default'}`);
        if (canon(pairs(got).filter(([k]) => k !== 'sort')) !== canon([['maker', 'Yu']])) found.push(`3 from ${from.id || 'default'} to ${to.id || 'default'}: the filter did not survive: ${got}`);
      } catch (e) {
        found.push(`3 from ${from.id} to ${to.id}: threw ${(e as Error).message}`);
      }
    }
  }
  if (n !== options.length * options.length) found.push('3 the proof did not visit every pair of entries');
  return found.slice(0, 15);
}

// Mutants of the real address function: each must be refused by the checks above.
const ADDRESS_MUTANTS: { name: string; fn: AddressFn }[] = [
  { name: 'the route\'s own order leaves the old sort', fn: (k, a, o, id) => (id === '' ? k.encode(a, {}) : sortAddress(k, a, o, id)) },
  { name: 'the sort is written into an empty address (filters lost)', fn: (k, _a, o, id) => sortAddress(k, '', o, id) },
  { name: 'the page is kept', fn: (k, a, o, id) => { const out = sortAddress(k, a, o, id); const page = new URLSearchParams(a).get('page'); return page ? `${out}${out ? '&' : '?'}page=${page}` : out; } },
  { name: 'a second sort key is added instead of replacing', fn: (k, a, o, id) => { const out = sortAddress(k, a, o, id); return id === '' || !a.includes('sort=') ? out : `${out}&sort=${new URLSearchParams(a).get('sort')}`; } },
  { name: 'an unknown id writes an undefined sort', fn: (k, a, o, id) => (o.some((x) => x.id === id) ? sortAddress(k, a, o, id) : k.encode(a, { sort: { field: id, direction: 'asc' } })) },
];

const differs = (run: () => unknown, expected: unknown): boolean => {
  try {
    return canon(run()) !== canon(expected);
  } catch {
    return true;
  }
};

// The checks can say no: each reference must give the written answers and each planted defect must differ somewhere; the address checks must refuse each mutant (the real function is judged by question 3).
function proofCanFail(): string[] {
  const problems: string[] = [];
  for (const c of MENU_CHECKS) if (differs(() => referenceMenu(deepFreeze(c.model)), c.expected)) problems.push(`the menu reference does not give the written menu for ${c.name}`);
  for (const d of MENU_DEFECTS) if (!MENU_CHECKS.some((c) => differs(() => referenceMenu(deepFreeze(c.model), d), c.expected))) problems.push(`the menu cases do not say NO to ${d}`);
  for (const c of CURRENT_CHECKS) if (differs(() => referenceCurrent(EXPECTED_MENU, c.sort), c.expected)) problems.push(`the current-entry reference does not give the written entry for ${c.name}`);
  for (const d of CURRENT_DEFECTS) if (!CURRENT_CHECKS.some((c) => differs(() => referenceCurrent(EXPECTED_MENU, c.sort, d), c.expected))) problems.push(`the current-entry cases do not say NO to ${d}`);
  for (const m of ADDRESS_MUTANTS) if (addressFindings(m.fn).length === 0) problems.push(`the address checks do not refuse the mutant "${m.name}"`);
  return problems;
}

function fixtures(): Record<number, string[]> {
  const found: Record<number, string[]> = { 1: [], 2: [], 3: [] };
  for (const c of MENU_CHECKS) {
    try {
      const got = buildSortOptions(deepFreeze(c.model));
      if (canon(got) !== canon(c.expected)) found[1].push(`1 ${c.name}: expected ${canon(c.expected)}, got ${canon(got)}`);
    } catch (e) {
      found[1].push(`1 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  const menu = deepFreeze(buildSortOptions(MODEL));
  for (const c of CURRENT_CHECKS) {
    try {
      const got = currentSortId(menu, c.sort);
      if (got !== c.expected) found[2].push(`2 ${c.name}: expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(got)}`);
    } catch (e) {
      found[2].push(`2 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  found[3].push(...addressFindings(sortAddress));
  return found;
}

const QUESTIONS: Record<number, string> = {
  1: 'buildSortOptions: a control model gives the written menu',
  2: 'currentSortId: the URL\'s sort gives the written entry',
  3: 'sortAddress, with the real URL contract: choosing an entry gives the written address, and every entry chosen from every entry reads back as itself',
};

function report(found: Record<number, string[]>) {
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
    `Self-check: the written menu and the written current entries agree with a reference of each rule, and say NO to ${MENU_DEFECTS.length} planted defects of the menu (descending first, the route's own order missing or last, the text words lost or used for every field, one direction only, the sort's name lost, every field that starts with "name" taken as text) and ${CURRENT_DEFECTS.length} of the current entry (the first entry when there is no sort, the direction ignored, a crash on null, a crash on a text); the address checks refuse ${ADDRESS_MUTANTS.length} mutants (the route's own order leaving the old sort, filters lost, the page kept, two sort keys, an unknown id written).\n`,
  );
  process.exit(report(fixtures()));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
