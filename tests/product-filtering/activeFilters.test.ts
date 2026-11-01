// Active filters proof: does every active selection have a chip, and does each chip take out exactly its selection? PASS or NO. It tells the truth and nothing else.
//
// Three questions. All yes means done:
//   1. buildChips: a control model and a URL state give the written chips (defaults are no selection, the model's order, an option's text, a toggle by its name, a range as "low to high"
//      also at the full span, money for the price path, the text __proto__ an ordinary option, a value of the wrong shape no selection)
//   2. the invariant, over EVERY state of a small model (96 states, built through the real URL contract and carrying a foreign key, the sort and a page): each active selection has exactly one
//      chip and no chip is extra, also when the panel hides the selected option because it has no product; removing a chip through the address takes out exactly that selection and changes
//      nothing else; removing the chips one after another from the last address ends with none; clear all takes out every selection at once
//   3. hand-written addresses give the written addresses when a chip is removed or all are cleared (foreign keys and the sort kept, `page` dropped, the last option's key removed, a toggle, a range,
//      the price range, a bad value in a control's key cleared)
// No flakiness: every input is literal or enumerated, every expected output is written by hand or built independently from the same literal; no clock, no randomness, no network. The money text is
// compared with the shop's own formatter, so the result does not depend on the machine's locale data.
//
// Human-run: node --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/activeFilters.test.ts
// (it imports nuqs, so node_modules must be reachable)
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: the proof itself is broken.
//
// FLOW  proofCanFail -> fixtures -> report

import { buildUrlContract } from '@/features/product-filtering/url/controlUrl';
import { buildChips } from '@/features/product-filtering/core/rules/buildChips';
import { buildPanel } from '@/features/product-filtering/core/rules/buildPanel';
import { clearAllAddress, removeChipAddress } from '@/features/product-filtering/core/rules/chipAddress';
import { formatPrice } from '@/platform/utils/price';
import type { Chip } from '@/features/product-filtering/core/types/chips';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Counts } from '@/features/product-filtering/core/types/counts';
import type { RangeSelection, UrlContract, UrlPatch, UrlState } from '@/features/product-filtering/core/types/urlState';

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

type ChipsFn = (model: ControlModel, state: UrlState) => Chip[];
type RemoveFn = (contract: UrlContract, address: string, chip: Chip) => string;
type ClearFn = (contract: UrlContract, address: string, model: ControlModel) => string;

// ---- Question 1: the chips ------------------------------------------------------------------------------------------------------

// Alien content: awkward text, look-alike options, the text __proto__, a dotted path, a toggle, a range, the price range (cents).
const MODEL: ControlModel = {
  controls: [
    { path: 'quuxWidth', kind: 'checkbox', label: 'Quux', options: [['wide strap', 'Wide strap'], ['a&b', 'A and B'], ['c,d', 'C or D'], ['Red', 'Capital red'], ['red', 'Small red'], ['__proto__', 'Proto']].map(([value, text]) => ({ value, text })) },
    { path: 'blipMode.low', kind: 'toggle', label: 'Blips low' },
    { path: 'mass', kind: 'range', label: 'Mass', span: { min: 10, max: 30 } },
    { path: 'price_data.unit_amount', kind: 'range', label: 'Price', span: { min: 1000, max: 500000 } },
    { path: 'maker', kind: 'checkbox', label: 'Maker', options: [['Zed', 'Zed works'], ['Yu', 'Yu works']].map(([value, text]) => ({ value, text })) },
  ],
  sorts: [{ value: 'mass', text: 'Mass' }],
};
const CONTRACT = buildUrlContract(MODEL);

const OC = (path: string, label: string, value: string, text: string): Chip => ({ id: JSON.stringify([path, value]), kind: 'option', path, value, label, text });
const TC = (path: string, label: string): Chip => ({ id: JSON.stringify([path]), kind: 'toggle', path, label, text: '' });
const RC = (path: string, label: string, text: string): Chip => ({ id: JSON.stringify([path]), kind: 'range', path, label, text });

const CHIP_CHECKS: { name: string; state: UrlState; expected: Chip[] }[] = [
  { name: 'nothing selected: no chips', state: {}, expected: [] },
  { name: 'defaults are no selection: an empty list, an off toggle, a range not set', state: { quuxWidth: [], 'blipMode.low': false, mass: null, maker: [] }, expected: [] },
  { name: 'a selected option is a chip with the control\'s name and the option\'s text', state: { quuxWidth: ['Red'] }, expected: [OC('quuxWidth', 'Quux', 'Red', 'Capital red')] },
  {
    name: 'the options of one control come in the model\'s order, not the state\'s',
    state: { quuxWidth: ['red', 'Red', 'wide strap'] },
    expected: [OC('quuxWidth', 'Quux', 'wide strap', 'Wide strap'), OC('quuxWidth', 'Quux', 'Red', 'Capital red'), OC('quuxWidth', 'Quux', 'red', 'Small red')],
  },
  {
    name: 'controls come in the model\'s order',
    state: { maker: ['Yu'], 'blipMode.low': true, quuxWidth: ['a&b'] },
    expected: [OC('quuxWidth', 'Quux', 'a&b', 'A and B'), TC('blipMode.low', 'Blips low'), OC('maker', 'Maker', 'Yu', 'Yu works')],
  },
  { name: 'a toggle that is on is a chip with the control\'s name and no text', state: { 'blipMode.low': true }, expected: [TC('blipMode.low', 'Blips low')] },
  { name: 'a range is a chip with both ends', state: { mass: { min: 12, max: 20 } }, expected: [RC('mass', 'Mass', '12 to 20')] },
  { name: 'a range at the full span is still a chip', state: { mass: { min: 10, max: 30 } }, expected: [RC('mass', 'Mass', '10 to 30')] },
  { name: 'the price range shows money from cents', state: { 'price_data.unit_amount': { min: 1000, max: 25000 } }, expected: [RC('price_data.unit_amount', 'Price', `${formatPrice(1000)} to ${formatPrice(25000)}`)] },
  { name: 'the text __proto__ is an ordinary option', state: { quuxWidth: ['__proto__'] }, expected: [OC('quuxWidth', 'Quux', '__proto__', 'Proto')] },
  {
    name: 'a value of the wrong shape is no selection',
    state: { 'blipMode.low': 'yes', mass: { min: 'a', max: 2 }, quuxWidth: 'Red', maker: null } as unknown as UrlState,
    expected: [],
  },
];

const CHIP_DEFECTS = ['state-order', 'toggle-false', 'range-null', 'text-is-value', 'label-lost', 'price-plain', 'one-per-control', 'ids-clash'] as const;
type ChipDefect = (typeof CHIP_DEFECTS)[number];

// The proof's own implementation of the written rules, one switch per planted defect.
function referenceChips(model: ControlModel, state: UrlState, defect?: ChipDefect): Chip[] {
  const out: Chip[] = [];
  const num = (path: string, v: number) => (defect === 'price-plain' ? String(v) : path === 'price_data.unit_amount' ? formatPrice(v) : Number.isInteger(v) ? String(v) : v.toFixed(1));
  for (const c of model.controls) {
    const sel = state[c.path];
    const label = defect === 'label-lost' ? '' : c.label;
    if (c.kind === 'checkbox') {
      if (!Array.isArray(sel)) continue;
      if (defect === 'one-per-control') {
        if (sel.length) out.push({ id: JSON.stringify([c.path]), kind: 'option', path: c.path, value: sel.join(','), label, text: sel.join(', ') });
        continue;
      }
      const values = defect === 'state-order' ? sel : c.options.map((o) => o.value).filter((v) => sel.includes(v));
      for (const v of values) {
        const o = c.options.find((x) => x.value === v);
        out.push({ id: defect === 'ids-clash' ? JSON.stringify([c.path]) : JSON.stringify([c.path, v]), kind: 'option', path: c.path, value: v, label, text: defect === 'text-is-value' ? v : o ? o.text : v });
      }
    } else if (c.kind === 'toggle') {
      if (sel === true || (defect === 'toggle-false' && sel === false)) out.push({ id: JSON.stringify([c.path]), kind: 'toggle', path: c.path, label, text: '' });
    } else {
      const r = sel as RangeSelection | null;
      const set = r !== null && typeof r === 'object' && typeof r.min === 'number' && typeof r.max === 'number';
      if (set) out.push({ id: JSON.stringify([c.path]), kind: 'range', path: c.path, label, text: `${num(c.path, r.min)} to ${num(c.path, r.max)}` });
      else if (defect === 'range-null' && r === null) out.push({ id: JSON.stringify([c.path]), kind: 'range', path: c.path, label, text: 'none' });
    }
  }
  return out;
}

// ---- Question 2: the invariant over every state of a small model -------------------------------------------------------------------

const MODEL2: ControlModel = {
  controls: [
    { path: 'quux', kind: 'checkbox', label: 'Quux', options: ['a', 'b', '__proto__'].map((value) => ({ value, text: `Text ${value}` })) },
    { path: 'blip.low', kind: 'toggle', label: 'Blip' },
    { path: 'mass', kind: 'range', label: 'Mass', span: { min: 0, max: 10 } },
    { path: 'maker', kind: 'checkbox', label: 'Maker', options: [{ value: 'Zed', text: 'Zed works' }] },
  ],
  sorts: [{ value: 'mass', text: 'Mass' }],
};
const CONTRACT2 = buildUrlContract(MODEL2);
const FOREIGN = '?q=abc&sort=mass%3Aasc&page=2';
const CONTROL_KEYS = ['quux', 'blip.low', 'mass', 'maker'];

const subsets = (xs: string[]): string[][] => xs.reduce<string[][]>((acc, x) => [...acc, ...acc.map((s) => [...s, x])], [[]]);
type Selection = { quux: string[]; blip: boolean; mass: RangeSelection | null; maker: string[] };
const STATES: Selection[] = [];
for (const quux of subsets(['a', 'b', '__proto__'])) for (const blip of [false, true]) for (const mass of [null, { min: 0, max: 10 }, { min: 2, max: 5 }] as (RangeSelection | null)[]) for (const maker of subsets(['Zed'])) STATES.push({ quux, blip, mass, maker });

const patchOf = (s: Selection): UrlPatch => ({ quux: s.quux, 'blip.low': s.blip, mass: s.mass, maker: s.maker });
// The ids the state must have chips for, in the model's order, written from the selection and not from the rule.
const idsOf = (s: Selection): string[] => [
  ...s.quux.map((v) => JSON.stringify(['quux', v])),
  ...(s.blip ? [JSON.stringify(['blip.low'])] : []),
  ...(s.mass ? [JSON.stringify(['mass'])] : []),
  ...s.maker.map((v) => JSON.stringify(['maker', v])),
];
// The selection with the one selection of an id taken out.
function without(s: Selection, id: string): Selection {
  const [path, value] = JSON.parse(id) as [string, string | undefined];
  if (path === 'quux') return { ...s, quux: s.quux.filter((v) => v !== value) };
  if (path === 'maker') return { ...s, maker: s.maker.filter((v) => v !== value) };
  if (path === 'blip.low') return { ...s, blip: false };
  return { ...s, mass: null };
}
const controlsOf = (state: UrlState) => ({ quux: state.quux, blip: state['blip.low'], mass: state.mass, maker: state.maker });
const EMPTY: Selection = { quux: [], blip: false, mass: null, maker: [] };

function invariantFindings(chipsOf: ChipsFn, removeOf: RemoveFn, clearOf: ClearFn): string[] {
  const found: string[] = [];
  const note = (msg: string) => {
    if (found.length < 12) found.push(msg);
  };
  let n = 0;
  for (const s of STATES) {
    n++;
    const where = `state ${canon(s)}`;
    const address0 = CONTRACT2.encode(FOREIGN, patchOf(s));
    const state0 = deepFreeze(CONTRACT2.decode(address0));
    const chips = chipsOf(MODEL2, state0);
    // (a) each active selection has exactly one chip, none is extra, ids are unique
    if (canon(chips.map((c) => c.id)) !== canon(idsOf(s))) note(`2 ${where}: the chips are ${canon(chips.map((c) => c.id))}, the selections are ${canon(idsOf(s))}`);
    if (new Set(chips.map((c) => c.id)).size !== chips.length) note(`2 ${where}: two chips share an id`);
    // (e) the panel hides every selected option when none has a product, and the chips still list them
    const counts: Counts = MODEL2.controls.flatMap((c) =>
      c.kind === 'checkbox' ? [{ path: c.path, options: c.options.map((o) => ({ value: o.value, count: (state0[c.path] as string[]).includes(o.value) ? 0 : 1 })) }] : [],
    );
    const panel = buildPanel(MODEL2, [{ key: '', label: '', icon: '', paths: CONTROL_KEYS }], counts, state0);
    const shown = panel.sections.flatMap((sec) => sec.controls).flatMap((c) => (c.kind === 'checkbox' ? c.options.filter((o) => o.ticked) : []));
    if (shown.length > 0) note(`2 ${where}: the panel still shows a selected option with no product (the proof's own precondition)`);
    // (b) removing one chip takes out exactly that selection and nothing else
    for (const chip of chips) {
      const address1 = removeOf(CONTRACT2, address0, chip);
      const expected = without(s, chip.id);
      if (canon(controlsOf(CONTRACT2.decode(address1))) !== canon(expected)) note(`2 ${where}: removing ${chip.id} gives ${canon(controlsOf(CONTRACT2.decode(address1)))}, expected ${canon(expected)}`);
      if (canon(pairs(address1).filter(([k]) => !CONTROL_KEYS.includes(k))) !== canon([['q', 'abc'], ['sort', 'mass:asc']])) note(`2 ${where}: removing ${chip.id} changed a key that is not a selection: ${address1}`);
    }
    // (d) removing the first chip again and again, each from the address the last one gave, ends with none
    let address = address0;
    let steps = 0;
    for (let guard = 0; guard < 20; guard++) {
      const left = chipsOf(MODEL2, CONTRACT2.decode(address));
      if (left.length === 0) break;
      address = removeOf(CONTRACT2, address, left[0]);
      steps++;
    }
    if (steps !== chips.length || chipsOf(MODEL2, CONTRACT2.decode(address)).length !== 0) note(`2 ${where}: removing chip after chip took ${steps} steps and did not end with none`);
    // (c) clear all takes out every selection at once and keeps every other key
    const cleared = clearOf(CONTRACT2, address0, MODEL2);
    if (canon(controlsOf(CONTRACT2.decode(cleared))) !== canon(EMPTY)) note(`2 ${where}: clear all left ${canon(controlsOf(CONTRACT2.decode(cleared)))}`);
    if (canon(pairs(cleared)) !== canon([['q', 'abc'], ['sort', 'mass:asc']])) note(`2 ${where}: clear all gave ${cleared}, expected only q and sort`);
  }
  if (n !== 96) note(`2 the proof enumerates ${n} states, not 96`);
  return found;
}

// ---- Question 3: written addresses -------------------------------------------------------------------------------------------------

type AddressCheck = { name: string; address: string; act: { remove: string } | { clear: true }; expected: [string, string][] };
const ADDRESS_CHECKS: AddressCheck[] = [
  { name: 'removing one of two options leaves the other', address: '?quuxWidth=Red&quuxWidth=red', act: { remove: JSON.stringify(['quuxWidth', 'red']) }, expected: [['quuxWidth', 'Red']] },
  { name: 'removing the last option removes the key', address: '?quuxWidth=Red', act: { remove: JSON.stringify(['quuxWidth', 'Red']) }, expected: [] },
  { name: 'removing a toggle chip', address: '?blipMode.low=true', act: { remove: JSON.stringify(['blipMode.low']) }, expected: [] },
  { name: 'removing a range chip', address: '?mass=10%2C30', act: { remove: JSON.stringify(['mass']) }, expected: [] },
  { name: 'removing the price range chip', address: '?price_data.unit_amount=1000%2C25000', act: { remove: JSON.stringify(['price_data.unit_amount']) }, expected: [] },
  {
    name: 'removing a chip keeps foreign keys, the sort and the other controls, and drops the page',
    address: '?q=abc&sort=mass%3Aasc&page=3&maker=Zed&quuxWidth=Red',
    act: { remove: JSON.stringify(['quuxWidth', 'Red']) },
    expected: [['maker', 'Zed'], ['q', 'abc'], ['sort', 'mass:asc']],
  },
  { name: 'clear all removes every selection and keeps the rest', address: '?q=abc&sort=mass%3Aasc&page=3&maker=Zed&quuxWidth=Red', act: { clear: true }, expected: [['q', 'abc'], ['sort', 'mass:asc']] },
  { name: 'clear all removes a range, a toggle and a price range', address: '?mass=10%2C30&blipMode.low=true&price_data.unit_amount=1000%2C2000&q=abc', act: { clear: true }, expected: [['q', 'abc']] },
  { name: 'clear all on an address with no selection changes nothing but the page', address: '?q=abc&page=2', act: { clear: true }, expected: [['q', 'abc']] },
  { name: 'clear all on the empty address', address: '', act: { clear: true }, expected: [] },
  { name: 'clear all also clears a bad value in a control\'s key', address: '?maker=nobody&mass=banana', act: { clear: true }, expected: [] },
];

function addressFindings(removeOf: RemoveFn, clearOf: ClearFn): string[] {
  const found: string[] = [];
  for (const c of ADDRESS_CHECKS) {
    try {
      let got: string;
      if ('remove' in c.act) {
        const id = c.act.remove;
        const chip = buildChips(MODEL, CONTRACT.decode(c.address)).find((x) => x.id === id);
        if (!chip) {
          found.push(`3 ${c.name}: there is no chip ${id} for the address`);
          continue;
        }
        got = removeOf(CONTRACT, c.address, chip);
      } else got = clearOf(CONTRACT, c.address, MODEL);
      if (canon(pairs(got)) !== canon(c.expected)) found.push(`3 ${c.name}: expected ${canon(c.expected)}, got ${canon(pairs(got))} (address ${got || '(empty)'})`);
    } catch (e) {
      found.push(`3 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  return found;
}

// ---- Mutants of the real functions: each must be refused by the checks -------------------------------------------------------------

const MUTANTS: { name: string; chips?: ChipsFn; remove?: RemoveFn; clear?: ClearFn }[] = [
  { name: 'chips drop every option after the first of a control', chips: (m, s) => buildChips(m, s).filter((c, i, all) => c.kind !== 'option' || all.findIndex((x) => x.path === c.path) === i) },
  {
    name: 'chips hide an option the panel would hide',
    chips: (m, s) => {
      const counts: Counts = m.controls.flatMap((c) => (c.kind === 'checkbox' ? [{ path: c.path, options: c.options.map((o) => ({ value: o.value, count: (s[c.path] as string[]).includes(o.value) ? 0 : 1 })) }] : []));
      const shown = buildPanel(m, [{ key: '', label: '', icon: '', paths: m.controls.map((c) => c.path) }], counts, s).sections.flatMap((sec) => sec.controls);
      return buildChips(m, s).filter((c) => c.kind !== 'option' || shown.some((x) => x.path === c.path));
    },
  },
  { name: 'removing an option takes out the whole control', remove: (k, a, c) => (c.kind === 'option' ? k.encode(a, { [c.path]: null }) : removeChipAddress(k, a, c)) },
  { name: 'removing a range writes its full span', remove: (k, a, c) => (c.kind === 'range' ? k.encode(a, { [c.path]: { min: 0, max: 10 } }) : removeChipAddress(k, a, c)) },
  { name: 'removing a toggle changes nothing', remove: (k, a, c) => (c.kind === 'toggle' ? k.encode(a, {}) : removeChipAddress(k, a, c)) },
  { name: 'clear all leaves the ranges', clear: (k, a, m) => k.encode(a, Object.fromEntries(m.controls.filter((c) => c.kind !== 'range').map((c) => [c.path, null]))) },
  { name: 'clear all writes into an empty address', clear: (k, _a, m) => clearAllAddress(k, '', m) },
];

const differs = (run: () => unknown, expected: unknown): boolean => {
  try {
    return canon(run()) !== canon(expected);
  } catch {
    return true;
  }
};

// The checks can say no: the reference must give the written chips, the independent checks must pass the real functions and refuse each mutant, and each planted defect must differ somewhere.
function proofCanFail(): string[] {
  const problems: string[] = [];
  for (const c of CHIP_CHECKS) if (differs(() => referenceChips(MODEL, deepFreeze(c.state)), c.expected)) problems.push(`the chip reference does not give the written chips for ${c.name}`);
  for (const d of CHIP_DEFECTS) if (!CHIP_CHECKS.some((c) => differs(() => referenceChips(MODEL, deepFreeze(c.state), d), c.expected))) problems.push(`the chip cases do not say NO to ${d}`);
  for (const m of MUTANTS) {
    const inv = invariantFindings(m.chips ?? buildChips, m.remove ?? removeChipAddress, m.clear ?? clearAllAddress);
    const addr = m.chips ? [] : addressFindings(m.remove ?? removeChipAddress, m.clear ?? clearAllAddress);
    if (inv.length === 0 && addr.length === 0) problems.push(`the checks of questions 2 and 3 do not refuse the mutant "${m.name}"`);
  }
  return problems;
}

function fixtures(): Record<number, string[]> {
  const found: Record<number, string[]> = { 1: [], 2: [], 3: [] };
  for (const c of CHIP_CHECKS) {
    try {
      const got = buildChips(MODEL, deepFreeze(c.state));
      if (canon(got) !== canon(c.expected)) found[1].push(`1 ${c.name}: expected ${canon(c.expected)}, got ${canon(got)}`);
    } catch (e) {
      found[1].push(`1 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  try {
    found[2].push(...invariantFindings(buildChips, removeChipAddress, clearAllAddress));
  } catch (e) {
    found[2].push(`2 threw ${(e as Error).message}`);
  }
  found[3].push(...addressFindings(removeChipAddress, clearAllAddress));
  return found;
}

const QUESTIONS: Record<number, string> = {
  1: 'buildChips: a control model and a URL state give the written chips',
  2: 'over every state of a small model: each active selection has exactly one chip (also when the panel hides it), removing a chip takes out exactly its selection, chip after chip ends with none, clear all takes out every selection',
  3: 'hand-written addresses give the written addresses when a chip is removed or all are cleared',
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
    `Self-check: the written chips agree with a reference and say NO to ${CHIP_DEFECTS.length} planted defects of it (options in the state's order, a chip for an off toggle, a chip for a range not set, an option shown as its value, the control's name lost, the price as a plain number, one chip per control, ids that clash); the checks of questions 2 and 3 refuse ${MUTANTS.length} mutants of the real functions (options dropped after the first, an option hidden as the panel hides it, a whole control taken out, a range written at its full span, a toggle left on, ranges left by clear all, clear all losing the other keys).\n`,
  );
  process.exit(report(fixtures()));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
