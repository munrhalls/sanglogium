// Route controls proof: does the shop's request for a route's controls and the use case that reads its answer work? PASS or NO. It tells the truth and nothing else.
//
// Two questions. All yes means done:
//   1. on one real catalogue route, the use case's answer (controls, sorts, products) equals the answer derived independently from the same snapshot
//   2. the happy path, a control with no value, absent rows, a sort field no route product holds, a sort pick that is also an always-on sort and a failing request give the written answer
// No flakiness: one atomic request holds both the snapshot and the shop's request; no clock, no randomness in a verdict; a read that fails is no verdict.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/routeControlsRealData.test.ts
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail -> live -> fixtures -> report

import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { buildRawMap } from '@/features/product-filtering/core/rules/buildRawMap';
import { buildLabelsMap } from '@/features/product-filtering/core/rules/buildLabelsMap';
import { buildSortLabels } from '@/features/product-filtering/core/rules/buildSortLabels';
import { PUBLISHED, toOptionMapData } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { getRouteControls } from '@/features/product-filtering/queries/getRouteControls';
import type { RouteControls } from '@/features/product-filtering/core/types/optionMaps';

// The value at a dotted path of an object; undefined when any step is missing.
const at = (object: unknown, path: string): unknown => path.split('.').reduce<any>((value, key) => value?.[key], object);

// Products are judged by their names, as a multiset: the answer must hold exactly the products the snapshot holds for the route.
const namesOf = (answer: RouteControls): string[] => (answer.products ?? []).map((p) => String(p.name ?? '')).sort();

// Findings of actual vs expected; empty when the same. Key order matters: a swapped control or sort order is a NO.
function compare(actual: RouteControls, expected: RouteControls): string[] {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return [];
  const findings: string[] = [];
  const actualControls = Object.keys(actual.raw ?? {});
  const expectedControls = Object.keys(expected.raw ?? {});
  if (actualControls.join() !== expectedControls.join()) {
    findings.push(`controls: expected [${expectedControls.join(', ')}], got [${actualControls.join(', ')}]`);
  }
  for (const control of [...new Set([...expectedControls, ...actualControls])]) {
    const a = actual.raw?.[control];
    const e = expected.raw?.[control];
    if (JSON.stringify(a) !== JSON.stringify(e)) findings.push(`raw.${control}: expected ${JSON.stringify(e)}, got ${JSON.stringify(a)}`);
    const al = actual.labels?.[control];
    const el = expected.labels?.[control];
    if (JSON.stringify(al) !== JSON.stringify(el)) findings.push(`labels.${control}: expected ${JSON.stringify(el)}, got ${JSON.stringify(al)}`);
  }
  const actualSorts = Object.keys(actual.sorts ?? {});
  const expectedSorts = Object.keys(expected.sorts ?? {});
  if (actualSorts.join() !== expectedSorts.join()) {
    findings.push(`sorts: expected [${expectedSorts.join(', ')}], got [${actualSorts.join(', ')}]`);
  }
  for (const field of [...new Set([...expectedSorts, ...actualSorts])]) {
    if (actual.sorts?.[field] !== expected.sorts?.[field]) findings.push(`sorts.${field}: expected ${JSON.stringify(expected.sorts?.[field])}, got ${JSON.stringify(actual.sorts?.[field])}`);
  }
  const actualNames = namesOf(actual);
  const expectedNames = namesOf(expected);
  if (actualNames.join('|') !== expectedNames.join('|')) {
    findings.push(`products: expected ${expectedNames.length}, got ${actualNames.length}${actualNames.length === expectedNames.length ? ' (same count, different names)' : ''}`);
  }
  return findings;
}

// The proof can say no: a clean copy passes; an extra option, a swapped control order, an extra sort, a swapped sort order and a missing product must not.
function proofCanFail(): string[] {
  const base: RouteControls = {
    raw: { brand: ['A', 'B'], level: [1, 2, 3] },
    labels: {
      brand: { label: 'Brand', options: { A: 'A', B: 'B' } },
      level: { label: 'Level', options: { '1': '1', '2': '2', '3': '3' } },
    },
    sorts: { level: 'Level', brand: 'Brand' },
    products: [{ name: 'Alpha' }, { name: 'Beta' }],
  };
  const problems: string[] = [];
  const clone = (): RouteControls => JSON.parse(JSON.stringify(base));
  if (compare(clone(), base).length) problems.push('the comparison says NO on an identical answer');
  const extra = clone();
  extra.raw.level.push(4);
  if (!compare(extra, base).length) problems.push('the comparison does not say NO on an extra option');
  const swapped = clone();
  swapped.raw = { level: swapped.raw.level, brand: swapped.raw.brand };
  swapped.labels = { level: swapped.labels.level, brand: swapped.labels.brand };
  if (!compare(swapped, base).length) problems.push('the comparison does not say NO on a swapped control order');
  const extraSort = clone();
  extraSort.sorts.extra = 'Extra';
  if (!compare(extraSort, base).length) problems.push('the comparison does not say NO on an extra sort');
  const swappedSorts = clone();
  swappedSorts.sorts = { brand: swappedSorts.sorts.brand, level: swappedSorts.sorts.level };
  if (!compare(swappedSorts, base).length) problems.push('the comparison does not say NO on a swapped sort order');
  const fewer = clone();
  fewer.products.pop();
  if (!compare(fewer, base).length) problems.push('the comparison does not say NO on a missing product');
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

// The one route to judge: the non-root item whose subtree holds the most products; ties take the smaller id.
function pickRoute(items: Item[], held: (string[] | undefined)[]): { id: string; scope: string; keys: string[] } {
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
  let best: { id: string; keys: string[]; count: number } | undefined;
  for (const item of items) {
    if (!item.parent) continue;
    const keys = subtree(item._id);
    const set = new Set(keys);
    const count = held.filter((p) => p?.some((k) => set.has(k))).length;
    if (count > 0 && (!best || count > best.count || (count === best.count && item._id < best.id))) best = { id: item._id, keys, count };
  }
  if (!best) throw new Error('no catalogue item holds any product');
  const byId = new Map(items.map((i) => [i._id, i]));
  const seen = new Set<string>();
  let node = byId.get(best.id);
  while (node?.parent && !seen.has(node._id)) {
    seen.add(node._id);
    node = byId.get(node.parent);
  }
  const scope = node?.slug;
  if (!scope || !(CATEGORIES as readonly string[]).includes(scope)) throw new Error(`the route's root slug "${scope}" is not a category`);
  return { id: best.id, scope, keys: best.keys };
}

async function live(): Promise<{ findings: string[]; route: { id: string; scope: string; keys: number; products: number; controls: number; sorts: number } }> {
  // Request A only chooses the route: every published catalogue item and every product's location keys.
  const a = await ask(`{ "items": *[_type == "catalogueItem" && ${PUBLISHED}]{ _id, "slug": slug.current, "parent": parent._ref }, "held": *[_type == "product" && ${PUBLISHED}]{ catalogueLocationKeys } }`, {});
  if (a.status !== 200) throw new Error(`route pick failed: HTTP ${a.status} ${a.error ?? ''}`);
  const { id, scope, keys } = pickRoute(a.result?.items ?? [], (a.result?.held ?? []).map((p: { catalogueLocationKeys?: string[] }) => p.catalogueLocationKeys));

  // Request B: one request holding both the snapshot and the shop's own request.
  const b = await ask(
    `{ "snap": { "picklist": *[_id == "filterPicklist"][0], "rows": *[_id == "filterLabels"][0].labels, "products": *[_type == "product" && ${PUBLISHED}]{ ..., "brand": brand->name } }, "route": ${ROUTE_MAP_QUERY} }`,
    { keys },
  );
  if (b.status === 400) {
    const alone = await ask(ROUTE_MAP_QUERY, { keys });
    if (alone.status === 400) return { findings: [`1 the shop's route request is rejected by the API: ${alone.error}`], route: { id, scope, keys: keys.length, products: 0, controls: 0, sorts: 0 } };
    throw new Error(`the proof's snapshot part is broken: HTTP ${b.status} ${b.error ?? ''}`);
  }
  if (b.status !== 200) throw new Error(`snapshot read failed: HTTP ${b.status} ${b.error ?? ''}`);
  const { snap, route } = b.result ?? {};

  // Expected, from the snapshot only: the picklist, a JavaScript filter for the route's products, the pure map rules.
  const { alwaysOn, picks, sortAlwaysOn, sortPicks } = toOptionMapData({ picklist: snap?.picklist });
  const set = new Set(keys);
  const products = (snap?.products ?? []).filter((p: { catalogueLocationKeys?: string[] }) => p.catalogueLocationKeys?.some((k) => set.has(k)));
  const all = buildRawMap({ alwaysOn, picks: { [scope]: picks[scope] } }, { [scope]: products })[scope];
  const raw = Object.fromEntries(Object.entries(all).filter(([, values]) => values.length));
  const labels = buildLabelsMap({ [scope]: raw }, snap?.rows ?? [])[scope];

  // The sorts, derived on their own: the always-on sorts, then the scope's picks, each once; a field stays where some route product holds a value
  // (an always-on sort is read from the product itself, a pick from its filterAttributes). Names come from the same label rule as the controls.
  const holds = (product: unknown, field: string): boolean => {
    const value = sortAlwaysOn.includes(field) ? at(product, field) : at((product as { filterAttributes?: unknown })?.filterAttributes, field);
    return value !== undefined && value !== null && !(typeof value === 'string' && !value.trim());
  };
  const heldFields = [...new Set([...sortAlwaysOn, ...sortPicks[scope]])].filter((field) => products.some((p: unknown) => holds(p, field)));
  const sorts = buildSortLabels({ [scope]: heldFields }, snap?.rows ?? [])[scope];
  const expected: RouteControls = { raw, labels, sorts, products };

  const actual = await getRouteControls({ fetchRouteMapData: async () => toRouteMapData(route) }, { keys, scope });
  return {
    findings: compare(actual, expected).map((l) => `1 ${l}`),
    route: { id, scope, keys: keys.length, products: products.length, controls: Object.keys(expected.raw).length, sorts: Object.keys(expected.sorts).length },
  };
}

// Hand-written cases in the real query-result format with alien content; each must give the written answer.
async function fixtures(): Promise<string[]> {
  const picklist = {
    alwaysOn: ['brand', 'zinkLevel'],
    audioElectronics: ['quuxWidth', 'blipMode.low'],
    headphones: ['ignoredPick'],
    sortAlwaysOn: ['zinkLevel'],
    sortAudioElectronics: ['plinkRate'],
  };
  const products = [
    { name: 'Wumpus', brand: 'Zoo', zinkLevel: 30, filterAttributes: { quuxWidth: 'wide-strap', blipMode: { low: true }, plinkRate: 3 } },
    { name: 'Gribble', brand: 'Aardvark', zinkLevel: 5, filterAttributes: { quuxWidth: ['wide-strap', 'thin-cord'], blipMode: { low: false }, plinkRate: 9 } },
    { name: 'Fizzle', brand: 'Zoo', zinkLevel: 30, filterAttributes: { quuxWidth: 'thin-cord' } },
  ];
  const autoLabels = (): RouteControls['labels'] => ({
    brand: { label: 'Brand', options: { Aardvark: 'Aardvark', Zoo: 'Zoo' } },
    zinkLevel: { label: 'Zink level', options: { '5': '5', '30': '30' } },
    quuxWidth: { label: 'Quux width', options: { 'thin-cord': 'Thin Cord', 'wide-strap': 'Wide Strap' } },
    'blipMode.low': { label: 'Blip mode low', options: { false: 'No', true: 'Yes' } },
  });
  const baseRaw = (): RouteControls['raw'] => ({
    brand: ['Aardvark', 'Zoo'],
    zinkLevel: [5, 30],
    quuxWidth: ['thin-cord', 'wide-strap'],
    'blipMode.low': [false, true],
  });
  const baseSorts = (): RouteControls['sorts'] => ({ zinkLevel: 'Zink level', plinkRate: 'Plink rate' });
  const answerOf = (raw: RouteControls['raw'], labels: RouteControls['labels'], sorts: RouteControls['sorts']): RouteControls => ({ raw, labels, sorts, products });
  const findings: string[] = [];
  const call = async (name: string, result: unknown, expected: RouteControls) => {
    const actual = await getRouteControls({ fetchRouteMapData: async () => toRouteMapData(result) }, { keys: ['k1'], scope: 'audio-electronics' });
    for (const line of compare(actual, expected)) findings.push(`2 ${name}: ${line}`);
  };

  const happyLabels = autoLabels();
  happyLabels.quuxWidth.label = 'Quux span';
  happyLabels.brand.options.Zoo = 'Zoological';
  happyLabels['blipMode.low'].options.true = 'Blips low';
  const happySorts = baseSorts();
  happySorts.plinkRate = 'Plink pace';
  await call(
    'happy path',
    {
      picklist,
      rows: [
        { field: 'quuxWidth', text: 'Quux span' },
        { field: 'brand', value: 'Zoo', text: 'Zoological' },
        { field: 'blipMode.low', value: 'true', text: 'Blips low' },
        { field: 'plinkRate', text: 'Plink pace' },
      ],
      products,
    },
    answerOf(baseRaw(), happyLabels, happySorts),
  );

  await call('a control with no value on the route is dropped', { picklist: { ...picklist, audioElectronics: ['quuxWidth', 'nobodyHolds', 'blipMode.low'] }, rows: [], products }, answerOf(baseRaw(), autoLabels(), baseSorts()));

  await call('rows absent', { picklist, rows: null, products }, answerOf(baseRaw(), autoLabels(), baseSorts()));

  await call('a sort field no route product holds is dropped', { picklist: { ...picklist, sortAudioElectronics: ['plinkRate', 'nobodySorts'] }, rows: [], products }, answerOf(baseRaw(), autoLabels(), baseSorts()));

  await call('a sort pick that is also an always-on sort is listed once and read from the product', { picklist: { ...picklist, sortAudioElectronics: ['zinkLevel', 'plinkRate'] }, rows: [], products }, answerOf(baseRaw(), autoLabels(), baseSorts()));

  let thrown: string | undefined;
  let errors = 0;
  let firstArg: unknown;
  const original = console.error;
  console.error = (...args: unknown[]) => {
    errors++;
    if (errors === 1) firstArg = args[0];
  };
  let answer: RouteControls | undefined;
  try {
    answer = await getRouteControls({ fetchRouteMapData: async () => { throw new Error('boom'); } }, { keys: ['k1'], scope: 'audio-electronics' });
  } catch (e) {
    thrown = (e as Error).message;
  } finally {
    console.error = original;
  }
  if (thrown) findings.push(`2 the request throws: the use case threw "${thrown}"`);
  else if (JSON.stringify(answer) !== JSON.stringify({ raw: {}, labels: {}, sorts: {}, products: [] })) {
    findings.push(`2 the request throws: expected the empty answer with all four fields, got ${JSON.stringify(answer)}`);
  }
  if (errors !== 1) findings.push(`2 the request throws: console.error called ${errors} times, expected exactly 1`);
  if (typeof firstArg !== 'string' || !firstArg.startsWith('[getRouteControls]')) findings.push(`2 the request throws: console.error's first argument is not a string starting with [getRouteControls]`);
  return findings;
}

const QUESTIONS: Record<number, string> = {
  1: "on a real route, the use case's answer (controls, sorts, products) equals the answer derived from the same snapshot",
  2: 'the happy path, a control with no value, absent rows, a sort field no route product holds, a sort pick that is also an always-on sort and a failing request give the written answer',
};

function report(route: { id: string; scope: string; keys: number; products: number; controls: number; sorts: number } | undefined, found: Record<number, string[]>) {
  if (route) console.log(`Route: ${route.id} (${route.scope}), ${route.keys} keys, ${route.products} products, ${route.controls} controls drawn, ${route.sorts} sorts.\n`);
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
  console.log('Self-check: the comparison says NO to an extra option, a swapped control order, an extra sort, a swapped sort order and a missing product.\n');
  const { findings: liveFindings, route } = await live();
  const fixtureFindings = await fixtures();
  process.exit(report(route, { 1: liveFindings, 2: fixtureFindings }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
