// Panel writes proof: does a click lead to the right address, and does a range show the right number? PASS or NO. It tells the truth and nothing else.
//
// Two questions. All yes means done:
//   1. clickAddress, with the real URL contract of a hand-written model: a click on an address gives the written address (tick, second tick in the model's order, untick, the last
//      untick removing the key, a tick already set, awkward text and the text __proto__, foreign keys and the sort kept, `page` dropped, a toggle on and off, a range at the full span
//      and over an earlier range, a bad value in another key left alone, and clicks in a row that each start from the address the last one wrote adding up)
//   2. formatRangeValue: the exact price path shows money from cents, every other path shows its number (whole as it is, else one decimal)
// The addresses are compared as their key-value pairs, sorted by key with the order of one key's values kept, so the order of different keys never decides a verdict and the order of one key's values always does.
// No flakiness: every input is literal and every output is written by hand; no clock, no randomness, no network. The money text is compared with the shop's own formatter, so the result does not depend on the machine's locale data.
//
// Human-run: node --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/panelWrites.test.ts
// (it imports nuqs, so node_modules must be reachable)
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: the proof itself is broken.
//
// FLOW  proofCanFail -> fixtures -> report

import { buildUrlContract } from '@/features/product-filtering/url/controlUrl';
import { clickAddress } from '@/features/product-filtering/core/rules/clickAddress';
import { formatRangeValue } from '@/features/product-filtering/core/rules/formatRangeValue';
import { formatPrice, formatPriceMajor } from '@/platform/utils/price';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { PanelClick } from '@/features/product-filtering/core/types/panel';
import type { UrlValue } from '@/features/product-filtering/core/types/urlState';

// A string for comparison: object keys sorted at every level, array order kept.
const canon = (x: unknown): string =>
  JSON.stringify(
    (function sort(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sort((value as Record<string, unknown>)[k])]));
      return value;
    })(x),
  );

// An address as sorted key-value pairs (the sort is stable: one key's values keep their order).
const pairs = (address: string): [string, string][] => [...new URLSearchParams(address)].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

// Alien content: awkward text, look-alike options, the text __proto__, a dotted path, a toggle, a range, a sort.
const MODEL: ControlModel = {
  controls: [
    { path: 'quuxWidth', kind: 'checkbox', label: 'Quux', options: ['wide strap', 'a&b', 'c,d', 'Red', 'red', '__proto__'].map((value) => ({ value, text: value })) },
    { path: 'blipMode.low', kind: 'toggle', label: 'Blips low' },
    { path: 'mass', kind: 'range', label: 'Mass', span: { min: 10, max: 30 } },
    { path: 'maker', kind: 'checkbox', label: 'Maker', options: ['Zed', 'Yu'].map((value) => ({ value, text: value })) },
  ],
  sorts: [{ value: 'mass', text: 'Mass' }],
};
const CONTRACT = buildUrlContract(MODEL);
const OPTION_ORDER: Record<string, string[]> = { quuxWidth: ['wide strap', 'a&b', 'c,d', 'Red', 'red', '__proto__'], maker: ['Zed', 'Yu'] };

const tick = (path: string, value: string, checked = true): PanelClick => ({ kind: 'option', path, value, checked });

type AddressFn = (address: string, click: PanelClick) => string;
type Case = { name: string; address: string; clicks: PanelClick[]; expected: [string, string][]; decodes?: { path: string; value: UrlValue } };
const CASES: Case[] = [
  { name: 'a first tick', address: '', clicks: [tick('quuxWidth', 'Red')], expected: [['quuxWidth', 'Red']] },
  { name: 'a second tick is written in the model\'s order, not the click order', address: '', clicks: [tick('quuxWidth', 'red'), tick('quuxWidth', 'Red')], expected: [['quuxWidth', 'Red'], ['quuxWidth', 'red']] },
  {
    name: 'awkward text survives the address',
    address: '',
    clicks: [tick('quuxWidth', 'wide strap'), tick('quuxWidth', 'a&b'), tick('quuxWidth', 'c,d')],
    expected: [['quuxWidth', 'wide strap'], ['quuxWidth', 'a&b'], ['quuxWidth', 'c,d']],
    decodes: { path: 'quuxWidth', value: ['wide strap', 'a&b', 'c,d'] },
  },
  { name: 'the text __proto__ is an ordinary value', address: '', clicks: [tick('quuxWidth', '__proto__')], expected: [['quuxWidth', '__proto__']], decodes: { path: 'quuxWidth', value: ['__proto__'] } },
  { name: 'an untick removes only that value', address: '?quuxWidth=Red&quuxWidth=red', clicks: [tick('quuxWidth', 'Red', false)], expected: [['quuxWidth', 'red']] },
  { name: 'the last untick removes the key', address: '?quuxWidth=Red', clicks: [tick('quuxWidth', 'Red', false)], expected: [] },
  { name: 'a tick that is already set changes nothing', address: '?quuxWidth=Red', clicks: [tick('quuxWidth', 'Red')], expected: [['quuxWidth', 'Red']] },
  {
    name: 'foreign keys and the sort are kept and the page is dropped',
    address: '?q=abc&sort=mass%3Aasc&page=3',
    clicks: [tick('maker', 'Zed')],
    expected: [['maker', 'Zed'], ['q', 'abc'], ['sort', 'mass:asc']],
  },
  { name: 'a toggle on', address: '', clicks: [{ kind: 'toggle', path: 'blipMode.low', on: true }], expected: [['blipMode.low', 'true']], decodes: { path: 'blipMode.low', value: true } },
  { name: 'a toggle off removes its key', address: '?blipMode.low=true', clicks: [{ kind: 'toggle', path: 'blipMode.low', on: false }], expected: [] },
  { name: 'a range at the full span is written as it is', address: '', clicks: [{ kind: 'range', path: 'mass', min: 10, max: 30 }], expected: [['mass', '10,30']], decodes: { path: 'mass', value: { min: 10, max: 30 } } },
  { name: 'a range replaces the earlier range', address: '?mass=12%2C20', clicks: [{ kind: 'range', path: 'mass', min: 15, max: 25 }], expected: [['mass', '15,25']] },
  { name: 'a value the model does not know is dropped when its key is written', address: '?maker=nobody', clicks: [tick('maker', 'Zed')], expected: [['maker', 'Zed']] },
  { name: 'a bad value in another key is left alone', address: '?mass=banana', clicks: [tick('maker', 'Yu')], expected: [['maker', 'Yu'], ['mass', 'banana']] },
  {
    name: 'clicks in a row, each from the address the last one wrote, add up',
    address: '',
    clicks: [tick('maker', 'Zed'), tick('maker', 'Yu'), { kind: 'toggle', path: 'blipMode.low', on: true }, { kind: 'range', path: 'mass', min: 11, max: 29 }],
    expected: [['blipMode.low', 'true'], ['maker', 'Zed'], ['maker', 'Yu'], ['mass', '11,29']],
  },
];

// The same clicks applied one after the other, each from the address the previous one gave.
const apply = (fn: AddressFn, c: Case): string => c.clicks.reduce((address, click) => fn(address, click), c.address);

// The proof's own implementation of the written rules, on plain URLSearchParams and not on nuqs, one switch per planted defect.
const ADDRESS_DEFECTS = ['stale-base', 'page-kept', 'foreign-dropped', 'tick-replaces', 'order-by-click', 'toggle-false-written', 'range-full-span-dropped', 'sort-dropped', 'unknown-kept'] as const;
type AddressDefect = (typeof ADDRESS_DEFECTS)[number];

function referenceAddress(address: string, click: PanelClick, defect?: AddressDefect): string {
  const params = new URLSearchParams(defect === 'stale-base' ? '' : address);
  if (defect !== 'page-kept') params.delete('page');
  if (defect === 'sort-dropped') params.delete('sort');
  const kept = defect === 'foreign-dropped' ? new URLSearchParams() : params;
  if (click.kind === 'toggle') {
    kept.delete(click.path);
    if (click.on) kept.set(click.path, 'true');
    else if (defect === 'toggle-false-written') kept.set(click.path, 'false');
  } else if (click.kind === 'range') {
    kept.delete(click.path);
    const control = MODEL.controls.find((c) => c.path === click.path);
    const full = control?.kind === 'range' && control.span.min === click.min && control.span.max === click.max;
    if (!(defect === 'range-full-span-dropped' && full)) kept.set(click.path, `${click.min},${click.max}`);
  } else {
    const order = OPTION_ORDER[click.path];
    const current = params.getAll(click.path).filter((v) => defect === 'unknown-kept' || order.includes(v));
    let next = click.checked ? (current.includes(click.value) ? current : [...current, click.value]) : current.filter((v) => v !== click.value);
    if (defect === 'tick-replaces' && click.checked) next = [click.value];
    if (defect !== 'order-by-click') next = [...order.filter((v) => next.includes(v)), ...(defect === 'unknown-kept' ? next.filter((v) => !order.includes(v)) : [])];
    kept.delete(click.path);
    for (const v of next) kept.append(click.path, v);
  }
  return kept.toString();
}

// Question 2: written numbers.
type FormatFn = (path: string, value: number) => string;
const FORMAT_CHECKS: { name: string; path: string; value: number; expected: string }[] = [
  { name: 'the price path shows money from cents', path: 'price_data.unit_amount', value: 12345, expected: formatPrice(12345) },
  { name: 'a price of 0', path: 'price_data.unit_amount', value: 0, expected: formatPrice(0) },
  { name: 'a price of 1999 cents', path: 'price_data.unit_amount', value: 1999, expected: formatPrice(1999) },
  { name: 'a whole number shows as it is', path: 'impedanceOhms', value: 42, expected: '42' },
  { name: 'a fraction shows one decimal', path: 'sensitivityDbMw', value: 98.5, expected: '98.5' },
  { name: 'a small fraction', path: 'cableLengthM', value: 0.1, expected: '0.1' },
  { name: 'a negative whole number', path: 'offset', value: -5, expected: '-5' },
  { name: 'a negative fraction', path: 'offset', value: -1.5, expected: '-1.5' },
  { name: 'only the exact price path is money', path: 'my.price_data.unit_amount', value: 5, expected: '5' },
  { name: 'a large whole number has no separators', path: 'stock', value: 100000, expected: '100000' },
];
const FORMAT_DEFECTS = ['major-units', 'all-money', 'none-money', 'includes-match', 'integers-with-decimal', 'two-decimals'] as const;
type FormatDefect = (typeof FORMAT_DEFECTS)[number];

function referenceFormat(path: string, value: number, defect?: FormatDefect): string {
  const cents = defect === 'includes-match' ? path.includes('price_data.unit_amount') : path === 'price_data.unit_amount';
  if (defect === 'all-money' || (cents && defect !== 'none-money')) return defect === 'major-units' ? formatPriceMajor(value) : formatPrice(value);
  if (defect === 'integers-with-decimal') return value.toFixed(1);
  if (defect === 'two-decimals') return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const differs = (run: () => unknown, expected: unknown): boolean => {
  try {
    return canon(run()) !== canon(expected);
  } catch {
    return true;
  }
};

// The checks can say no: each reference must give the written answers, the written addresses must be the ones the real contract decodes to, and each planted defect must differ somewhere.
function proofCanFail(): string[] {
  const problems: string[] = [];
  for (const c of CASES) if (differs(() => pairs(apply((a, k) => referenceAddress(a, k), c)), c.expected)) problems.push(`the address reference does not give the written address for ${c.name}`);
  for (const d of ADDRESS_DEFECTS) if (!CASES.some((c) => differs(() => pairs(apply((a, k) => referenceAddress(a, k, d), c)), c.expected))) problems.push(`the address cases do not say NO to ${d}`);
  for (const c of FORMAT_CHECKS) if (differs(() => referenceFormat(c.path, c.value), c.expected)) problems.push(`the format reference does not give the written text for ${c.name}`);
  for (const d of FORMAT_DEFECTS) if (!FORMAT_CHECKS.some((c) => differs(() => referenceFormat(c.path, c.value, d), c.expected))) problems.push(`the format cases do not say NO to ${d}`);
  if (formatPrice(12345) === formatPriceMajor(12345)) problems.push('the price case cannot tell cents from major units');
  return problems;
}

function fixtures(): Record<number, string[]> {
  const found: Record<number, string[]> = { 1: [], 2: [] };
  for (const c of CASES) {
    try {
      const final = apply((a, k) => clickAddress(CONTRACT, a, k), c);
      if (canon(pairs(final)) !== canon(c.expected)) found[1].push(`1 ${c.name}: expected ${canon(c.expected)}, got ${canon(pairs(final))} (address ${final || '(empty)'})`);
      if (c.decodes) {
        const got = CONTRACT.decode(final)[c.decodes.path];
        if (canon(got) !== canon(c.decodes.value)) found[1].push(`1 ${c.name}: the address reads back as ${canon(got)}, expected ${canon(c.decodes.value)}`);
      }
    } catch (e) {
      found[1].push(`1 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  for (const c of FORMAT_CHECKS) {
    try {
      const got = formatRangeValue(c.path, c.value);
      if (got !== c.expected) found[2].push(`2 ${c.name}: expected ${JSON.stringify(c.expected)}, got ${JSON.stringify(got)}`);
    } catch (e) {
      found[2].push(`2 ${c.name}: threw ${(e as Error).message}`);
    }
  }
  return found;
}

const QUESTIONS: Record<number, string> = {
  1: 'clickAddress, with the real URL contract: a click on an address gives the written address',
  2: 'formatRangeValue: the exact price path shows money from cents, every other path shows its number',
};

function report(found: Record<number, string[]>) {
  for (const id of [1, 2]) {
    const lines = found[id] ?? [];
    if (!lines.length) console.log(`${id} yes - ${QUESTIONS[id]}\n`);
    else console.log(`${id} NO - ${QUESTIONS[id]}\n${lines.map((l) => `  ${l}`).join('\n')}\n`);
  }
  const bad = [1, 2].some((id) => (found[id] ?? []).length);
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
    `Self-check: the written addresses agree with a reference built on plain URLSearchParams (not on nuqs) and say NO to ${ADDRESS_DEFECTS.length} planted defects (a click computed from a stale address, the page kept, foreign keys dropped, a tick replacing the selection, values in the click order, a toggle written as false, a full-span range dropped, the sort dropped, unknown values kept); the written texts agree with a reference of the format and say NO to ${FORMAT_DEFECTS.length} (cents shown as major units, every path as money, the price as a plain number, a path that only contains the price path as money, whole numbers with a decimal, two decimals).\n`,
  );
  process.exit(report(fixtures()));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
