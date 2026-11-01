// URL contract proof: does buildUrlContract read and write addresses the way the written contract says? PASS or NO. It tells the truth and nothing else.
//
// Three questions. All yes means done:
//   1. on the real model of each of the four scopes and on a hand-written model, every selectable state survives decode(encode('', patch)) unchanged, and no control path is 'sort' or 'page'
//   2. hand-written bad addresses decode to the written state, and decode never throws
//   3. hand-written writes give the written address: foreign keys kept, 'page' removed, a default writes nothing, options in the model's order
// No flakiness: each real model is judged against itself, no clock, no randomness, nothing is compared across two reads.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/urlContractRealData.test.ts
// (it imports nuqs, so node_modules must be reachable)
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> live -> fixtures -> report

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { PUBLISHED } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import { buildControlModel } from '@/features/product-filtering/core/rules/buildControlModel';
import { buildUrlContract } from '@/features/product-filtering/url/controlUrl';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { UrlContract, UrlInput, UrlPatch, UrlState } from '@/features/product-filtering/core/types/urlState';

// A string for comparison: object keys sorted at every level, array order kept, so key order never decides a verdict but array order always does.
const canon = (x: unknown): string =>
  JSON.stringify(
    (function sort(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sort((value as Record<string, unknown>)[k])]));
      return value;
    })(x),
  );

const short = (s: string) => (s.length > 200 ? `${s.slice(0, 197)}...` : s);

// A hand-written model with awkward text: the URL forms a writer must get right.
const ALIEN_MODEL: ControlModel = {
  controls: [
    { path: 'quuxWidth', kind: 'checkbox', label: 'Quux span', options: ['wide strap', 'a&b', 'c+d', 'e,f', '100%2C', 'Ünï', 'x=y#z?', 'plain'].map((value) => ({ value, text: value })) },
    { path: 'blipMode.low', kind: 'toggle', label: 'Blips low' },
    { path: 'zinkLevel', kind: 'range', label: 'Zink level', span: { min: -4.5, max: 30 } },
    { path: 'plinkRate', kind: 'range', label: 'Plink rate', span: { min: 2.5, max: 2.5 } },
  ],
  sorts: [{ value: 'plinkRate', text: 'Plink pace' }, { value: 'zinkLevel', text: 'Zink level' }],
};

// The state of an empty address, by kind, written without importing anything from the contract.
function defaultsOf(model: ControlModel): UrlState {
  const state: UrlState = {};
  for (const c of model.controls) state[c.path] = c.kind === 'checkbox' ? [] : c.kind === 'toggle' ? false : null;
  state.sort = null;
  return state;
}

const stateOf = (model: ControlModel, patch: UrlPatch): UrlState => ({ ...defaultsOf(model), ...patch });

// The written number rule: no whitespace, no hex, no Infinity, no empty part.
const STRICT_NUMBER = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;

const readRange = (v: string | null): UrlState[string] => {
  if (v === null) return null;
  const parts = v.split(',');
  if (parts.length !== 2 || !parts.every((p) => STRICT_NUMBER.test(p))) return null;
  const [min, max] = parts.map(Number);
  return min <= max ? { min, max } : null;
};

const readSort = (v: string | null, sorts: { value: string }[]): UrlState[string] => {
  if (v === null) return null;
  const i = v.lastIndexOf(':');
  if (i < 0) return null;
  const field = v.slice(0, i);
  const direction = v.slice(i + 1);
  if (direction !== 'asc' && direction !== 'desc') return null;
  if (!sorts.some((s) => s.value === field)) return null;
  return { field, direction };
};

const toParams = (input: UrlInput): URLSearchParams => {
  if (typeof input === 'string') return new URLSearchParams(input.startsWith('?') ? input.slice(1) : input);
  if (input instanceof URLSearchParams) return input;
  const sp = new URLSearchParams();
  for (const [key, v] of Object.entries(input)) {
    if (v === undefined) continue;
    for (const item of Array.isArray(v) ? v : [v]) sp.append(key, item);
  }
  return sp;
};

// The proof's own independent implementation of the written contract, on URLSearchParams only. It exists so the checks
// can be shown to say PASS to a right contract and NO to a broken one.
function referenceContract(model: ControlModel): UrlContract {
  return {
    decode: (input) => {
      const sp = toParams(input);
      const state: UrlState = {};
      for (const c of model.controls) {
        if (c.kind === 'checkbox') {
          const got = sp.getAll(c.path);
          state[c.path] = c.options.map((o) => o.value).filter((v) => got.includes(v));
        } else if (c.kind === 'toggle') {
          state[c.path] = sp.get(c.path) === 'true';
        } else {
          state[c.path] = readRange(sp.get(c.path));
        }
      }
      state.sort = readSort(sp.get('sort'), model.sorts);
      return state;
    },
    encode: (base, patch) => {
      const sp = new URLSearchParams(base.startsWith('?') ? base.slice(1) : base);
      for (const [key, value] of Object.entries(patch)) {
        const control = model.controls.find((c) => c.path === key);
        if (!control && key !== 'sort') continue;
        sp.delete(key);
        if (value === null || value === false || (Array.isArray(value) && value.length === 0)) continue;
        if (control?.kind === 'checkbox' && Array.isArray(value)) {
          for (const o of control.options) if (value.includes(o.value)) sp.append(key, o.value);
        } else if (control?.kind === 'toggle' && value === true) {
          sp.append(key, 'true');
        } else if (control?.kind === 'range' && typeof value === 'object' && 'min' in value) {
          sp.append(key, `${value.min},${value.max}`);
        } else if (key === 'sort' && typeof value === 'object' && 'field' in value) {
          sp.append(key, `${(value as { field: string }).field}:${(value as { direction: string }).direction}`);
        }
      }
      sp.delete('page');
      const s = sp.toString();
      return s ? `?${s}` : '';
    },
  };
}

// A query string as a map: each distinct key to its values in address order.
const queryMap = (qs: string): Record<string, string[]> => {
  const sp = new URLSearchParams(qs.startsWith('?') ? qs.slice(1) : qs);
  const map: Record<string, string[]> = {};
  for (const key of new Set(sp.keys())) map[key] = sp.getAll(key);
  return map;
};

// Question 1: every selectable state survives encode then decode. Returns the findings and how many states were tried.
function roundTrip(contract: UrlContract, model: ControlModel): { findings: string[]; states: number } {
  const findings: string[] = [];
  for (const c of model.controls) {
    if (c.path === 'sort' || c.path === 'page') findings.push(`control path "${c.path}" is a reserved key`);
  }
  const patches: UrlPatch[] = [];
  for (const c of model.controls) {
    if (c.kind === 'checkbox') {
      for (const o of c.options) patches.push({ [c.path]: [o.value] });
      patches.push({ [c.path]: c.options.map((o) => o.value) });
    } else if (c.kind === 'toggle') {
      patches.push({ [c.path]: true });
    } else {
      patches.push({ [c.path]: { min: c.span.min, max: c.span.max } });
      patches.push({ [c.path]: { min: c.span.min, max: c.span.min } });
    }
  }
  for (const s of model.sorts) {
    patches.push({ sort: { field: s.value, direction: 'asc' } });
    patches.push({ sort: { field: s.value, direction: 'desc' } });
  }
  const all: UrlPatch = {};
  for (const c of model.controls) {
    if (c.kind === 'checkbox' && c.options.length) all[c.path] = [c.options[0].value];
    else if (c.kind === 'toggle') all[c.path] = true;
    else if (c.kind === 'range') all[c.path] = { min: c.span.min, max: c.span.max };
  }
  if (model.sorts.length) all.sort = { field: model.sorts[0].value, direction: 'asc' };
  patches.push(all);

  for (const patch of patches) {
    try {
      const state = contract.decode(contract.encode('', patch));
      const expected = stateOf(model, patch);
      if (canon(state) !== canon(expected)) findings.push(`patch ${short(canon(patch))}: expected ${short(canon(expected))}, got ${short(canon(state))}`);
    } catch (e) {
      findings.push(`patch ${short(canon(patch))}: threw "${(e as Error).message}"`);
    }
  }
  return { findings, states: patches.length };
}

// Question 2: hand-written bad and good addresses decode to the written state; a difference or a throw is a finding.
function decodeCases(contract: UrlContract): string[] {
  const cases: [string, UrlInput, UrlPatch][] = [
    ["''", '', {}],
    ["'?q=hello&drawer=cart&page=3'", '?q=hello&drawer=cart&page=3', {}],
    ["'?quuxWidth=ghost'", '?quuxWidth=ghost', {}],
    ["'?quuxWidth='", '?quuxWidth=', {}],
    ["'?quuxWidth=plain&quuxWidth=a%26b&quuxWidth=plain&quuxWidth=ghost'", '?quuxWidth=plain&quuxWidth=a%26b&quuxWidth=plain&quuxWidth=ghost', { quuxWidth: ['a&b', 'plain'] }],
    ["'?blipMode.low=maybe'", '?blipMode.low=maybe', {}],
    ["'?blipMode.low=true'", '?blipMode.low=true', { 'blipMode.low': true }],
    ["'?zinkLevel=5'", '?zinkLevel=5', {}],
    ["'?zinkLevel=5,x'", '?zinkLevel=5,x', {}],
    ["'?zinkLevel=9,1'", '?zinkLevel=9,1', {}],
    ["'?zinkLevel=1,2,3'", '?zinkLevel=1,2,3', {}],
    ["'?zinkLevel='", '?zinkLevel=', {}],
    ["'?zinkLevel=0x10,20'", '?zinkLevel=0x10,20', {}],
    ["'?zinkLevel=,5'", '?zinkLevel=,5', {}],
    ["'?zinkLevel=5,'", '?zinkLevel=5,', {}],
    ["'?zinkLevel=%205,6'", '?zinkLevel=%205,6', {}],
    ["'?zinkLevel=Infinity,5'", '?zinkLevel=Infinity,5', {}],
    ["'?zinkLevel=NaN,1'", '?zinkLevel=NaN,1', {}],
    ["'?zinkLevel=-4.5,30'", '?zinkLevel=-4.5,30', { zinkLevel: { min: -4.5, max: 30 } }],
    ["'?plinkRate=2.5,2.5'", '?plinkRate=2.5,2.5', { plinkRate: { min: 2.5, max: 2.5 } }],
    ["'?sort=ghost:asc'", '?sort=ghost:asc', {}],
    ["'?sort=plinkRate'", '?sort=plinkRate', {}],
    ["'?sort=plinkRate:up'", '?sort=plinkRate:up', {}],
    ["'?sort=:asc'", '?sort=:asc', {}],
    ["'?sort=plinkRate:asc:desc'", '?sort=plinkRate:asc:desc', {}],
    ["'?sort='", '?sort=', {}],
    ["'?sort=zinkLevel:desc'", '?sort=zinkLevel:desc', { sort: { field: 'zinkLevel', direction: 'desc' } }],
  ];
  const oneState = { quuxWidth: ['a&b', 'plain'], zinkLevel: { min: -4.5, max: 30 }, sort: { field: 'plinkRate', direction: 'asc' } };
  const address = '?quuxWidth=plain&quuxWidth=a%26b&zinkLevel=-4.5,30&sort=plinkRate:asc';
  cases.push(
    ['the same address as a string', address, oneState],
    ['the same address as URLSearchParams', new URLSearchParams('quuxWidth=plain&quuxWidth=a%26b&zinkLevel=-4.5,30&sort=plinkRate:asc'), oneState],
    ['the same address as an object', { quuxWidth: ['plain', 'a&b'], zinkLevel: '-4.5,30', sort: 'plinkRate:asc' }, oneState],
    ['a repeated range key as an object', { zinkLevel: ['1,2', '3,4'] }, { zinkLevel: { min: 1, max: 2 } }],
  );
  const findings: string[] = [];
  for (const [name, input, overrides] of cases) {
    try {
      const state = contract.decode(input);
      const expected = stateOf(ALIEN_MODEL, overrides);
      if (canon(state) !== canon(expected)) findings.push(`${name}: expected ${short(canon(expected))}, got ${short(canon(state))}`);
    } catch (e) {
      findings.push(`${name}: threw "${(e as Error).message}"`);
    }
  }
  return findings;
}

// Question 3: hand-written writes give the written address.
function encodeCases(contract: UrlContract): string[] {
  const cases: [string, string, UrlPatch, Record<string, string[]> | ''][] = [
    [
      'A: a write over foreign keys, page and a stale value',
      '?q=hello&drawer=cart&page=3&quuxWidth=ghost',
      { quuxWidth: ['plain', 'a&b', 'ghost', 'plain'], 'blipMode.low': true, zinkLevel: { min: -4.5, max: 30 }, sort: { field: 'plinkRate', direction: 'asc' } },
      { q: ['hello'], drawer: ['cart'], quuxWidth: ['a&b', 'plain'], 'blipMode.low': ['true'], zinkLevel: ['-4.5,30'], sort: ['plinkRate:asc'] },
    ],
    [
      'B: defaults and nulls write nothing',
      '?page=2&q=z&quuxWidth=plain&blipMode.low=true&zinkLevel=1,2&sort=plinkRate:asc',
      { quuxWidth: [], 'blipMode.low': false, zinkLevel: null, plinkRate: null, sort: null },
      { q: ['z'] },
    ],
    ['C: an empty patch keeps foreign keys and drops page', '?page=3&q=z', {}, { q: ['z'] }],
    [
      'D: a key not in the patch keeps its value',
      '?quuxWidth=plain&zinkLevel=1,2',
      { 'blipMode.low': true },
      { quuxWidth: ['plain'], zinkLevel: ['1,2'], 'blipMode.low': ['true'] },
    ],
    ['E: only page leaves an empty string', '?page=2', {}, ''],
  ];
  const findings: string[] = [];
  for (const [name, base, patch, expected] of cases) {
    try {
      const result = contract.encode(base, patch);
      if (result !== '' && !result.startsWith('?')) findings.push(`${name}: result "${short(result)}" is not '' and does not start with ?`);
      if (expected === '') {
        if (result !== '') findings.push(`${name}: expected '', got "${short(result)}"`);
      } else if (canon(queryMap(result)) !== canon(expected)) {
        findings.push(`${name}: expected ${short(canon(expected))}, got ${short(canon(queryMap(result)))}`);
      }
    } catch (e) {
      findings.push(`${name}: threw "${(e as Error).message}"`);
    }
  }
  return findings;
}

// The checks can say no: they must pass the reference contract and refuse each of fifteen planted breaks of it.
function proofCanFail(): string[] {
  const problems: string[] = [];
  const ref = referenceContract(ALIEN_MODEL);
  const clean = [...roundTrip(ref, ALIEN_MODEL).findings, ...decodeCases(ref), ...encodeCases(ref)];
  if (clean.length) problems.push(`the checks say NO to the reference contract: ${clean[0]}`);
  const tampers: [string, (c: UrlContract) => UrlContract][] = [
    ['decode adds an option the model does not hold', (c) => ({
      decode: (i) => ({ ...c.decode(i), quuxWidth: [...(c.decode(i).quuxWidth as string[]), 'ghost'] }),
      encode: c.encode,
    })],
    ['decode drops the last selected option', (c) => ({
      decode: (i) => ({ ...c.decode(i), quuxWidth: (c.decode(i).quuxWidth as string[]).slice(0, -1) }),
      encode: c.encode,
    })],
    ['decode reads every toggle as false', (c) => ({
      decode: (i) => ({ ...c.decode(i), 'blipMode.low': false }),
      encode: c.encode,
    })],
    ['decode rounds the bounds of every range', (c) => ({
      decode: (i) => {
        const s = c.decode(i);
        for (const k of ['zinkLevel', 'plinkRate']) {
          const r = s[k] as { min: number; max: number } | null;
          if (r) s[k] = { min: Math.round(r.min), max: Math.round(r.max) };
        }
        return s;
      },
      encode: c.encode,
    })],
    ['decode reads every sort direction as asc', (c) => ({
      decode: (i) => {
        const s = c.decode(i);
        if (s.sort) s.sort = { ...(s.sort as any), direction: 'asc' };
        return s;
      },
      encode: c.encode,
    })],
    ['encode keeps page', (c) => ({
      decode: c.decode,
      encode: (b, p) => {
        const page = new URLSearchParams(b.startsWith('?') ? b.slice(1) : b).get('page');
        const r = c.encode(b, p);
        return page === null ? r : r + (r ? '&' : '?') + `page=${encodeURIComponent(page)}`;
      },
    })],
    ['encode drops the foreign keys', (c) => ({ decode: c.decode, encode: (_b, p) => c.encode('', p) })],
    ['encode writes a default', (c) => ({
      decode: c.decode,
      encode: (b, p) => {
        const r = c.encode(b, p);
        return r + (r ? '&' : '?') + 'blipMode.low=false';
      },
    })],
    ['encode corrupts & in values', (c) => ({ decode: c.decode, encode: (b, p) => c.encode(b, p).replace(/%26/g, '%2C') })],
    ['encode writes the options of a key in reverse order', (c) => ({
      decode: c.decode,
      encode: (b, p) => {
        const sp = new URLSearchParams(c.encode(b, p).replace(/^\?/, ''));
        const out = new URLSearchParams();
        for (const k of new Set(sp.keys())) for (const v of [...sp.getAll(k)].reverse()) out.append(k, v);
        const s = out.toString();
        return s ? `?${s}` : '';
      },
    })],
    ['decode throws on an address containing ghost', (c) => ({
      decode: (i) => {
        if (typeof i === 'string' && i.includes('ghost')) throw new Error('ghost in the address');
        return c.decode(i);
      },
      encode: c.encode,
    })],
    ['decode accepts a range with min above max', (c) => ({
      decode: (i) => {
        const s = c.decode(i);
        if (typeof i === 'string' && i.includes('zinkLevel=9,1')) s.zinkLevel = { min: 9, max: 1 };
        return s;
      },
      encode: c.encode,
    })],
    ['decode accepts a hexadecimal range', (c) => ({
      decode: (i) => {
        const s = c.decode(i);
        if (typeof i === 'string' && i.includes('zinkLevel=0x10,20')) s.zinkLevel = { min: 16, max: 20 };
        return s;
      },
      encode: c.encode,
    })],
    ['decode accepts a sort field the model does not hold', (c) => ({
      decode: (i) => {
        const s = c.decode(i);
        if (typeof i === 'string' && i.includes('sort=ghost:asc')) s.sort = { field: 'ghost', direction: 'asc' };
        return s;
      },
      encode: c.encode,
    })],
    ['decode ignores an object input', (c) => ({
      decode: (i) => (typeof i === 'object' && !(i instanceof URLSearchParams) ? c.decode('') : c.decode(i)),
      encode: c.encode,
    })],
  ];
  for (const [name, tamper] of tampers) {
    const broken = tamper(referenceContract(ALIEN_MODEL));
    const found = [...roundTrip(broken, ALIEN_MODEL).findings, ...decodeCases(broken), ...encodeCases(broken)];
    if (!found.length) problems.push(`the checks do not say NO to ${name}`);
  }
  return problems;
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

type Item = { _id: string; slug?: string; parent?: string };

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
    const { findings: found, states } = roundTrip(buildUrlContract(model), model);
    for (const line of found) findings.push(`1 ${scope}: ${line}`);
    summaries.push(`Scope ${scope}: ${model.controls.length} controls, ${model.sorts.length} sorts, ${states} states round-tripped.`);
  }
  const hand = roundTrip(buildUrlContract(ALIEN_MODEL), ALIEN_MODEL);
  for (const line of hand.findings) findings.push(`1 hand-written model: ${line}`);
  summaries.push(`Scope hand-written: ${ALIEN_MODEL.controls.length} controls, ${ALIEN_MODEL.sorts.length} sorts, ${hand.states} states round-tripped.`);
  return { findings, summaries };
}

// The hand-written address cases: question 2 reads, question 3 writes.
function fixtures(): string[] {
  const contract = buildUrlContract(ALIEN_MODEL);
  const findings: string[] = [];
  for (const line of decodeCases(contract)) findings.push(`2 ${line}`);
  for (const line of encodeCases(contract)) findings.push(`3 ${line}`);
  return findings;
}

const QUESTIONS: Record<number, string> = {
  1: "on the real model of each scope and on a hand-written model, every selectable state survives decode(encode('', patch)) unchanged, and no control path is 'sort' or 'page'",
  2: 'hand-written bad addresses decode to the written state, and decode never throws',
  3: "hand-written writes give the written address: foreign keys kept, 'page' removed, a default writes nothing, options in the model's order",
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
  console.log('Self-check: the checks say NO to fifteen planted breaks of a reference contract: an unknown, lost or wrong option, toggle, range or sort when reading, and a kept page, lost foreign key, written default, corrupted text or wrong order when writing.\n');
  const { findings: liveFindings, summaries } = await live();
  const fixtureFindings = fixtures();
  const found2 = fixtureFindings.filter((l) => l.startsWith('2 '));
  const found3 = fixtureFindings.filter((l) => l.startsWith('3 '));
  process.exit(report(summaries, { 1: liveFindings, 2: found2, 3: found3 }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
