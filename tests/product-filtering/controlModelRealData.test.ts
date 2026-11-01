// Control model proof: does buildControlModel reshape a route's answer the way the written rule says? PASS or NO. It tells the truth and nothing else.
//
// Two questions. All yes means done:
//   1. on the real answer of each of the four scopes, the model holds exactly the answer's controls in the answer's order, each with the kind its values give, its label, its options in order with their texts (checkbox) or its lowest and highest value (range), the sorts in order; and no real control was left out (no real control mixes types)
//   2. hand-written cases give the written model: all three kinds, a control mixing types, a control with no value, text that looks like a number or like true/false, a single-value range, a negative number, and the empty answer
// No flakiness: each real answer is judged against itself: the oracle is derived from the same answer object the function received, so nothing can change between the read and the verdict; no clock, no randomness.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/controlModelRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> live -> fixtures -> report

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { PUBLISHED } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import { buildControlModel } from '@/features/product-filtering/core/rules/buildControlModel';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';
import type { ControlModel } from '@/features/product-filtering/core/types/controlModel';

// The written rule as the judge uses it, written with typeof: one type for all values gives that type's kind, anything else (or no values) gives none.
const kindOf = (values: unknown[]): 'checkbox' | 'toggle' | 'range' | null => {
  const types = new Set(values.map((v) => typeof v));
  if (types.size !== 1) return null;
  if (types.has('string')) return 'checkbox';
  if (types.has('boolean')) return 'toggle';
  if (types.has('number')) return 'range';
  return null;
};

// A string for comparison: object keys sorted at every level, array order kept, so key order never decides a verdict but array order always does.
const canon = (x: unknown): string =>
  JSON.stringify(
    (function sort(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(sort);
      if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((k) => [k, sort((value as Record<string, unknown>)[k])]));
      return value;
    })(x),
  );

// Findings of model vs the model the written rule gives for this answer; empty when the model is right.
function judge(answer: Pick<RouteControls, 'raw' | 'labels' | 'sorts'>, model: ControlModel): string[] {
  const findings: string[] = [];
  const expectedPaths = Object.keys(answer.raw).filter((path) => kindOf(answer.raw[path]) !== null);
  const modelPaths = model.controls.map((c) => c.path);
  if (modelPaths.join() !== expectedPaths.join()) findings.push(`controls: expected [${expectedPaths.join(', ')}], got [${modelPaths.join(', ')}]`);
  for (const control of model.controls) {
    if (!expectedPaths.includes(control.path)) continue;
    const values = answer.raw[control.path];
    const kind = kindOf(values);
    const expected: Record<string, unknown> = { path: control.path, kind, label: answer.labels[control.path].label };
    if (kind === 'checkbox') expected.options = values.map((v) => ({ value: v, text: answer.labels[control.path].options[String(v)] }));
    if (kind === 'range') expected.span = { min: Math.min(...(values as number[])), max: Math.max(...(values as number[])) };
    if (canon(control) !== canon(expected)) findings.push(`control "${control.path}": expected ${canon(expected)}, got ${canon(control)}`);
  }
  const expectedSorts = Object.entries(answer.sorts).map(([value, text]) => ({ value, text }));
  if (canon(model.sorts) !== canon(expectedSorts)) findings.push(`sorts: expected ${canon(expectedSorts)}, got ${canon(model.sorts)}`);
  return findings;
}

const FIXTURE_ANSWER: Pick<RouteControls, 'raw' | 'labels' | 'sorts'> = {
  raw: {
    quuxWidth: ['thin-cord', 'wide-strap'],
    'blipMode.low': [false, true],
    zinkLevel: [-4, 5, 30],
    mixedGizmo: [4, true, 'tall'],
    nobodyHolds: [],
    plinkRate: [2.5],
    looksLike: ['10', 'true'],
    brand: ['Aardvark', 'Zoo'],
  },
  labels: {
    quuxWidth: { label: 'Quux span', options: { 'thin-cord': 'Thin Cord', 'wide-strap': 'Wide Strap' } },
    'blipMode.low': { label: 'Blips low', options: { false: 'No', true: 'Yes' } },
    zinkLevel: { label: 'Zink level', options: { '-4': '-4', '5': '5', '30': '30' } },
    mixedGizmo: { label: 'Mixed gizmo', options: { '4': '4', true: 'Yes', tall: 'Tall' } },
    nobodyHolds: { label: 'Nobody holds', options: {} },
    plinkRate: { label: 'Plink rate', options: { '2.5': '2.5' } },
    looksLike: { label: 'Looks like', options: { '10': 'Ten', true: 'Truth' } },
    brand: { label: 'Brand', options: { Aardvark: 'Aardvark', Zoo: 'Zoological' } },
  },
  sorts: { plinkRate: 'Plink pace', zinkLevel: 'Zink level' },
};

const FIXTURE_MODEL: ControlModel = {
  controls: [
    { path: 'quuxWidth', kind: 'checkbox', label: 'Quux span', options: [{ value: 'thin-cord', text: 'Thin Cord' }, { value: 'wide-strap', text: 'Wide Strap' }] },
    { path: 'blipMode.low', kind: 'toggle', label: 'Blips low' },
    { path: 'zinkLevel', kind: 'range', label: 'Zink level', span: { min: -4, max: 30 } },
    { path: 'plinkRate', kind: 'range', label: 'Plink rate', span: { min: 2.5, max: 2.5 } },
    { path: 'looksLike', kind: 'checkbox', label: 'Looks like', options: [{ value: '10', text: 'Ten' }, { value: 'true', text: 'Truth' }] },
    { path: 'brand', kind: 'checkbox', label: 'Brand', options: [{ value: 'Aardvark', text: 'Aardvark' }, { value: 'Zoo', text: 'Zoological' }] },
  ],
  sorts: [{ value: 'plinkRate', text: 'Plink pace' }, { value: 'zinkLevel', text: 'Zink level' }],
};

// The proof can say no: the judge must pass the written model and refuse each of sixteen planted breaks of it.
function proofCanFail(): string[] {
  const problems: string[] = [];
  if (judge(FIXTURE_ANSWER, FIXTURE_MODEL).length) problems.push('the judge says NO to the written model');
  const breaks: [string, (m: any) => void][] = [
    ['a control lost', (m) => m.controls.splice(1, 1)],
    ['two controls swapped', (m) => ([m.controls[0], m.controls[1]] = [m.controls[1], m.controls[0]])],
    ['an invented control', (m) => m.controls.push({ path: 'ghost', kind: 'toggle', label: 'Ghost' })],
    ['a control for the mixed values', (m) => m.controls.push({ path: 'mixedGizmo', kind: 'toggle', label: 'Mixed gizmo' })],
    ['a wrong kind', (m) => (m.controls[1].kind = 'range')],
    ['an option lost', (m) => m.controls[0].options.pop()],
    ['options swapped', (m) => m.controls[0].options.reverse()],
    ['an invented option', (m) => m.controls[0].options.push({ value: 'ghost', text: 'Ghost' })],
    ['a wrong option text', (m) => (m.controls[5].options[1].text = 'Zoo')],
    ['a wrong label', (m) => (m.controls[0].label = 'quuxWidth')],
    ['a wrong span minimum', (m) => (m.controls[2].span.min = 5)],
    ['a wrong span maximum', (m) => (m.controls[2].span.max = 5)],
    ['a toggle that carries options', (m) => (m.controls[1].options = [])],
    ['a sort lost', (m) => m.sorts.pop()],
    ['sorts swapped', (m) => m.sorts.reverse()],
    ['a wrong sort text', (m) => (m.sorts[0].text = 'plinkRate')],
  ];
  for (const [name, apply] of breaks) {
    const broken = structuredClone(FIXTURE_MODEL);
    apply(broken);
    if (!judge(FIXTURE_ANSWER, broken).length) problems.push(`the judge does not say NO to ${name}`);
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
    for (const line of judge(answer, model)) findings.push(`1 ${scope}: ${line}`);
    for (const path of Object.keys(answer.raw)) {
      if (kindOf(answer.raw[path]) === null) findings.push(`1 ${scope}: control "${path}" mixes types, so it gets no widget`);
    }
    const counts = { checkbox: 0, toggle: 0, range: 0 };
    for (const c of model.controls) counts[c.kind]++;
    summaries.push(`Scope ${scope}: ${model.controls.length} controls (${counts.checkbox} checkbox, ${counts.toggle} toggle, ${counts.range} range), ${model.sorts.length} sorts.`);
  }
  return { findings, summaries };
}

// The hand-written cases: the fixture answer must give the fixture model; the empty answer must give the empty model.
function fixtures(): string[] {
  const findings: string[] = [];
  try {
    const model = buildControlModel(FIXTURE_ANSWER);
    if (canon(model) !== canon(FIXTURE_MODEL)) findings.push(`2 the fixture answer: expected ${canon(FIXTURE_MODEL)}, got ${canon(model)}`);
  } catch (e) {
    findings.push(`2 the fixture answer: the function threw "${(e as Error).message}"`);
  }
  try {
    const model = buildControlModel({ raw: {}, labels: {}, sorts: {} });
    const expected: ControlModel = { controls: [], sorts: [] };
    if (canon(model) !== canon(expected)) findings.push(`2 the empty answer: expected ${canon(expected)}, got ${canon(model)}`);
  } catch (e) {
    findings.push(`2 the empty answer: the function threw "${(e as Error).message}"`);
  }
  return findings;
}

const QUESTIONS: Record<number, string> = {
  1: "on the real answer of each scope, the model holds exactly the answer's controls in the answer's order with their kinds, labels, options or spans, the sorts in order, and no real control mixes types",
  2: 'the hand-written cases give the written model: all three kinds, a mixed control, a control with no value, look-alike text, a single-value range, a negative number, and the empty answer',
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
  console.log('Self-check: the judge says NO to sixteen planted breaks of a clean model: a lost, swapped, invented or wrong control, option, span or sort.\n');
  const { findings: liveFindings, summaries } = await live();
  const fixtureFindings = fixtures();
  process.exit(report(summaries, { 1: liveFindings, 2: fixtureFindings }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
