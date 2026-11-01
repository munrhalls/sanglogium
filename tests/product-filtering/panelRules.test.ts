// Panel rules proof: do the three pure rules of the filter panel give what is written? PASS or NO. It tells the truth and nothing else.
//
// Three questions. All yes means done:
//   1. buildPanel: a control model, sections, counts and a URL state give the written panel (zero options hidden, an option's text and count carried, ticked flags by exact value,
//      a ticked option at 0 hidden, an empty control and an empty section left out, a toggle and a range never left out, the given order kept, the text __proto__ an ordinary option)
//   2. clickPatch: a click gives the written URL patch (tick, second tick, untick, the last untick, setting what is set, look-alike text, a state without the key, a toggle on and off,
//      a range committed also at the full span, only the clicked key in the patch, the state read and never changed)
//   3. windowOptions: a list of options gives the written window (14, 15 and 16 options, collapsed and expanded, ticked options among the first 7 and beyond them, every option beyond
//      the 7th ticked, a long list, no options, nothing moved)
// Nothing is read from the CMS: the rules read only their arguments, and the shape of each argument is proven where it is made (the model in S2, the counts in S5, the sections in S6a).
// No flakiness: every input is literal and every output is written by hand; no clock, no randomness, no network.
//
// Human-run: node --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/panelRules.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: the proof itself is broken.
//
// FLOW  proofCanFail -> fixtures -> report

import { buildPanel } from '@/features/product-filtering/core/rules/buildPanel';
import { clickPatch } from '@/features/product-filtering/core/rules/clickPatch';
import { windowOptions } from '@/features/product-filtering/core/rules/windowOptions';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Counts } from '@/features/product-filtering/core/types/counts';
import type { OptionWindow, Panel, PanelClick, PanelControl, PanelOption, PanelSection } from '@/features/product-filtering/core/types/panel';
import type { Section } from '@/features/product-filtering/core/types/sections';
import type { RangeSelection, UrlPatch, UrlState } from '@/features/product-filtering/core/types/urlState';

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

// ---- Question 1: the panel ------------------------------------------------------------------------------------------------------

const O = (value: string, text: string, count: number, ticked = false): PanelOption => ({ value, text, count, ticked });
const CB = (path: string, label: string, options: PanelOption[]): PanelControl => ({ path, kind: 'checkbox', label, options });
const TG = (path: string, label: string, on: boolean): PanelControl => ({ path, kind: 'toggle', label, on });
const RG = (path: string, label: string, min: number, max: number, selected: RangeSelection | null): PanelControl => ({ path, kind: 'range', label, span: { min, max }, selected });
const PS = (key: string, label: string, icon: string, controls: PanelControl[]): PanelSection => ({ key, label, icon, controls });
const S = (key: string, label: string, icon: string, paths: string[]): Section => ({ key, label, icon, paths });

// Alien content in the real shapes. Look-alike options (red, Red), the text __proto__, a toggle, a range.
const MODEL: ControlModel = {
  controls: [
    { path: 'hue', kind: 'checkbox', label: 'Hue', options: [{ value: 'red', text: 'Red tone' }, { value: 'blue', text: 'Blue tone' }, { value: 'Red', text: 'Capital tone' }, { value: '__proto__', text: 'Proto tone' }] },
    { path: 'tags', kind: 'checkbox', label: 'Tags', options: [{ value: 'a', text: 'Tag A' }, { value: 'b', text: 'Tag B' }, { value: 'c', text: 'Tag C' }] },
    { path: 'glow', kind: 'toggle', label: 'Glow' },
    { path: 'mass', kind: 'range', label: 'Mass', span: { min: 10, max: 30 } },
    { path: 'maker', kind: 'checkbox', label: 'Maker', options: [{ value: 'Zed', text: 'Zed works' }, { value: 'Yu', text: 'Yu works' }] },
  ],
  sorts: [],
};
const SECTIONS: Section[] = [S('', '', '', ['hue', 'tags']), S('glow', 'Light', 'tag', ['glow', 'mass']), S('maker', 'Making', '', ['maker'])];

// Counts in the model's order: the options of hue (red, blue, Red, __proto__), of tags (a, b, c) and of maker (Zed, Yu), one number each.
const HUE = ['red', 'blue', 'Red', '__proto__'];
const TAGS = ['a', 'b', 'c'];
const MAKER = ['Zed', 'Yu'];
const countsOf = (hue: number[], tags: number[], maker: number[]): Counts => [
  { path: 'hue', options: HUE.map((value, i) => ({ value, count: hue[i] })) },
  { path: 'tags', options: TAGS.map((value, i) => ({ value, count: tags[i] })) },
  { path: 'maker', options: MAKER.map((value, i) => ({ value, count: maker[i] })) },
];
const COUNTS = countsOf([2, 0, 1, 3], [1, 1, 0], [3, 0]);
const NO_COUNTS = countsOf([0, 0, 0, 0], [0, 0, 0], [0, 0]);
const LIGHT = PS('glow', 'Light', 'tag', [TG('glow', 'Glow', false), RG('mass', 'Mass', 10, 30, null)]);
const HUE_CB = CB('hue', 'Hue', [O('red', 'Red tone', 2), O('Red', 'Capital tone', 1), O('__proto__', 'Proto tone', 3)]);
const TAGS_CB = CB('tags', 'Tags', [O('a', 'Tag A', 1), O('b', 'Tag B', 1)]);
const MAKER_CB = CB('maker', 'Maker', [O('Zed', 'Zed works', 3)]);

type PanelFn = (model: ControlModel, sections: Section[], counts: Counts, state: UrlState) => Panel;
type PanelCheck = { name: string; model?: ControlModel; sections?: Section[]; counts: Counts; state: UrlState; expected: Panel };
const PANEL_CHECKS: PanelCheck[] = [
  {
    name: 'zero options are hidden; text, count and the model\'s order are kept; a toggle is off and a range unselected',
    counts: COUNTS,
    state: {},
    expected: { sections: [PS('', '', '', [HUE_CB, TAGS_CB]), LIGHT, PS('maker', 'Making', '', [MAKER_CB])] },
  },
  {
    name: 'ticked options are flagged by exact value; a toggle is on; a range shows its selection',
    counts: COUNTS,
    state: { hue: ['red'], tags: ['b'], maker: ['Zed'], glow: true, mass: { min: 12, max: 20 } },
    expected: {
      sections: [
        PS('', '', '', [
          CB('hue', 'Hue', [O('red', 'Red tone', 2, true), O('Red', 'Capital tone', 1), O('__proto__', 'Proto tone', 3)]),
          CB('tags', 'Tags', [O('a', 'Tag A', 1), O('b', 'Tag B', 1, true)]),
        ]),
        PS('glow', 'Light', 'tag', [TG('glow', 'Glow', true), RG('mass', 'Mass', 10, 30, { min: 12, max: 20 })]),
        PS('maker', 'Making', '', [CB('maker', 'Maker', [O('Zed', 'Zed works', 3, true)])]),
      ],
    },
  },
  {
    name: 'the text __proto__ is an ordinary option',
    counts: COUNTS,
    state: { hue: ['__proto__'] },
    expected: {
      sections: [
        PS('', '', '', [CB('hue', 'Hue', [O('red', 'Red tone', 2), O('Red', 'Capital tone', 1), O('__proto__', 'Proto tone', 3, true)]), TAGS_CB]),
        LIGHT,
        PS('maker', 'Making', '', [MAKER_CB]),
      ],
    },
  },
  {
    name: 'a ticked option whose count is 0 is hidden like any other',
    counts: COUNTS,
    state: { hue: ['blue'] },
    expected: { sections: [PS('', '', '', [HUE_CB, TAGS_CB]), LIGHT, PS('maker', 'Making', '', [MAKER_CB])] },
  },
  {
    name: 'a checkbox control with no option left is left out; its section stays while another control is left',
    counts: countsOf([2, 0, 1, 3], [0, 0, 0], [3, 0]),
    state: {},
    expected: { sections: [PS('', '', '', [HUE_CB]), LIGHT, PS('maker', 'Making', '', [MAKER_CB])] },
  },
  {
    name: 'a section with no control left is left out',
    counts: countsOf([2, 0, 1, 3], [1, 1, 0], [0, 0]),
    state: {},
    expected: { sections: [PS('', '', '', [HUE_CB, TAGS_CB]), LIGHT] },
  },
  {
    name: 'a toggle and a range are never left out, even when every checkbox is empty',
    counts: NO_COUNTS,
    state: {},
    expected: { sections: [LIGHT] },
  },
  {
    name: 'counts that list nothing give every option a count of 0',
    counts: [],
    state: {},
    expected: { sections: [LIGHT] },
  },
  {
    name: 'a toggle is on only for true and a range is selected only by numbers',
    counts: COUNTS,
    state: { glow: 'yes', mass: { min: 'a', max: 2 } } as unknown as UrlState,
    expected: { sections: [PS('', '', '', [HUE_CB, TAGS_CB]), LIGHT, PS('maker', 'Making', '', [MAKER_CB])] },
  },
  {
    name: 'sections and their controls come in the order given',
    sections: [S('maker', 'Making', '', ['maker']), S('glow', 'Light', 'tag', ['glow', 'mass']), S('', '', '', ['tags', 'hue'])],
    counts: COUNTS,
    state: {},
    expected: { sections: [PS('maker', 'Making', '', [MAKER_CB]), LIGHT, PS('', '', '', [TAGS_CB, HUE_CB])] },
  },
  {
    name: 'a path the model lacks is skipped, and a control no section holds is not drawn',
    sections: [S('', '', '', ['hue', 'ghost']), S('x', 'X', '', ['ghost2'])],
    counts: COUNTS,
    state: {},
    expected: { sections: [PS('', '', '', [HUE_CB])] },
  },
  { name: 'no sections give an empty panel', sections: [], counts: COUNTS, state: {}, expected: { sections: [] } },
  { name: 'a model with no control gives an empty panel', model: { controls: [], sorts: [] }, counts: COUNTS, state: {}, expected: { sections: [] } },
];

// ---- Question 2: the clicks -----------------------------------------------------------------------------------------------------

const STATE: UrlState = { hue: ['red', 'Red'], tags: [], glow: false, mass: null, sort: { field: 'mass', direction: 'asc' } };
const tick = (path: string, value: string, checked: boolean): PanelClick => ({ kind: 'option', path, value, checked });

type ClickFn = (state: UrlState, click: PanelClick) => UrlPatch;
type ClickCheck = { name: string; state: UrlState; click: PanelClick; expected: UrlPatch };
const CLICK_CHECKS: ClickCheck[] = [
  { name: 'a first tick', state: { hue: [] }, click: tick('hue', 'red', true), expected: { hue: ['red'] } },
  { name: 'a second tick is added after the first; the patch names only the clicked key', state: STATE, click: tick('hue', 'blue', true), expected: { hue: ['red', 'Red', 'blue'] } },
  { name: 'an untick removes only that value', state: STATE, click: tick('hue', 'red', false), expected: { hue: ['Red'] } },
  { name: 'the last untick leaves an empty selection', state: { hue: ['red'] }, click: tick('hue', 'red', false), expected: { hue: [] } },
  { name: 'a tick that is already set changes nothing', state: STATE, click: tick('hue', 'red', true), expected: { hue: ['red', 'Red'] } },
  { name: 'an untick that is not set changes nothing', state: STATE, click: tick('hue', 'blue', false), expected: { hue: ['red', 'Red'] } },
  { name: 'look-alike text is another option (tick)', state: { hue: ['red'] }, click: tick('hue', 'Red', true), expected: { hue: ['red', 'Red'] } },
  { name: 'look-alike text is another option (untick)', state: { hue: ['red', 'Red'] }, click: tick('hue', 'Red', false), expected: { hue: ['red'] } },
  { name: 'the text __proto__ is an ordinary value (tick)', state: { hue: [] }, click: tick('hue', '__proto__', true), expected: { hue: ['__proto__'] } },
  { name: 'the text __proto__ is an ordinary value (untick)', state: { hue: ['__proto__', 'red'] }, click: tick('hue', '__proto__', false), expected: { hue: ['red'] } },
  { name: 'a state without the key reads as no selection', state: {}, click: tick('hue', 'red', true), expected: { hue: ['red'] } },
  { name: 'a state with a value of the wrong shape reads as no selection', state: { hue: 'x' } as unknown as UrlState, click: tick('hue', 'red', true), expected: { hue: ['red'] } },
  { name: 'a null selection reads as none', state: { hue: null }, click: tick('hue', 'red', false), expected: { hue: [] } },
  { name: 'a toggle set on', state: STATE, click: { kind: 'toggle', path: 'glow', on: true }, expected: { glow: true } },
  { name: 'a toggle set off', state: { glow: true }, click: { kind: 'toggle', path: 'glow', on: false }, expected: { glow: false } },
  { name: 'a range commits what it is given', state: STATE, click: { kind: 'range', path: 'mass', min: 12, max: 20 }, expected: { mass: { min: 12, max: 20 } } },
  { name: 'a range at the full span is committed as it is', state: STATE, click: { kind: 'range', path: 'mass', min: 10, max: 30 }, expected: { mass: { min: 10, max: 30 } } },
  { name: 'a range with equal ends', state: STATE, click: { kind: 'range', path: 'mass', min: 15, max: 15 }, expected: { mass: { min: 15, max: 15 } } },
];

// ---- Question 3: the windows ----------------------------------------------------------------------------------------------------

// n options in a fixed order, the listed indices ticked. Counts rise with the index, so a re-sort by count would move every option.
const opts = (n: number, ticked: number[] = []): PanelOption[] => Array.from({ length: n }, (_, i) => O(`v${i}`, `Wump ${i}`, i + 1, ticked.includes(i)));
// The options of a list at the written indices, from a to b both included.
const span = (list: PanelOption[], a: number, b: number): PanelOption[] => list.slice(a, b + 1);
const L14 = opts(14);
const L15 = opts(15);
const L16 = opts(16);
const L16_T = opts(16, [2, 9, 14]);
const L16_ALL = opts(16, [7, 8, 9, 10, 11, 12, 13, 14, 15]);
const L16_X = opts(16, [9]);
const L16_E = opts(16, [6, 7]);
const L40 = opts(40, [39]);
const L10 = opts(10, [8]);

type WindowFn = (options: PanelOption[], expanded: boolean) => OptionWindow;
type WindowCheck = { name: string; options: PanelOption[]; expanded: boolean; expected: OptionWindow };
const WINDOW_CHECKS: WindowCheck[] = [
  { name: '14 options: all shown, no button', options: L14, expanded: false, expected: { head: span(L14, 0, 13), pinned: [], toggle: null } },
  { name: '15 options: all shown, no button', options: L15, expanded: false, expected: { head: span(L15, 0, 14), pinned: [], toggle: null } },
  { name: '16 options collapsed: the first 7 in place and "more"', options: L16, expanded: false, expected: { head: span(L16, 0, 6), pinned: [], toggle: 'more' } },
  { name: '16 options expanded: all in place and "less"', options: L16, expanded: true, expected: { head: span(L16, 0, 15), pinned: [], toggle: 'less' } },
  {
    name: 'collapsed with ticked options: the one among the first 7 stays in place, the ones beyond are kept apart in order',
    options: L16_T,
    expanded: false,
    expected: { head: span(L16_T, 0, 6), pinned: [L16_T[9], L16_T[14]], toggle: 'more' },
  },
  { name: 'every option beyond the 7th ticked: all kept apart and no "more"', options: L16_ALL, expanded: false, expected: { head: span(L16_ALL, 0, 6), pinned: span(L16_ALL, 7, 15), toggle: null } },
  { name: 'expanded with a ticked option beyond the 7th: all in place and "less"', options: L16_X, expanded: true, expected: { head: span(L16_X, 0, 15), pinned: [], toggle: 'less' } },
  { name: 'the 7th option is in place and the 8th is beyond', options: L16_E, expanded: false, expected: { head: span(L16_E, 0, 6), pinned: [L16_E[7]], toggle: 'more' } },
  { name: 'a long list: only the ticked last option is kept apart', options: L40, expanded: false, expected: { head: span(L40, 0, 6), pinned: [L40[39]], toggle: 'more' } },
  { name: 'no options: nothing and no button', options: [], expanded: false, expected: { head: [], pinned: [], toggle: null } },
  { name: 'a short list with a ticked option: nothing kept apart', options: L10, expanded: false, expected: { head: span(L10, 0, 9), pinned: [], toggle: null } },
];

// ---- The proof's own implementations, one switch per planted defect --------------------------------------------------------------

const PANEL_DEFECTS = [
  'zero-shown', 'ticked-zero-kept', 'empty-control-kept', 'empty-section-kept', 'order-by-count', 'object-tally',
  'ticked-fold', 'toggle-truthy', 'range-span-default', 'toggle-left-out', 'text-is-value', 'resort-sections',
] as const;
type PanelDefect = (typeof PANEL_DEFECTS)[number];

function referencePanel(model: ControlModel, sections: Section[], counts: Counts, state: UrlState, defect?: PanelDefect): Panel {
  const firstIndex = (s: Section) => model.controls.findIndex((c) => c.path === s.paths[0]);
  const ordered = defect === 'resort-sections' ? [...sections].sort((a, b) => firstIndex(a) - firstIndex(b)) : sections;
  const countOf = (path: string, value: string): number => {
    const entry = counts.find((c) => c.path === path);
    if (!entry) return 0;
    if (defect === 'object-tally') {
      const plain: Record<string, number> = {};
      for (const o of entry.options) plain[o.value] = o.count;
      return plain[value];
    }
    return entry.options.find((o) => o.value === value)?.count ?? 0;
  };
  const out: PanelSection[] = [];
  for (const section of ordered) {
    const controls: PanelControl[] = [];
    for (const path of section.paths) {
      const control = model.controls.find((c) => c.path === path);
      if (!control) continue;
      const sel = state[path];
      if (control.kind === 'checkbox') {
        let options: PanelOption[] = control.options.map((o) => ({
          value: o.value,
          text: defect === 'text-is-value' ? o.value : o.text,
          count: countOf(path, o.value),
          ticked: Array.isArray(sel) && sel.some((v) => (defect === 'ticked-fold' ? v.toLowerCase() === o.value.toLowerCase() : v === o.value)),
        }));
        options = options.filter((o) => (defect === 'zero-shown' ? true : defect === 'ticked-zero-kept' ? o.count > 0 || o.ticked : o.count > 0));
        if (defect === 'order-by-count') options.sort((a, b) => b.count - a.count);
        if (options.length > 0 || defect === 'empty-control-kept') controls.push({ path, kind: 'checkbox', label: control.label, options });
      } else if (control.kind === 'toggle') {
        if (defect !== 'toggle-left-out') controls.push({ path, kind: 'toggle', label: control.label, on: defect === 'toggle-truthy' ? Boolean(sel) : sel === true });
      } else {
        const r = sel as RangeSelection | null;
        const picked = r !== null && typeof r === 'object' && typeof r.min === 'number' && typeof r.max === 'number';
        controls.push({
          path,
          kind: 'range',
          label: control.label,
          span: { min: control.span.min, max: control.span.max },
          selected: picked ? { min: r.min, max: r.max } : defect === 'range-span-default' ? { min: control.span.min, max: control.span.max } : null,
        });
      }
    }
    if (controls.length > 0 || defect === 'empty-section-kept') out.push({ key: section.key, label: section.label, icon: section.icon, controls });
  }
  return { sections: out };
}

const CLICK_DEFECTS = ['tick-duplicates', 'untick-ignored', 'mutates-state', 'replace-selection', 'fold', 'other-keys-copied', 'range-swapped', 'toggle-inverted', 'unknown-state-throws'] as const;
type ClickDefect = (typeof CLICK_DEFECTS)[number];

function referenceClick(state: UrlState, click: PanelClick, defect?: ClickDefect): UrlPatch {
  if (click.kind === 'toggle') return { [click.path]: defect === 'toggle-inverted' ? !click.on : click.on };
  if (click.kind === 'range') return { [click.path]: defect === 'range-swapped' ? { min: click.max, max: click.min } : { min: click.min, max: click.max } };
  const now = state[click.path];
  const same = (a: string, b: string) => (defect === 'fold' ? a.toLowerCase() === b.toLowerCase() : a === b);
  const list: string[] = defect === 'mutates-state' || defect === 'unknown-state-throws' ? (now as string[]) : Array.isArray(now) ? [...now] : [];
  let next: string[];
  if (click.checked) {
    if (defect === 'replace-selection') next = [click.value];
    else if (defect === 'tick-duplicates' || !list.some((v) => same(v, click.value))) {
      if (defect === 'mutates-state') {
        list.push(click.value);
        next = list;
      } else next = [...list, click.value];
    } else next = list;
  } else next = defect === 'untick-ignored' ? list : list.filter((v) => !same(v, click.value));
  const patch = { [click.path]: next };
  return defect === 'other-keys-copied' ? { ...state, ...patch } : patch;
}

const WINDOW_DEFECTS = [
  'threshold-too-low', 'threshold-too-high', 'first-eight', 'first-six', 'ticked-hoisted', 'pinned-includes-head', 'pinned-missing',
  'more-always', 'more-never', 'less-missing', 'expanded-ignored', 'resorted',
] as const;
type WindowDefect = (typeof WINDOW_DEFECTS)[number];

function referenceWindow(options: PanelOption[], expanded: boolean, defect?: WindowDefect): OptionWindow {
  const limit = defect === 'threshold-too-low' ? 14 : defect === 'threshold-too-high' ? 16 : 15;
  const first = defect === 'first-eight' ? 8 : defect === 'first-six' ? 6 : 7;
  const list = defect === 'resorted' ? [...options].sort((a, b) => b.count - a.count) : options;
  if (list.length <= limit) return { head: [...list], pinned: [], toggle: null };
  if (expanded && defect !== 'expanded-ignored') return { head: [...list], pinned: [], toggle: defect === 'less-missing' ? null : 'less' };
  let head = list.slice(0, first);
  const rest = list.slice(first);
  if (defect === 'ticked-hoisted') head = [...head.filter((o) => o.ticked), ...head.filter((o) => !o.ticked)];
  const pinned = defect === 'pinned-missing' ? [] : (defect === 'pinned-includes-head' ? list : rest).filter((o) => o.ticked);
  const hidden = rest.some((o) => !o.ticked);
  const toggle = defect === 'more-never' ? null : defect === 'more-always' ? 'more' : hidden ? 'more' : null;
  return { head, pinned, toggle };
}

// ---- Running the checks ---------------------------------------------------------------------------------------------------------

const runPanel = (c: PanelCheck, fn: PanelFn) => fn(deepFreeze(c.model ?? MODEL), deepFreeze(c.sections ?? SECTIONS), deepFreeze(c.counts), deepFreeze(c.state));
const runClick = (c: ClickCheck, fn: ClickFn) => fn(deepFreeze(c.state), deepFreeze(c.click));
const runWindow = (c: WindowCheck, fn: WindowFn) => fn(deepFreeze(c.options), c.expanded);

const differs = (run: () => unknown, expected: unknown): boolean => {
  try {
    return canon(run()) !== canon(expected);
  } catch {
    return true;
  }
};

// The checks can say no: each reference must give the written answers, and each planted defect must differ somewhere.
function proofCanFail(): string[] {
  const problems: string[] = [];
  for (const c of PANEL_CHECKS) if (differs(() => runPanel(c, referencePanel), c.expected)) problems.push(`the panel reference does not give the written panel for ${c.name}`);
  for (const d of PANEL_DEFECTS) if (!PANEL_CHECKS.some((c) => differs(() => runPanel(c, (m, s, n, st) => referencePanel(m, s, n, st, d)), c.expected))) problems.push(`the panel cases do not say NO to ${d}`);
  for (const c of CLICK_CHECKS) if (differs(() => runClick(c, referenceClick), c.expected)) problems.push(`the click reference does not give the written patch for ${c.name}`);
  for (const d of CLICK_DEFECTS) if (!CLICK_CHECKS.some((c) => differs(() => runClick(c, (s, k) => referenceClick(s, k, d)), c.expected))) problems.push(`the click cases do not say NO to ${d}`);
  for (const c of WINDOW_CHECKS) if (differs(() => runWindow(c, referenceWindow), c.expected)) problems.push(`the window reference does not give the written window for ${c.name}`);
  for (const d of WINDOW_DEFECTS) if (!WINDOW_CHECKS.some((c) => differs(() => runWindow(c, (o, e) => referenceWindow(o, e, d)), c.expected))) problems.push(`the window cases do not say NO to ${d}`);
  return problems;
}

function fixtures(): Record<number, string[]> {
  const found: Record<number, string[]> = { 1: [], 2: [], 3: [] };
  const judge = (id: number, name: string, run: () => unknown, expected: unknown) => {
    try {
      const got = run();
      if (canon(got) !== canon(expected)) found[id].push(`${id} ${name}: expected ${canon(expected)}, got ${canon(got)}`);
    } catch (e) {
      found[id].push(`${id} ${name}: threw ${(e as Error).message}`);
    }
  };
  for (const c of PANEL_CHECKS) judge(1, c.name, () => runPanel(c, buildPanel), c.expected);
  for (const c of CLICK_CHECKS) judge(2, c.name, () => runClick(c, clickPatch), c.expected);
  for (const c of WINDOW_CHECKS) judge(3, c.name, () => runWindow(c, windowOptions), c.expected);
  return found;
}

const QUESTIONS: Record<number, string> = {
  1: 'buildPanel: a control model, sections, counts and a URL state give the written panel',
  2: 'clickPatch: a click gives the written URL patch',
  3: 'windowOptions: a list of options gives the written window',
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
    `Self-check: the written answers agree with a reference of each rule, and say NO to ${PANEL_DEFECTS.length} planted defects of the panel (zero options shown, a ticked zero option kept, an empty control kept, an empty section kept, options ordered by count, counts kept in a plain object, ticked flags case-folded, a toggle on for any truthy value, a range defaulting to its span, toggles left out, the option's value shown as its text, sections re-sorted), ${CLICK_DEFECTS.length} of the click (a tick added twice, an untick ignored, the state changed, the selection replaced, case folded, other keys copied, range ends swapped, a toggle inverted, a missing selection throwing) and ${WINDOW_DEFECTS.length} of the window (thresholds one too low and too high, the first 8 or 6, ticked options hoisted, the ticked among the first 7 also kept apart, nothing kept apart, "more" always or never, "less" missing, the expanded flag ignored, options re-sorted).\n`,
  );
  process.exit(report(fixtures()));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
