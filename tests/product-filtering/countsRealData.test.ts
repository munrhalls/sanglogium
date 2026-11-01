// Counts proof: does buildCounts give each option the count the grid would show for it? PASS or NO. It tells the truth and nothing else.
//
// Two questions. All yes means done:
//   1. on the real routes of the four scopes, for sampled states, the count of every option of every checkbox control equals the count the narrowing request returns for that state with that control's selection replaced by that option, taken in the same request as the snapshot the counts are built from
//   2. hand-written products give the written counts
// No flakiness: live, the snapshot and every compared count come from one request, so nothing can change between them; fixtures, the products are literal and the counts are written by hand; no clock, no randomness.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/countsRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> live -> fixtures -> report

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { PUBLISHED } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData, BRAND_NAME } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import { buildControlModel } from '@/features/product-filtering/core/rules/buildControlModel';
import { buildNarrowing } from '@/features/product-filtering/adapters/sanity/buildNarrowing';
import { buildCounts } from '@/features/product-filtering/core/rules/buildCounts';
import type { Control, ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { Counts } from '@/features/product-filtering/core/types/counts';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';
import type { UrlPatch, UrlState } from '@/features/product-filtering/core/types/urlState';
import type { Narrowing } from '@/features/product-filtering/core/types/narrowing';

// A string for comparison: object keys sorted at every level, array order kept.
const canon = (x: unknown): string =>
  JSON.stringify(
    (function sort(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sort((value as Record<string, unknown>)[k])]));
      return value;
    })(x),
  );

// The state of an empty address, by kind: checkbox [], toggle false, range null, sort null.
function defaultsOf(model: ControlModel): UrlState {
  const state: UrlState = {};
  for (const c of model.controls) state[c.path] = c.kind === 'checkbox' ? [] : c.kind === 'toggle' ? false : null;
  state.sort = null;
  return state;
}

const stateOf = (model: ControlModel, patch: UrlPatch): UrlState => ({ ...defaultsOf(model), ...patch });

// Retag a narrowing so many can share one query: every $narrow_ becomes $<tag>_narrow_ and every param key gains the <tag>_ prefix.
const renamed = (n: Narrowing, tag: string): Narrowing => ({
  where: n.where.replace(/\$narrow_/g, `$${tag}_narrow_`),
  order: n.order.replace(/\$narrow_/g, `$${tag}_narrow_`),
  params: Object.fromEntries(Object.entries(n.params).map(([k, v]) => [`${tag}_${k}`, v])),
});

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

type Product = RouteControls['products'][number];
type CountFn = (model: ControlModel, state: UrlState, products: Product[], onProduct: string[]) => Counts;

// Hand-written products: a value held alone or in a list, on the product itself (maker, mass), twice in one list (p4), look-alike text (Red, yu), the text __proto__ (p5), or not at all.
const DOCS: Product[] = [
  { _id: 'p1', maker: 'Zed', mass: 10, filterAttributes: { hue: 'red', tags: ['a', 'b'], glow: true, bursts: [1, 9] } },
  { _id: 'p2', maker: 'Zed', mass: 20, filterAttributes: { hue: 'blue', tags: ['b'], glow: false, bursts: [5] } },
  { _id: 'p3', maker: 'Yu', mass: 20, filterAttributes: { hue: 'red', tags: 'a', glow: true } },
  { _id: 'p4', maker: 'yu', mass: 30, filterAttributes: { hue: 'Red', tags: ['a', 'a'], glow: true, bursts: [20] } },
  { _id: 'p5', filterAttributes: { hue: '__proto__' } },
  { _id: 'p6', maker: 'Zed', mass: 10, filterAttributes: { hue: 'blue', tags: ['c'], bursts: [2, 3] } },
];

const MODEL: ControlModel = {
  controls: [
    { path: 'hue', kind: 'checkbox', label: 'Hue', options: ['red', 'blue', 'Red', '__proto__'].map((v) => ({ value: v, text: v })) },
    { path: 'tags', kind: 'checkbox', label: 'Tags', options: ['a', 'b', 'c', 'd'].map((v) => ({ value: v, text: v })) },
    { path: 'maker', kind: 'checkbox', label: 'Maker', options: ['Zed', 'Yu', 'yu'].map((v) => ({ value: v, text: v })) },
    { path: 'glow', kind: 'toggle', label: 'Glow' },
    { path: 'mass', kind: 'range', label: 'Mass', span: { min: 10, max: 30 } },
    { path: 'bursts', kind: 'range', label: 'Bursts', span: { min: 1, max: 20 } },
  ],
  sorts: [{ value: 'mass', text: 'Mass' }],
};
const NO_CHECKBOX: ControlModel = { controls: MODEL.controls.filter((c) => c.kind !== 'checkbox'), sorts: [] };
const ON_PRODUCT = ['maker', 'mass'];

// The written counts of a case: one row of numbers per checkbox control of MODEL (hue, tags, maker), one number per option in the model's order.
const CHECKBOXES = MODEL.controls.filter((c): c is Extract<Control, { kind: 'checkbox' }> => c.kind === 'checkbox');
const written = (rows: number[][]): Counts =>
  CHECKBOXES.map((c, i) => ({ path: c.path, options: c.options.map((o, j) => ({ value: o.value, count: rows[i][j] })) }));

// The proof's own independent implementation of the written rules, one switch per planted defect.
const DEFECTS = [
  'own-kept', 'others-ignored', 'or-across', 'range-low-exclusive', 'range-high-exclusive', 'no-list', 'no-scalar',
  'toggle-false', 'double-count', 'wrong-place', 'fold', 'missing-matches', 'object-tally', 'omit-zero',
] as const;
type Defect = (typeof DEFECTS)[number];

function referenceCounts(model: ControlModel, state: UrlState, products: Product[], onProduct: string[], defect?: Defect): Counts {
  const walk = (root: unknown, path: string): unknown =>
    path.split('.').reduce<unknown>((o, key) => (o === null || typeof o !== 'object' ? undefined : (o as Record<string, unknown>)[key]), root);
  const itemsAt = (p: Product, path: string): unknown[] => {
    const root = defect !== 'wrong-place' && onProduct.includes(path) ? p : p.filterAttributes;
    const raw = walk(root, path);
    const items = Array.isArray(raw) ? (defect === 'no-list' ? [] : raw) : defect === 'no-scalar' ? [] : [raw];
    return items.filter((x) => x !== undefined && x !== null);
  };
  const key = (v: unknown) => (defect === 'fold' && typeof v === 'string' ? v.toLowerCase() : v);
  const constraint = (c: Control): ((p: Product) => boolean) | null => {
    const sel = state[c.path];
    const lacks = (p: Product) => defect === 'missing-matches' && itemsAt(p, c.path).length === 0;
    if (c.kind === 'checkbox') {
      if (!Array.isArray(sel) || sel.length === 0) return null;
      const want = sel.map(key);
      return (p) => lacks(p) || itemsAt(p, c.path).some((v) => want.includes(key(v)));
    }
    if (c.kind === 'toggle') {
      if (sel !== true) return null;
      return (p) => lacks(p) || itemsAt(p, c.path).some((v) => v === (defect === 'toggle-false' ? false : true));
    }
    if (sel === null || typeof sel !== 'object' || !('min' in sel)) return null;
    const { min, max } = sel as { min: number; max: number };
    return (p) =>
      lacks(p) ||
      itemsAt(p, c.path).some(
        (v) => typeof v === 'number' && (defect === 'range-low-exclusive' ? v > min : v >= min) && (defect === 'range-high-exclusive' ? v < max : v <= max),
      );
  };
  return model.controls.flatMap((c) => {
    if (c.kind !== 'checkbox') return [];
    const preds = (defect === 'others-ignored' ? [] : model.controls.filter((o) => defect === 'own-kept' || o.path !== c.path).map(constraint)).filter(
      (f): f is (p: Product) => boolean => f !== null,
    );
    const pool = products.filter((p) => (defect === 'or-across' ? preds.length === 0 || preds.some((f) => f(p)) : preds.every((f) => f(p))));
    const tally = new Map<string, number>();
    const plain: Record<string, number> = {};
    for (const p of pool) {
      const items = itemsAt(p, c.path).map(key);
      for (const v of defect === 'double-count' ? items : [...new Set(items)]) {
        if (typeof v !== 'string') continue;
        if (defect === 'object-tally') plain[v] = (plain[v] ?? 0) + 1;
        else tally.set(v, (tally.get(v) ?? 0) + 1);
      }
    }
    const read = (v: string): number => (defect === 'object-tally' ? plain[key(v) as string] ?? 0 : tally.get(key(v) as string) ?? 0);
    const options = c.options.map((o) => ({ value: o.value, count: read(o.value) }));
    return [{ path: c.path, options: defect === 'omit-zero' ? options.filter((o) => o.count > 0) : options }];
  });
}

// The written cases: name, patch applied over the defaults with stateOf, the rows hue / tags / maker.
const CASES: [string, UrlPatch, number[][]][] = [
  ['empty state', {}, [[2, 2, 1, 1], [3, 2, 1, 0], [3, 1, 1]]],
  ['a control ignores its own selection', { hue: ['red'] }, [[2, 2, 1, 1], [2, 1, 0, 0], [1, 1, 0]]],
  ['two options of a control are alternatives', { hue: ['red', 'blue'] }, [[2, 2, 1, 1], [2, 2, 1, 0], [3, 1, 0]]],
  ['controls combine', { hue: ['red'], maker: ['Zed'] }, [[1, 2, 0, 0], [1, 1, 0, 0], [1, 1, 0]]],
  ['a toggle on', { glow: true }, [[2, 0, 1, 0], [3, 1, 0, 0], [1, 1, 1]]],
  ['a range includes both ends', { mass: { min: 10, max: 20 } }, [[2, 2, 0, 0], [2, 2, 1, 0], [3, 1, 0]]],
  ['a range over a list', { bursts: { min: 2, max: 5 } }, [[0, 2, 0, 0], [0, 1, 1, 0], [2, 0, 0]]],
  ['a product with no value never matches an active control', { mass: { min: 10, max: 30 } }, [[2, 2, 1, 0], [3, 2, 1, 0], [3, 1, 1]]],
  ['a state with no result', { mass: { min: 100, max: 200 } }, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0]]],
  ['an option still counts when the whole state has no result', { hue: ['Red'], mass: { min: 10, max: 10 } }, [[1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0]]],
  ['a sort in the state changes nothing', { sort: { field: 'mass', direction: 'asc' } }, [[2, 2, 1, 1], [3, 2, 1, 0], [3, 1, 1]]],
  ['look-alike text is another option', { maker: ['Yu'] }, [[1, 0, 0, 0], [1, 0, 0, 0], [3, 1, 1]]],
];

const CHECKS: { name: string; run: (count: CountFn) => Counts; expected: Counts }[] = [
  ...CASES.map(([name, patch, rows]) => ({ name, run: (count: CountFn) => count(MODEL, stateOf(MODEL, patch), DOCS, ON_PRODUCT), expected: written(rows) })),
  { name: 'a model without a checkbox control gives no counts', run: (count) => count(NO_CHECKBOX, stateOf(NO_CHECKBOX, {}), DOCS, ON_PRODUCT), expected: [] },
  { name: 'no products: every option counts 0', run: (count) => count(MODEL, stateOf(MODEL, {}), [], ON_PRODUCT), expected: written([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0]]) },
];

// The checks can say no: the reference counter must give the written counts, and each planted defect must differ somewhere.
function proofCanFail(): string[] {
  const problems: string[] = [];
  for (const check of CHECKS) {
    let got: Counts | undefined;
    let threw: Error | undefined;
    try {
      got = check.run(referenceCounts);
    } catch (e) {
      threw = e as Error;
    }
    if (threw || canon(got) !== canon(check.expected))
      problems.push(`the reference counter does not give the written counts for ${check.name}: expected ${canon(check.expected)}, got ${threw ? `threw ${threw.message}` : canon(got)}`);
  }
  for (const defect of DEFECTS) {
    const differs = CHECKS.some((check) => {
      try {
        return canon(check.run((m, s, p, o) => referenceCounts(m, s, p, o, defect))) !== canon(check.expected);
      } catch {
        return true;
      }
    });
    if (!differs) problems.push(`the cases do not say NO to ${defect}`);
  }
  return problems;
}

type Item = { _id: string; slug?: string; parent?: string };

// The sampled states of a model, built from the model only.
function states(model: ControlModel): { name: string; state: UrlState }[] {
  const out: { name: string; state: UrlState }[] = [];
  const add = (name: string, patch: UrlPatch) => out.push({ name, state: stateOf(model, patch) });
  add('empty', {});
  const checkboxes = model.controls.filter((c): c is Extract<Control, { kind: 'checkbox' }> => c.kind === 'checkbox').filter((c) => c.options.length > 0);
  for (const c of checkboxes) add(`${c.path}: first option`, { [c.path]: [c.options[0].value] });
  const firstTwo = checkboxes.find((c) => c.options.length >= 2);
  if (firstTwo) add(`${firstTwo.path}: first two options`, { [firstTwo.path]: firstTwo.options.slice(0, 2).map((o) => o.value) });
  if (checkboxes.length >= 2)
    add('two checkboxes', {
      [checkboxes[0].path]: [checkboxes[0].options[0].value],
      [checkboxes[1].path]: [checkboxes[1].options[0].value],
    });
  const firstToggle = model.controls.find((c) => c.kind === 'toggle');
  if (firstToggle) add(`${firstToggle.path}: on`, { [firstToggle.path]: true });
  const firstRange = model.controls.find((c) => c.kind === 'range');
  if (firstRange && firstRange.kind === 'range') {
    const { min, max } = firstRange.span;
    const mid = (min + max) / 2;
    add(`${firstRange.path}: lower half`, { [firstRange.path]: { min, max: mid } });
    add(`${firstRange.path}: point`, { [firstRange.path]: { min, max: min } });
    add('a state with no result', { [firstRange.path]: { min: max + 1, max: max + 2 } });
  }
  const combo: UrlPatch = {};
  if (checkboxes.length) combo[checkboxes[0].path] = [checkboxes[0].options[0].value];
  if (firstToggle) combo[firstToggle.path] = true;
  if (firstRange && firstRange.kind === 'range')
    combo[firstRange.path] = { min: firstRange.span.min, max: (firstRange.span.min + firstRange.span.max) / 2 };
  if (Object.keys(combo).length >= 2) add('a combination', combo);
  return out;
}

async function live(): Promise<{ findings: string[]; summaries: string[] }> {
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

  const findings: string[] = [];
  const summaries: string[] = [];
  for (const scope of [...CATEGORIES, 'all-products']) {
    let keys: string[];
    if (scope === 'all-products') keys = items.map((i) => i._id);
    else {
      const root = items.find((i) => !i.parent && i.slug === scope);
      if (!root) throw new Error(`no root catalogue item with slug "${scope}"`);
      keys = subtree(root._id);
    }
    const r = await ask(ROUTE_MAP_QUERY, { keys });
    if (r.status !== 200) throw new Error(`route map read failed for ${scope}: HTTP ${r.status} ${r.error ?? ''}`);
    const answer = await getRouteControls({ fetchRouteMapData: async () => toRouteMapData(r.result) }, { keys, scope });
    if (Object.keys(answer.raw).length === 0) throw new Error(`scope ${scope}: the answer holds no controls`);
    const model = buildControlModel(answer);
    const onProduct = answer.onProduct;
    const checkboxes = model.controls.filter((c): c is Extract<Control, { kind: 'checkbox' }> => c.kind === 'checkbox');
    const optionTotal = checkboxes.reduce((n, c) => n + c.options.length, 0);
    if (optionTotal === 0) throw new Error(`scope ${scope}: the model holds no checkbox option`);
    const list = states(model);
    const perRequest = Math.max(1, Math.floor(400 / optionTotal));
    const scopeFilter = `_type == "product" && ${PUBLISHED} && count(catalogueLocationKeys[@ in $keys]) > 0`;
    const wantShape = canon(checkboxes.map((c) => ({ path: c.path, options: c.options.map((o) => o.value) })));

    const scopeFindings: string[] = [];
    let rejected = false;
    let compared = 0;
    let changed = 0;
    let snapCount = 0;
    let empty: number[] | undefined;
    for (let g = 0; g < list.length; g += perRequest) {
      const group = list.slice(g, g + perRequest);
      const parts: string[] = [];
      const params: Record<string, unknown> = { keys };
      let k = 0;
      for (const s of group) for (const c of checkboxes) for (const o of c.options) {
        const n = renamed(buildNarrowing(model, { ...s.state, [c.path]: [o.value] }, onProduct), `q${k}`);
        parts.push(`"q${k}": count(docs[(${n.where})])`);
        Object.assign(params, n.params);
        k++;
      }
      const q = await ask(
        `{ "docs": *[${scopeFilter}] }{ "snap": docs[]{ _id, "brand": ${BRAND_NAME}, name, price_data, stock, filterAttributes }, ${parts.join(', ')} }`,
        params,
      );
      if (q.status !== 200) {
        scopeFindings.push(`1 ${scope}: the request is rejected: HTTP ${q.status} ${q.error ?? ''}`);
        rejected = true;
        continue;
      }
      const snap = (q.result?.snap ?? []) as Product[];
      if (g === 0) snapCount = snap.length;
      let at = 0;
      for (const s of group) {
        const got = buildCounts(model, s.state, snap, onProduct);
        const oracle: number[] = [];
        if (canon(got.map((c) => ({ path: c.path, options: c.options.map((o) => o.value) }))) !== wantShape) {
          scopeFindings.push(`1 ${scope} / ${s.name}: the counts do not list the model's checkbox controls and options in order`);
          for (const c of checkboxes) for (const o of c.options) oracle.push(q.result[`q${at++}`] as number);
        } else {
          for (let ci = 0; ci < checkboxes.length; ci++) {
            for (let oi = 0; oi < checkboxes[ci].options.length; oi++) {
              const want = q.result[`q${at++}`] as number;
              oracle.push(want);
              compared++;
              if (got[ci].options[oi].count !== want)
                scopeFindings.push(
                  `1 ${scope} / ${s.name} / ${checkboxes[ci].path} = ${JSON.stringify(checkboxes[ci].options[oi].value)}: expected ${want}, got ${got[ci].options[oi].count}`,
                );
            }
          }
        }
        if (empty === undefined && s.name === 'empty') empty = oracle;
        else if (empty !== undefined && canon(oracle) !== canon(empty)) changed++;
      }
    }
    findings.push(...scopeFindings.slice(0, 20));
    if (scopeFindings.length > 20) findings.push(`1 ${scope}: and ${scopeFindings.length - 20} more differences`);
    if (!rejected) {
      if (!empty || !empty.some((n) => n > 0)) throw new Error(`scope ${scope}: no option holds a product`);
      if (changed === 0) throw new Error(`scope ${scope}: no sampled state changes a count`);
    }
    summaries.push(
      `Scope ${scope}: ${snapCount} products, ${checkboxes.length} checkbox controls with ${optionTotal} options, ${list.length} states, ${compared} option counts compared, ${changed} states changed a count from the empty state.`,
    );
  }
  return { findings, summaries };
}

// Question 2: hand-written products give the written counts.
function fixtures(): string[] {
  const findings: string[] = [];
  for (const check of CHECKS) {
    try {
      const got = check.run(buildCounts);
      if (canon(got) !== canon(check.expected)) findings.push(`2 ${check.name}: expected ${canon(check.expected)}, got ${canon(got)}`);
    } catch (e) {
      findings.push(`2 ${check.name}: threw ${(e as Error).message}`);
    }
  }
  return findings;
}

const QUESTIONS: Record<number, string> = {
  1: 'on the real routes of the four scopes, for sampled states, the count of every option of every checkbox control equals the count the narrowing request returns for that state with that control\'s selection replaced by that option, taken in the same request as the snapshot',
  2: 'hand-written products give the written counts',
};

function report(summaries: string[], found: Record<number, string[]>) {
  if (summaries.length) console.log(`${summaries.join('\n')}\n`);
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
    'Self-check: the written counts agree with a reference counter, and say NO to fourteen planted defects of it: the own selection kept, the other controls ignored, alternatives across controls, an exclusive range end, lists or single values ignored, a flipped toggle, a value counted twice, a value read from the wrong place, case folded, a missing value matching, an object keyed by option text, zero options left out.\n',
  );
  const { findings: liveFindings, summaries } = await live();
  const fixtureFindings = fixtures();
  process.exit(report(summaries, { 1: liveFindings, 2: fixtureFindings }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
