// Filter panel proof: does the chain the listing runs (route answer, control model, decoded address, sections, counts, panel, chips, sort, narrowing) hang together on the real routes? PASS or NO. It tells the truth and nothing else.
//
// Three questions. All yes means done:
//   1. scopeOf: a listing route's slug gives the written picklist scope (no slug, the top-level category also for nested pages, an unknown first segment is all products)
//   2. on the real routes of the four scopes, for an empty address, one selection of each kind, a combination, a garbage address and a sort, `getFilterPanel` (the use case the listing calls, with the real rules and the real URL contract) gives one consistent answer,
//      checked against the number of products the narrowing selects in the same request as the snapshot the answer is built from: the empty address shows every option and selects every product; a single ticked option shows a number equal to the
//      total; a garbage address changes nothing; a sort changes the order and not the products; chips, panel and sort all say the same thing about the address
//   3. the host's wiring says what it must: the products reads embed the narrowing's `where`, `order` and `params` and are served under the shared cache rules (so the grid and the counts are as old as each other), the listing use case passes the narrowing to the count and to every chunk, the listing view mounts the four components, the servers wire the ports
//      (a text check of five files: it fails if a part is left out; it cannot say the page looks right, that is the hand check)
// No flakiness: per scope the sections, the route answer and every count come from one request, so nothing can change between them (a change between the two reads is no verdict, not a verdict); the rest is literal.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/filterPanelRealData.test.ts
// (it imports nuqs, so node_modules must be reachable)
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail(static) -> live -> mutants -> report

import fs from 'node:fs';
import { CATEGORIES } from '@/features/product-filtering/core/definitions/category';
import { PUBLISHED } from '@/features/product-filtering/adapters/sanity/optionMapData';
import { ROUTE_MAP_QUERY, toRouteMapData } from '@/features/product-filtering/adapters/sanity/routeMapData';
import { SECTION_QUERY, toSectionData } from '@/features/product-filtering/adapters/sanity/sectionData';
import { buildNarrowing } from '@/features/product-filtering/adapters/sanity/buildNarrowing';
import { buildUrlContract } from '@/features/product-filtering/url/controlUrl';
import { getFilterPanel, type FilterPanelPorts } from '@/features/product-filtering/queries/getFilterPanel';
import { scopeOf } from '@/features/product-filtering/core/rules/scopeOf';
import type { Control } from '@/features/product-filtering/core/types/controlModel';
import type { FilterPanelResult } from '@/features/product-filtering/core/types/filterPanel';
import type { Narrowing } from '@/features/product-filtering/core/types/narrowing';
import type { PanelControl } from '@/features/product-filtering/core/types/panel';
import type { PicklistScope } from '@/features/product-filtering/core/types/picklist';
import type { UrlPatch } from '@/features/product-filtering/core/types/urlState';

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

// Retag a narrowing so many can share one query: every $narrow_ becomes $<tag>_narrow_ and every param key gains the <tag>_ prefix.
const renamed = (n: Narrowing, tag: string): Narrowing => ({
  where: n.where.replace(/\$narrow_/g, `$${tag}_narrow_`),
  order: n.order.replace(/\$narrow_/g, `$${tag}_narrow_`),
  params: Object.fromEntries(Object.entries(n.params).map(([k, v]) => [`${tag}_${k}`, v])),
});

// ---- Question 1: scopeOf ---------------------------------------------------------------------------------------------------------

const SCOPE_CHECKS: { name: string; slug: string[] | null; expected: PicklistScope }[] = [
  { name: '/products has no slug: all products', slug: null, expected: 'all-products' },
  { name: 'an empty slug: all products', slug: [], expected: 'all-products' },
  { name: 'a top-level category', slug: ['headphones'], expected: 'headphones' },
  { name: 'a nested page keeps the top-level category', slug: ['audio-electronics', 'dacs'], expected: 'audio-electronics' },
  { name: 'a deeper page keeps it too', slug: ['accessories', 'cables', 'xlr'], expected: 'accessories' },
  { name: 'an unknown first segment is all products', slug: ['gift-cards'], expected: 'all-products' },
  { name: 'case matters', slug: ['Headphones'], expected: 'all-products' },
  { name: 'the text __proto__ is no category', slug: ['__proto__'], expected: 'all-products' },
  { name: 'a category name that is not first is not the scope', slug: ['gift-cards', 'headphones'], expected: 'all-products' },
];
const SCOPE_DEFECTS = ['unknown-is-headphones', 'last-segment', 'case-folded', 'null-throws'] as const;
type ScopeDefect = (typeof SCOPE_DEFECTS)[number];
function referenceScope(slug: string[] | null, defect?: ScopeDefect): PicklistScope {
  if (defect === 'null-throws') return (CATEGORIES as readonly string[]).includes(slug![0]) ? (slug![0] as PicklistScope) : 'all-products';
  if (!slug || slug.length === 0) return 'all-products';
  const pick = defect === 'last-segment' ? slug[slug.length - 1] : slug[0];
  const word = defect === 'case-folded' ? pick.toLowerCase() : pick;
  return (CATEGORIES as readonly string[]).includes(word) ? (word as PicklistScope) : defect === 'unknown-is-headphones' ? 'headphones' : 'all-products';
}

// ---- Question 3: the wiring, as text ---------------------------------------------------------------------------------------------

const WIRING: { name: string; file: string; pattern: RegExp; times?: number }[] = [
  { name: 'the count read embeds the narrowing\'s where', file: 'features/products/adapters/sanity/getProductsByVfsKeys.ts', pattern: /count\(\*\[_type == "product" && count\(catalogueLocationKeys\[@ in \$keys\]\) > 0 && \(\$\{narrowing\.where\}\)\]\)/ },
  { name: 'the chunk read embeds the where and the order', file: 'features/products/adapters/sanity/getProductsByVfsKeys.ts', pattern: /\(\$\{narrowing\.where\}\)\] \| order\(\$\{narrowing\.order\}\) \[\$\{offset\}\.\.\.\$\{end\}\]/ },
  { name: 'both reads send the narrowing\'s params', file: 'features/products/adapters/sanity/getProductsByVfsKeys.ts', pattern: /params: \{ keys, \.\.\.narrowing\.params \}/g, times: 2 },
  { name: 'both reads are served under the shared cache rules, so the grid and the counts are as old as each other', file: 'features/products/adapters/sanity/getProductsByVfsKeys.ts', pattern: /next: CATALOGUE_FETCH_CACHE \}\)/g, times: 2 },
  { name: 'the filtering server exports the shared cache rules to the products reads', file: 'features/product-filtering/server.ts', pattern: /export \{ CATALOGUE_FETCH_CACHE \} from '\.\/adapters\/sanity\/catalogueCache';/ },
  { name: 'the listing use case passes the narrowing to the count', file: 'features/products/queries/getListingPage.ts', pattern: /getNarrowedCount\(\{ keys, narrowing \}\)/ },
  { name: 'the listing use case passes the narrowing to every chunk', file: 'features/products/queries/getListingPage.ts', pattern: /getNarrowedChunk\(\{ keys, narrowing, offset, limit: CHUNK_SIZE \}\)/ },
  { name: 'the listing use case reads the scope from the slug and calls the filter panel with the route\'s keys and the raw query', file: 'features/products/queries/getListingPage.ts', pattern: /scopeOf\(slug\)[\s\S]*getFilterPanel\(\{ keys, scope, query \}\)/ },
  { name: 'the listing view mounts the panel, the sheet, the chips and the sort', file: 'features/products/view/ListingView.tsx', pattern: /^(?=[\s\S]*<FilterPanel )(?=[\s\S]*<FilterSheet )(?=[\s\S]*<ActiveFilters )(?=[\s\S]*<SortControl )/ },
  { name: 'the listing no longer mounts the old sidebar, sort bar or chips', file: 'features/products/view/ListingView.tsx', pattern: /^(?![\s\S]*(<FilterSidebar|<SortBar|<ActiveFilterChips))[\s\S]*$/ },
  { name: 'the products server wires the filter panel into the listing ports', file: 'features/products/server.ts', pattern: /filtering: \{ getFilterPanel \}/ },
  { name: 'the filtering server wires the route read, the sections, the decode and the narrowing', file: 'features/product-filtering/server.ts', pattern: /fetchRouteMapData,\n  fetchSections,\n  decode: \(model, query\) => buildUrlContract\(model\)\.decode\(query\),\n  narrow: buildNarrowing,/ },
];
function wiringFindings(): string[] {
  const found: string[] = [];
  for (const w of WIRING) {
    let text: string;
    try {
      text = fs.readFileSync(w.file, 'utf8');
    } catch (e) {
      found.push(`3 ${w.name}: cannot read ${w.file}`);
      continue;
    }
    const hits = (text.match(new RegExp(w.pattern.source, w.pattern.flags.replace('g', '') + (w.times ? 'g' : '')))?.length ?? 0);
    if (hits < (w.times ?? 1)) found.push(`3 ${w.name}: not found in ${w.file}`);
  }
  return found;
}

// ---- Question 2: the live chain --------------------------------------------------------------------------------------------------

type Kind = 'empty' | 'tick' | 'toggle' | 'range' | 'combo' | 'garbage' | 'sort';
type Sample = { name: string; kind: Kind; query: string; patch?: UrlPatch; chip?: string; res: FilterPanelResult; total: number };

const controlsOfPanel = (res: FilterPanelResult): PanelControl[] => res.panel.sections.flatMap((s) => s.controls);

function judge(scope: string, samples: Sample[], snapshotSize: number, mutate?: (res: FilterPanelResult, s: Sample, empty: FilterPanelResult) => FilterPanelResult): string[] {
  const found: string[] = [];
  const note = (s: Sample, msg: string) => found.push(`2 ${scope} / ${s.name}: ${msg}`);
  const empty = samples.find((s) => s.kind === 'empty')!;
  const emptyRes = empty.res;
  for (const s of samples) {
    const r = mutate ? mutate(s.res, s, emptyRes) : s.res;
    const controls = controlsOfPanel(r);
    if (s.kind === 'empty') {
      if (r.chips.length !== 0) note(s, `chips ${canon(r.chips)}`);
      if (r.sort !== null) note(s, `sort ${canon(r.sort)}`);
      if (r.narrowing.where !== 'true') note(s, `where ${r.narrowing.where}`);
      if (s.total !== snapshotSize) note(s, `the narrowing selects ${s.total} of ${snapshotSize} products`);
      for (const c of r.model.controls) {
        if (c.kind !== 'checkbox') continue;
        const drawn = controls.find((x) => x.path === c.path);
        if (!drawn || drawn.kind !== 'checkbox' || drawn.options.length !== c.options.length) note(s, `${c.path}: the empty address hides options (${drawn && drawn.kind === 'checkbox' ? drawn.options.length : 0} of ${c.options.length})`);
      }
    } else if (s.kind === 'tick') {
      const [path, value] = JSON.parse(s.chip!) as [string, string];
      if (canon(r.chips.map((c) => c.id)) !== canon([s.chip])) note(s, `chips ${canon(r.chips.map((c) => c.id))}, expected ${s.chip}`);
      if (r.narrowing.where === 'true') note(s, 'the narrowing ignores the selection');
      const drawn = controls.find((x) => x.path === path);
      const option = drawn && drawn.kind === 'checkbox' ? drawn.options.find((o) => o.value === value) : undefined;
      if (!option || !option.ticked) note(s, 'the panel does not show the option ticked');
      else if (option.count !== s.total) note(s, `the number beside the ticked option is ${option.count}, the narrowing selects ${s.total}`);
      if (r.sort !== null) note(s, `sort ${canon(r.sort)}`);
    } else if (s.kind === 'toggle') {
      if (r.chips.length !== 1 || r.chips[0].kind !== 'toggle') note(s, `chips ${canon(r.chips.map((c) => c.id))}`);
      if (r.narrowing.where === 'true') note(s, 'the narrowing ignores the toggle');
      const drawn = controls.find((x) => x.path === (r.chips[0]?.path ?? s.chip));
      if (!drawn || drawn.kind !== 'toggle' || !drawn.on) note(s, 'the panel does not show the toggle on');
      if (s.total > empty.total) note(s, `${s.total} products with a toggle on, ${empty.total} without`);
    } else if (s.kind === 'range') {
      const [path] = JSON.parse(s.chip!) as [string];
      if (r.chips.length !== 1 || r.chips[0].kind !== 'range') note(s, `chips ${canon(r.chips.map((c) => c.id))}`);
      if (r.narrowing.where === 'true') note(s, 'the narrowing ignores the range');
      const drawn = controls.find((x) => x.path === path);
      if (!drawn || drawn.kind !== 'range' || canon(drawn.selected) !== canon(s.patch![path])) note(s, 'the panel does not show the range selected');
      if (s.total > empty.total) note(s, `${s.total} products in a range, ${empty.total} without`);
    } else if (s.kind === 'combo') {
      if (r.chips.length !== Object.keys(s.patch!).reduce((n, k) => n + (Array.isArray(s.patch![k]) ? (s.patch![k] as string[]).length : 1), 0)) note(s, `${r.chips.length} chips for ${Object.keys(s.patch!).length} selections`);
      // The parts of the combination: the single selections whose every key is in the combination with the same value.
      const singles = samples.filter((x) => (x.kind === 'tick' || x.kind === 'toggle' || x.kind === 'range') && Object.keys(x.patch!).every((k) => canon(x.patch![k]) === canon(s.patch![k]))).map((x) => x.total);
      if (r.narrowing.where === 'true') note(s, 'the narrowing ignores the combination');
      if (singles.length && s.total > Math.min(...singles)) note(s, `${s.total} products for the combination, but a single selection selects ${Math.min(...singles)}`);
    } else if (s.kind === 'garbage') {
      if (r.chips.length !== 0) note(s, `chips ${canon(r.chips.map((c) => c.id))}`);
      if (canon(r.narrowing) !== canon(emptyRes.narrowing)) note(s, 'the narrowing differs from the empty address\'s');
      if (canon(r.panel) !== canon(emptyRes.panel)) note(s, 'the panel differs from the empty address\'s');
      if (s.total !== empty.total) note(s, `${s.total} products, ${empty.total} for the empty address`);
    } else if (s.kind === 'sort') {
      const want = s.patch!.sort;
      if (canon(r.sort) !== canon(want)) note(s, `sort ${canon(r.sort)}, expected ${canon(want)}`);
      if (r.narrowing.where !== 'true') note(s, `where ${r.narrowing.where}`);
      if (r.narrowing.order === emptyRes.narrowing.order) note(s, 'the order is the empty address\'s');
      if (s.total !== empty.total) note(s, `${s.total} products, ${empty.total} for the empty address`);
      if (r.chips.length !== 0) note(s, 'a sort made a chip');
    }
  }
  return found;
}

const MUTANTS: { name: string; mutate: (res: FilterPanelResult, s: Sample, empty: FilterPanelResult) => FilterPanelResult }[] = [
  { name: 'the narrowing ignores the state', mutate: (r, _s, e) => ({ ...r, narrowing: e.narrowing }) },
  { name: 'the chips are lost', mutate: (r) => ({ ...r, chips: [] }) },
  {
    name: 'the panel is drawn from the empty state (nothing ticked, toggles off, ranges unset)',
    mutate: (r) => ({
      ...r,
      panel: {
        sections: r.panel.sections.map((sec) => ({
          ...sec,
          controls: sec.controls.map((c) => (c.kind === 'checkbox' ? { ...c, options: c.options.map((o) => ({ ...o, ticked: false })) } : c.kind === 'toggle' ? { ...c, on: false } : { ...c, selected: null })),
        })),
      },
    }),
  },
  { name: 'the sort is lost', mutate: (r) => ({ ...r, sort: null }) },
  {
    name: 'the counts are one too high',
    mutate: (r) => ({ ...r, panel: { sections: r.panel.sections.map((sec) => ({ ...sec, controls: sec.controls.map((c) => (c.kind === 'checkbox' ? { ...c, options: c.options.map((o) => ({ ...o, count: o.count + 1 })) } : c)) })) } }),
  },
  { name: 'the empty address hides the first option of every checkbox', mutate: (r, s) => (s.kind === 'empty' ? { ...r, panel: { sections: r.panel.sections.map((sec) => ({ ...sec, controls: sec.controls.map((c) => (c.kind === 'checkbox' ? { ...c, options: c.options.slice(1) } : c)) })) } } : r) },
];

type Item = { _id: string; slug?: string; parent?: string };

async function live(): Promise<{ findings: string[]; summaries: string[]; judged: { scope: string; samples: Sample[]; size: number }[] }> {
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
  const judged: { scope: string; samples: Sample[]; size: number }[] = [];
  const portsOf = (r: any): FilterPanelPorts => ({
    fetchRouteMapData: async () => toRouteMapData(r.route),
    fetchSections: async () => toSectionData(r.sections),
    decode: (model, query) => buildUrlContract(model).decode(query),
    narrow: buildNarrowing,
  });

  for (const scope of [...CATEGORIES, 'all-products'] as PicklistScope[]) {
    let keys: string[];
    if (scope === 'all-products') keys = items.map((i) => i._id);
    else {
      const root = items.find((i) => !i.parent && i.slug === scope);
      if (!root) throw new Error(`no root catalogue item with slug "${scope}"`);
      keys = subtree(root._id);
    }
    // Step 1: the model, from one request; the samples are built from it.
    const r1 = await ask(`{ "sections": ${SECTION_QUERY}, "route": ${ROUTE_MAP_QUERY} }`, { keys });
    if (r1.status !== 200) throw new Error(`read failed for ${scope}: HTTP ${r1.status} ${r1.error ?? ''}`);
    const empty1 = await getFilterPanel(portsOf(r1.result), { keys, scope, query: '' });
    const model = empty1.model;
    if (model.controls.length === 0) throw new Error(`scope ${scope}: the model holds no controls`);
    const contract = buildUrlContract(model);
    const address = (patch: UrlPatch) => contract.encode('', patch);
    const checkboxes = model.controls.filter((c): c is Extract<Control, { kind: 'checkbox' }> => c.kind === 'checkbox' && c.options.length > 0);
    const toggle = model.controls.find((c) => c.kind === 'toggle');
    const range = model.controls.find((c): c is Extract<Control, { kind: 'range' }> => c.kind === 'range');
    if (checkboxes.length === 0) throw new Error(`scope ${scope}: no checkbox control to sample`);
    const specs: Omit<Sample, 'res' | 'total'>[] = [{ name: 'empty address', kind: 'empty', query: '' }];
    for (const c of checkboxes.slice(0, 3)) {
      const patch = { [c.path]: [c.options[0].value] };
      specs.push({ name: `one option of ${c.path}`, kind: 'tick', query: address(patch), patch, chip: JSON.stringify([c.path, c.options[0].value]) });
    }
    if (toggle) specs.push({ name: `${toggle.path} on`, kind: 'toggle', query: address({ [toggle.path]: true }), patch: { [toggle.path]: true }, chip: JSON.stringify([toggle.path]) });
    const half = range ? { min: range.span.min, max: (range.span.min + range.span.max) / 2 } : null;
    if (range && half) specs.push({ name: `${range.path} lower half`, kind: 'range', query: address({ [range.path]: half }), patch: { [range.path]: half }, chip: JSON.stringify([range.path]) });
    const combo: UrlPatch = { [checkboxes[0].path]: [checkboxes[0].options[0].value] };
    if (toggle) combo[toggle.path] = true;
    if (range && half) combo[range.path] = half;
    if (Object.keys(combo).length >= 2) specs.push({ name: 'a combination', kind: 'combo', query: address(combo), patch: combo });
    specs.push({ name: 'a garbage address', kind: 'garbage', query: `?nope=1&page=zzz&foo=bar&${encodeURIComponent(checkboxes[0].path)}=__no_such_option__` });
    if (model.sorts.length > 0) {
      const sort = { field: model.sorts[0].value, direction: 'desc' as const };
      specs.push({ name: `sorted by ${sort.field}`, kind: 'sort', query: address({ sort }), patch: { sort } });
    }

    // Step 2: the same request again with every count in it, so the snapshot and the counts cannot differ.
    const narrowings = await Promise.all(specs.map((sp) => getFilterPanel(portsOf(r1.result), { keys, scope, query: sp.query })));
    const parts: string[] = [];
    const params: Record<string, unknown> = { keys };
    narrowings.forEach((res, i) => {
      const n = renamed(res.narrowing, `s${i}`);
      parts.push(`"q${i}": count(docs[(${n.where})])`);
      Object.assign(params, n.params);
    });
    const scopeFilter = `_type == "product" && ${PUBLISHED} && count(catalogueLocationKeys[@ in $keys]) > 0`;
    const r2 = await ask(
      `{ "docs": *[${scopeFilter}], "sections": ${SECTION_QUERY}, "route": ${ROUTE_MAP_QUERY} }{ "sections": sections, "route": route, "size": count(docs), ${parts.join(', ')} }`,
      params,
    );
    if (r2.status !== 200) throw new Error(`count read failed for ${scope}: HTTP ${r2.status} ${r2.error ?? ''}`);
    if (canon(r2.result.sections) !== canon(r1.result.sections) || canon(r2.result.route) !== canon(r1.result.route))
      throw new Error(`scope ${scope}: the data changed between the two reads of the proof (rerun it)`);
    const samples: Sample[] = specs.map((sp, i) => ({ ...sp, res: narrowings[i], total: r2.result[`q${i}`] as number }));
    const size = r2.result.size as number;
    if (size !== (r2.result.route.products as unknown[]).length) throw new Error(`scope ${scope}: the route answer holds ${(r2.result.route.products as unknown[]).length} products, the scope holds ${size}`);
    findings.push(...judge(scope, samples, size));
    judged.push({ scope, samples, size });
    const e = samples[0];
    summaries.push(`Scope ${scope}: ${size} products, ${model.controls.length} controls, ${e.res.panel.sections.length} sections, ${samples.length} addresses checked, ${samples.filter((s) => s.total < size).length} of them narrow the products.`);
  }
  return { findings, summaries, judged };
}

// The proof can say no: each reference must give the written scopes, each defect must differ somewhere, each wiring pattern must be non-vacuous, and (after the live read) each mutant must be refused.
function staticSelfCheck(): string[] {
  const problems: string[] = [];
  for (const c of SCOPE_CHECKS) if (referenceScope(c.slug) !== c.expected) problems.push(`the scope reference does not give ${c.expected} for ${c.name}`);
  for (const d of SCOPE_DEFECTS) {
    const differs = SCOPE_CHECKS.some((c) => {
      try {
        return referenceScope(c.slug, d) !== c.expected;
      } catch {
        return true;
      }
    });
    if (!differs) problems.push(`the scope cases do not say NO to ${d}`);
  }
  for (const w of WIRING) if (new RegExp(w.pattern.source, w.pattern.flags.replace('g', '')).test('') && !w.name.includes('no longer')) problems.push(`the wiring pattern for "${w.name}" matches the empty text`);
  return problems;
}

const QUESTIONS: Record<number, string> = {
  1: 'scopeOf: a listing route\'s slug gives the written picklist scope',
  2: 'on the real routes, the chain the listing runs gives one consistent answer for every kind of address, checked against the narrowing\'s own count in the same request',
  3: 'the host\'s wiring says what it must (a text check)',
};

function report(summaries: string[], found: Record<number, string[]>) {
  if (summaries.length) console.log(`${summaries.join('\n')}\n`);
  for (const id of [1, 2, 3]) {
    const lines = found[id] ?? [];
    if (!lines.length) console.log(`${id} yes - ${QUESTIONS[id]}\n`);
    else console.log(`${id} NO - ${QUESTIONS[id]}\n${lines.slice(0, 25).map((l) => `  ${l}`).join('\n')}\n`);
  }
  const bad = [1, 2, 3].some((id) => (found[id] ?? []).length);
  console.log(bad ? 'RESULT: NO' : 'RESULT: PASS');
  return bad ? 1 : 0;
}

try {
  const broken = staticSelfCheck();
  if (broken.length) {
    console.error(`NO VERDICT: the proof itself is broken\n${broken.map((l) => `  ${l}`).join('\n')}`);
    process.exit(2);
  }
  const { findings, summaries, judged } = await live();
  // The checks of question 2 must refuse every mutant on the live data.
  for (const m of MUTANTS) {
    const refused = judged.some((j) => judge(j.scope, j.samples, j.size, m.mutate).length > 0);
    if (!refused) {
      console.error(`NO VERDICT: the proof itself is broken\n  the checks of question 2 do not refuse the mutant "${m.name}"`);
      process.exit(2);
    }
  }
  console.log(
    `Self-check: the written scopes agree with a reference and say NO to ${SCOPE_DEFECTS.length} planted defects (an unknown first segment taken as headphones, the last segment used, case folded, no slug crashing); the wiring patterns are not vacuous; the checks of question 2 refuse ${MUTANTS.length} mutants of the live answer (the narrowing ignoring the state, chips lost, the panel drawn from the empty state, the sort lost, counts one too high, the empty address hiding options).\n`,
  );
  const scopeFindings = SCOPE_CHECKS.flatMap((c) => {
    try {
      const got = scopeOf(c.slug);
      return got === c.expected ? [] : [`1 ${c.name}: expected ${c.expected}, got ${got}`];
    } catch (e) {
      return [`1 ${c.name}: threw ${(e as Error).message}`];
    }
  });
  process.exit(report(summaries, { 1: scopeFindings, 2: findings, 3: wiringFindings() }));
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
