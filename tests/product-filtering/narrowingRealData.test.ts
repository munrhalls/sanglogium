// Narrowing proof: does buildNarrowing turn the shopper's state into a where, an order and params the way the written rules say? PASS or NO. It tells the truth and nothing else.
//
// Two questions. All yes means done:
//   1. on the real routes of the four scopes, for sampled states, the product ids the request returns, in order, equal those an independent in-memory derivation gives from one snapshot read in the same request
//   2. hand-written products sent through the real query engine give the written ids in the written order
// No flakiness: live, the snapshot and every compared result come from one request, so nothing can change between them; fixtures, the products are literal and sent with the query, so no stored data is read; no clock, no randomness.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/narrowingRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> live -> fixtures -> report

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { PUBLISHED } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData, BRAND_NAME } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import { buildControlModel } from '@/features/product-filtering/core/rules/buildControlModel';
import { buildNarrowing } from '@/features/product-filtering/adapters/sanity/buildNarrowing';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
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

// Hand-written products: a value held alone (one), in a list (list, nums), on the product itself (name, price_data.unit_amount, stock), or not at all.
const DOCS = [
  { _id: 'a', _createdAt: '2026-01-01T00:00:00Z', name: 'alpha', price_data: { unit_amount: 100 }, stock: 5, filterAttributes: { one: 'x', list: ['x', 'y'], flag: true, num: 3, nums: [1, 9], rate: 2 } },
  { _id: 'b', _createdAt: '2026-01-02T00:00:00Z', name: 'Beta', price_data: { unit_amount: 100 }, stock: 0, filterAttributes: { one: 'y', list: ['y'], flag: false, num: 7, rate: 1 } },
  { _id: 'c', _createdAt: '2026-01-03T00:00:00Z', name: 'gamma', price_data: { unit_amount: 50 }, stock: 9, filterAttributes: { list: 'x', nums: [20] } },
  { _id: 'd', _createdAt: '2026-01-04T00:00:00Z', filterAttributes: {} },
  { _id: 'e', _createdAt: '2026-01-03T00:00:00Z', name: 'Delta', price_data: { unit_amount: 50 }, filterAttributes: {} },
];

const MODEL: ControlModel = {
  controls: [
    { path: 'one', kind: 'checkbox', label: 'One', options: [{ value: 'x', text: 'x' }, { value: 'y', text: 'y' }] },
    { path: 'list', kind: 'checkbox', label: 'List', options: [{ value: 'x', text: 'x' }, { value: 'y', text: 'y' }] },
    { path: 'flag', kind: 'toggle', label: 'Flag' },
    { path: 'num', kind: 'range', label: 'Num', span: { min: 3, max: 7 } },
    { path: 'nums', kind: 'range', label: 'Nums', span: { min: 1, max: 20 } },
    { path: 'stock', kind: 'range', label: 'Stock', span: { min: 0, max: 9 } },
  ],
  sorts: [{ value: 'price_data.unit_amount', text: 'Price' }, { value: 'name', text: 'Name' }, { value: 'rate', text: 'Rate' }],
};

const ON_PRODUCT = ['price_data.unit_amount', 'name', 'stock'];

const PRICE = 'price_data.unit_amount';

// The written cases: name, patch (the state is stateOf(MODEL, patch)), expected ids in order.
const CASES: [string, UrlPatch, string[]][] = [
  ['empty', {}, ['d', 'c', 'e', 'b', 'a']],
  ['a scalar option', { one: ['x'] }, ['a']],
  ['two options are alternatives', { one: ['x', 'y'] }, ['b', 'a']],
  ['an option held alone or in a list', { list: ['x'] }, ['c', 'a']],
  ['another option in a list', { list: ['y'] }, ['b', 'a']],
  ['toggle on', { flag: true }, ['a']],
  ['a range includes both ends', { num: { min: 3, max: 7 } }, ['b', 'a']],
  ['a range with no product', { num: { min: 4, max: 6 } }, []],
  ['a range over a list: a low item', { nums: { min: 1, max: 2 } }, ['a']],
  ['a range over a list: a lone item', { nums: { min: 15, max: 25 } }, ['c']],
  ['a range on a field of the product itself', { stock: { min: 0, max: 5 } }, ['b', 'a']],
  ['controls combine', { list: ['y'], num: { min: 1, max: 5 } }, ['a']],
  ['controls combine to nothing', { one: ['y'], flag: true }, []],
  ['price ascending, none last, ties newest then id', { sort: { field: PRICE, direction: 'asc' } }, ['c', 'e', 'b', 'a', 'd']],
  ['price descending', { sort: { field: PRICE, direction: 'desc' } }, ['b', 'a', 'c', 'e', 'd']],
  ['name ascending ignores case', { sort: { field: 'name', direction: 'asc' } }, ['a', 'b', 'e', 'c', 'd']],
  ['name descending', { sort: { field: 'name', direction: 'desc' } }, ['c', 'e', 'b', 'a', 'd']],
  ['a sort on a pick, none last in default order', { sort: { field: 'rate', direction: 'asc' } }, ['b', 'a', 'd', 'c', 'e']],
  ['the same descending', { sort: { field: 'rate', direction: 'desc' } }, ['a', 'b', 'd', 'c', 'e']],
  ['a filter with a sort', { list: ['x'], sort: { field: PRICE, direction: 'asc' } }, ['c', 'a']],
];

// Retag a narrowing so many can share one query: every $narrow_ becomes $<tag>_narrow_ and every param key gains the <tag>_ prefix.
const renamed = (n: Narrowing, tag: string): Narrowing => ({
  where: n.where.replace(/\$narrow_/g, `$${tag}_narrow_`),
  order: n.order.replace(/\$narrow_/g, `$${tag}_narrow_`),
  params: Object.fromEntries(Object.entries(n.params).map(([k, v]) => [`${tag}_${k}`, v])),
});

// Findings on the params of one narrowing; empty when every name is narrow_<i>_(in|min|max) and is used by where or order.
function paramFindings(n: Narrowing): string[] {
  const findings: string[] = [];
  for (const key of Object.keys(n.params)) {
    if (!/^narrow_\d+_(in|min|max)$/.test(key)) findings.push(`param "${key}" is not named narrow_<i>_(in|min|max)`);
    if (!n.where.includes(`$${key}`) && !n.order.includes(`$${key}`)) findings.push(`param "${key}" is not used by where or order`);
  }
  return findings;
}

// Send all twenty cases through the real query engine in ONE request over the literal docs. A rejected request is returned, not thrown: a planted defect may be rejected.
async function runDocs(build: (model: ControlModel, state: UrlState, onProduct: string[]) => Narrowing) {
  const parts: string[] = [];
  const params: Record<string, unknown> = { docs: DOCS };
  for (let k = 0; k < CASES.length; k++) {
    const n = renamed(build(MODEL, stateOf(MODEL, CASES[k][1]), ON_PRODUCT), `c${k}`);
    parts.push(`"r${k}": $docs[(${n.where})] | order(${n.order}) { _id }`);
    Object.assign(params, n.params);
  }
  const a = await ask(`{ ${parts.join(', ')} }`, params);
  if (a.status !== 200) return { error: `HTTP ${a.status} ${a.error ?? ''}` };
  return { ids: CASES.map((_, k) => ((a.result?.[`r${k}`] ?? []) as { _id: string }[]).map((d) => d._id)) };
}

// The fourteen planted defects of the reference narrowing, each changing exactly one thing.
const DEFECTS = [
  'or-across', 'range-low-exclusive', 'range-high-exclusive', 'checkbox-no-list', 'checkbox-no-scalar',
  'range-no-list', 'toggle-false', 'sort-flipped', 'missing-first', 'id-desc', 'oldest-first', 'no-fold',
  'sort-from-root', 'root-from-attributes',
] as const;
type Defect = (typeof DEFECTS)[number];

// The proof's own independent implementation of the written rules, with the same GROQ text shapes.
function referenceNarrowing(model: ControlModel, state: UrlState, onProduct: string[], defect?: Defect): Narrowing {
  const readAt = (path: string): string =>
    defect === 'root-from-attributes'
      ? `filterAttributes.${path}`
      : onProduct.includes(path)
        ? path === 'brand'
          ? BRAND_NAME
          : path
        : `filterAttributes.${path}`;
  const holds = (e: string, test: (x: string) => string) => `(${test(e)} || count((${e})[${test('@')}]) > 0)`;
  const params: Record<string, string[] | number> = {};
  const parts: string[] = [];
  let i = 0;
  for (const c of model.controls) {
    const sel = state[c.path];
    const e = readAt(c.path);
    if (c.kind === 'checkbox') {
      if (!Array.isArray(sel) || sel.length === 0) continue;
      const key = `narrow_${i}_in`;
      params[key] = sel;
      if (defect === 'checkbox-no-list') parts.push(`${e} in $${key}`);
      else if (defect === 'checkbox-no-scalar') parts.push(`count((${e})[@ in $${key}]) > 0`);
      else parts.push(holds(e, (x) => `${x} in $${key}`));
    } else if (c.kind === 'toggle') {
      if (sel !== true) continue;
      parts.push(holds(e, () => (defect === 'toggle-false' ? `${e} == false` : `${e} == true`)));
    } else {
      if (sel === null || typeof sel !== 'object' || !('min' in sel)) continue;
      const { min, max } = sel as { min: number; max: number };
      const lo = defect === 'range-low-exclusive' ? '>' : '>=';
      const hi = defect === 'range-high-exclusive' ? '<' : '<=';
      params[`narrow_${i}_min`] = min;
      params[`narrow_${i}_max`] = max;
      const test = (x: string) => `(${x} ${lo} $narrow_${i}_min && ${x} ${hi} $narrow_${i}_max)`;
      parts.push(defect === 'range-no-list' ? test(e) : holds(e, test));
    }
    i++;
  }
  const where = parts.length ? parts.map((p) => `(${p})`).join(defect === 'or-across' ? ' || ' : ' && ') : 'true';
  const created = defect === 'oldest-first' ? '_createdAt asc' : '_createdAt desc';
  const idKey = defect === 'id-desc' ? '_id desc' : '_id asc';
  const sort = state.sort;
  let order: string;
  if (sort && typeof sort === 'object' && 'field' in sort) {
    const { field, direction } = sort as { field: string; direction: 'asc' | 'desc' };
    const e = defect === 'sort-from-root' ? field : readAt(field);
    const dir = defect === 'sort-flipped' ? (direction === 'asc' ? 'desc' : 'asc') : direction;
    const key = defect === 'no-fold' ? e : `coalesce(lower(${e}), ${e})`;
    order = `${defect === 'missing-first' ? '' : `defined(${e}) desc, `}${key} ${dir}, ${created}, ${idKey}`;
  } else {
    order = `${created}, ${idKey}`;
  }
  return { where, order, params };
}

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

// The checks can say no: the reference narrowing must give the written ids, and each planted defect must be caught.
async function proofCanFail(): Promise<string[]> {
  const problems: string[] = [];
  const clean = await runDocs(referenceNarrowing);
  if ('error' in clean) {
    problems.push(`the reference narrowing is rejected: ${clean.error}`);
  } else {
    for (let k = 0; k < CASES.length; k++) {
      if (clean.ids[k].join() !== CASES[k][2].join())
        problems.push(`the reference narrowing does not give the written ids for ${CASES[k][0]}: expected ${canon(CASES[k][2])}, got ${canon(clean.ids[k])}`);
    }
  }
  for (const defect of DEFECTS) {
    const got = await runDocs((m, s, p) => referenceNarrowing(m, s, p, defect));
    if ('error' in got) continue;
    const differs = got.ids.some((ids, k) => ids.join() !== CASES[k][2].join());
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
  for (const c of model.controls) {
    if (c.kind === 'checkbox') {
      if (!c.options.length) continue;
      add(`${c.path}: first option`, { [c.path]: [c.options[0].value] });
      if (c.options.length >= 2) add(`${c.path}: first two options`, { [c.path]: c.options.slice(0, 2).map((o) => o.value) });
      add(`${c.path}: all options`, { [c.path]: c.options.map((o) => o.value) });
    } else if (c.kind === 'toggle') {
      add(`${c.path}: on`, { [c.path]: true });
    } else {
      const { min, max } = c.span;
      const mid = (min + max) / 2;
      add(`${c.path}: lower half`, { [c.path]: { min, max: mid } });
      add(`${c.path}: upper half`, { [c.path]: { min: mid, max } });
      add(`${c.path}: point`, { [c.path]: { min, max: min } });
    }
  }
  const firstRange = model.controls.find((c) => c.kind === 'range');
  if (firstRange && firstRange.kind === 'range')
    add('a state with no result', { [firstRange.path]: { min: firstRange.span.max + 1, max: firstRange.span.max + 2 } });
  for (const s of model.sorts) {
    add(`sort ${s.value} ascending`, { sort: { field: s.value, direction: 'asc' } });
    add(`sort ${s.value} descending`, { sort: { field: s.value, direction: 'desc' } });
  }
  const checkboxes = model.controls.filter((c) => c.kind === 'checkbox' && c.options.length);
  const firstToggle = model.controls.find((c) => c.kind === 'toggle');
  const combo: UrlPatch = {};
  if (checkboxes.length) combo[checkboxes[0].path] = [(checkboxes[0] as { options: { value: string }[] }).options[0].value];
  if (firstToggle) combo[firstToggle.path] = true;
  if (firstRange && firstRange.kind === 'range')
    combo[firstRange.path] = { min: firstRange.span.min, max: (firstRange.span.min + firstRange.span.max) / 2 };
  if (model.sorts.length) combo.sort = { field: model.sorts[0].value, direction: 'desc' };
  if (Object.keys(combo).length) add('a combination', combo);
  if (checkboxes.length >= 2)
    add('two checkboxes', {
      [checkboxes[0].path]: [(checkboxes[0] as { options: { value: string }[] }).options[0].value],
      [checkboxes[1].path]: [(checkboxes[1] as { options: { value: string }[] }).options[0].value],
    });
  return out;
}

// The independent in-memory derivation, written from the rules only.
const at = (object: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((o, key) => (o == null ? undefined : (o as Record<string, unknown>)[key]), object);

const valuesAt = (product: Record<string, unknown>, path: string, onProduct: string[]): unknown[] => {
  const v = at((onProduct.includes(path) ? product : product.filterAttributes) as Record<string, unknown>, path);
  return (Array.isArray(v) ? v : [v]).filter((x) => x !== undefined && x !== null && !(typeof x === 'string' && x.trim() === ''));
};

const cmpText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function derive(products: Record<string, unknown>[], model: ControlModel, state: UrlState, onProduct: string[]): string[] {
  const matches = products.filter((p) =>
    model.controls.every((c) => {
      const sel = state[c.path];
      if (c.kind === 'checkbox') {
        if (!Array.isArray(sel) || sel.length === 0) return true;
        return valuesAt(p, c.path, onProduct).some((v) => sel.includes(v as string));
      }
      if (c.kind === 'toggle') {
        if (sel !== true) return true;
        return valuesAt(p, c.path, onProduct).some((v) => v === true);
      }
      if (sel === null || typeof sel !== 'object' || !('min' in sel)) return true;
      const { min, max } = sel as { min: number; max: number };
      return valuesAt(p, c.path, onProduct).some((v) => typeof v === 'number' && min <= v && v <= max);
    }),
  );
  const newestThenId = (a: Record<string, unknown>, b: Record<string, unknown>) =>
    cmpText(b._createdAt as string, a._createdAt as string) || cmpText(a._id as string, b._id as string);
  const sort = state.sort;
  if (!sort || typeof sort !== 'object' || !('field' in sort)) {
    matches.sort(newestThenId);
  } else {
    const { field, direction } = sort as { field: string; direction: 'asc' | 'desc' };
    const dir = direction === 'asc' ? 1 : -1;
    const key = (v: unknown) => (typeof v === 'string' ? v.toLowerCase() : v);
    const valueOf = (p: Record<string, unknown>) =>
      at((onProduct.includes(field) ? p : p.filterAttributes) as Record<string, unknown>, field);
    matches.sort((a, b) => {
      const va = valueOf(a);
      const vb = valueOf(b);
      const missing = (v: unknown) => v === undefined || v === null;
      if (!missing(va) && !missing(vb)) {
        const ka = key(va) as string | number;
        const kb = key(vb) as string | number;
        if (ka < kb) return -dir;
        if (ka > kb) return dir;
      } else if (!missing(va)) return -1;
      else if (!missing(vb)) return 1;
      return newestThenId(a, b);
    });
  }
  return matches.map((p) => p._id as string);
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
    const list = states(model);
    let compared = 0;
    let narrowed = 0;
    let zero = 0;
    for (let g = 0; g < list.length; g += 15) {
      const group = list.slice(g, g + 15);
      const parts = [
        `"snap": *[_type == "product" && ${PUBLISHED} && count(catalogueLocationKeys[@ in $keys]) > 0]{ _id, _createdAt, "brand": ${BRAND_NAME}, name, price_data, stock, filterAttributes }`,
      ];
      const params: Record<string, unknown> = { keys };
      group.forEach((s, k) => {
        const n = renamed(buildNarrowing(model, s.state, onProduct), `s${k}`);
        for (const f of paramFindings(n)) findings.push(`1 ${scope} / ${s.name}: ${f}`);
        parts.push(`"r${k}": *[_type == "product" && ${PUBLISHED} && count(catalogueLocationKeys[@ in $keys]) > 0 && (${n.where})] | order(${n.order}) { _id }`);
        Object.assign(params, n.params);
      });
      const q = await ask(`{ ${parts.join(', ')} }`, params);
      if (q.status !== 200) {
        findings.push(`1 ${scope}: the request is rejected: HTTP ${q.status} ${q.error ?? ''}`);
        continue;
      }
      const snap: Record<string, unknown>[] = q.result?.snap ?? [];
      group.forEach((s, k) => {
        const got = ((q.result?.[`r${k}`] ?? []) as { _id: string }[]).map((d) => d._id);
        const want = derive(snap, model, s.state, onProduct);
        compared++;
        if (got.join() !== want.join()) {
          const pos = want.findIndex((id, idx) => got[idx] !== id);
          findings.push(
            `1 ${scope} / ${s.name}: expected ${want.length} ids ${canon(want).slice(0, 160)}, got ${got.length} ids ${canon(got).slice(0, 160)}${pos >= 0 ? ` (first differs at ${pos})` : ''}`,
          );
        }
        if (got.length > 0 && got.length < snap.length) narrowed++;
        if (got.length === 0) zero++;
      });
    }
    if (narrowed === 0) throw new Error(`scope ${scope}: nothing there narrows`);
    summaries.push(`Scope ${scope}: ${model.controls.length} controls, ${compared} states compared, ${narrowed} narrowed the list, ${zero} gave no product.`);
  }
  return { findings, summaries };
}

// Question 2: the hand-written products through the real query engine give the written ids in the written order.
async function fixtures(): Promise<string[]> {
  const findings: string[] = [];
  const got = await runDocs(buildNarrowing);
  if ('error' in got) {
    findings.push(`2 the request is rejected: ${got.error}`);
    return findings;
  }
  for (let k = 0; k < CASES.length; k++) {
    const [name, patch, expected] = CASES[k];
    if (got.ids[k].join() !== expected.join()) findings.push(`2 ${name}: expected ${canon(expected)}, got ${canon(got.ids[k])}`);
    for (const f of paramFindings(buildNarrowing(MODEL, stateOf(MODEL, patch), ON_PRODUCT))) findings.push(`2 ${name}: ${f}`);
  }
  return findings;
}

const QUESTIONS: Record<number, string> = {
  1: 'on the real routes of the four scopes, for sampled states, the product ids the request returns, in order, equal those an independent in-memory derivation gives from one snapshot read in the same request',
  2: 'hand-written products sent through the real query engine give the written ids in the written order',
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
  const broken = await proofCanFail();
  if (broken.length) {
    console.error(`NO VERDICT: the proof itself is broken\n${broken.map((l) => `  ${l}`).join('\n')}`);
    process.exit(2);
  }
  console.log(
    'Self-check: the written cases agree with a reference narrowing, and say NO to fourteen planted defects of it: alternatives across controls, an exclusive range end, lists or scalars ignored, a flipped toggle or sort, missing values first, a reversed tie-break, no case folding, a value read from the wrong place.\n',
  );
  const { findings: liveFindings, summaries } = await live();
  const fixtureFindings = await fixtures();
  process.exit(report(summaries, { 1: liveFindings, 2: fixtureFindings }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
