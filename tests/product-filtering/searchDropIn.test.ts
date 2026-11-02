// Search drop-in proof: does the filter feature work over /search's own matched products, the way the search page wires it? PASS or NO. It tells the truth and nothing else.
//
// Six questions. All yes means done:
//   1. DOOR: on the real routes, `getFilterPanelOver` (what the search use case calls, over the matched products) gives the same model, panel, chips, sort and narrowing as `getFilterPanel` (what the listing calls)
//   2. RESULT: `toFeatureProducts` and `buildSearchResult` give the grid, the counts and the shape the view reads (pure, on fixtures whose content exists nowhere in the shop)
//   3. COUNTS EQUAL THE GRID: on live Search, the number the panel shows beside a brand option equals the total the narrowed grid reports
//   4. ADDRESS: ticking an option keeps `q`, `cat` and `sort`, writes the option's key and drops `page`
//   5. WIRING: the search results view mounts the feature's components and holds nothing of the deleted ones (a text check)
//   6. GONE: none of the exports of the files wave 4 deleted remains in the tree (git grep)
// No flakiness: questions 2, 4, 5, 6 are literal; 1 and 3 read live data and a failed read is no verdict, not a no.
//
// Human-run: node --env-file=/home/jan/work/sanglogium/.env.local --conditions=react-server --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/searchDropIn.test.ts
// (it imports nuqs and the server doors, so node_modules must be reachable and --conditions=react-server is needed; `server-only`, `next-sanity` and the filter client door are swapped in the file)
// Exit 0 PASS. Exit 1 NO, every finding is printed. Exit 2 no verdict: it could not read, or the proof itself is broken.
//
// FLOW  proofCanFail(static mutants) -> live (1, 3) -> pure (2, 4, 5, 6) -> report

import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { createClient } from '@sanity/client';
import { registerHooks } from 'node:module';

// Plain node cannot load `next-sanity` (it imports next/dynamic), has no `server-only` package, and cannot load the .tsx components the filter door re-exports,
// so those imports are swapped. Every query and all the code that shapes the result is the real one; only the transport differs.
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  useCdn: false,
  perspective: 'published',
});
(globalThis as any).__snapshotFetch = (query: string, params: object) => client.fetch(query, params);
const stub = (source: string) => ({ url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true });
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return stub('');
    if (specifier === 'next-sanity') return stub('export const groq = (s, ...v) => s.reduce((a, c, i) => a + c + (v[i] ?? ""), "");');
    if (specifier === '@/platform/sanity/client') return stub('export const sanityFetch = ({ query, params }) => globalThis.__snapshotFetch(query, params ?? {});');
    // The client door re-exports React components; the search rules read only the category list from it.
    if (specifier === '@/features/product-filtering') return nextResolve('@/features/product-filtering/core/definitions/category', context);
    return nextResolve(specifier, context);
  },
});

const { PUBLISHED } = await import('@/features/product-filtering/adapters/sanity/optionMapData');
const { ROUTE_MAP_QUERY, toRouteMapData } = await import('@/features/product-filtering/adapters/sanity/routeMapData');
const { buildUrlContract } = await import('@/features/product-filtering/url/controlUrl');
const { getFilterPanel, getFilterPanelOver } = await import('@/features/product-filtering/server');
const { scopeToCategory, toFeatureProducts, buildSearchResult } = await import('@/features/product-search/core/rules/searchResults');
const { ROOT_CATEGORIES } = await import('@/features/product-search/core/rules/searchScoring');
const { deriveSpacedQuery } = await import('@/features/product-search/core/rules/searchText');
const { countSearchMatches, fetchMatchedProducts, fetchNarrowedIds } = await import('@/features/product-search/adapters/sanity/searchProducts');

// The same walk as getCategoryLookup in features/catalogue/adapters/catalogue-index/catalogueIndex.ts, on the same JSON (that module cannot be loaded in plain node).
const catalogueIndex = JSON.parse(fs.readFileSync('data/catalogue-index.json', 'utf8'));
const getCategoryLookup = (): CategoryLookup => {
  const parentById: Record<string, string> = {};
  for (const [parentId, meta] of Object.entries(catalogueIndex.slotMetadataMap as Record<string, { children: string[] }>)) {
    for (const childId of meta.children) parentById[childId] = parentId;
  }
  return { parentById, idBySlug: catalogueIndex.slugToIdMap };
};
import type { Control, ControlModel } from '@/features/product-filtering/core/types/controlModel';
import type { FeatureProduct, SearchProduct } from '@/features/product-search/core/types/searchTypes';
import type { CategoryLookup } from '@/features/catalogue';
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

type Item = { _id: string; slug?: string; parent?: string };

// A scope's keys, the way filterPanelRealData.test.ts gets them: the published catalogue items, the subtree under the scope's root.
async function scopeKeys(): Promise<{ categoryKeys: string[]; allKeys: string[] }> {
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
  const root = items.find((i) => !i.parent && i.slug === 'headphones');
  if (!root) throw new Error('no root catalogue item with slug "headphones"');
  return { categoryKeys: subtree(root._id), allKeys: items.map((i) => i._id) };
}

// ---- Question 1: the door ---------------------------------------------------------------------------------------------------------

const patchFor = (c: Control): UrlPatch | null =>
  c.kind === 'checkbox' && c.options.length > 0
    ? { [c.path]: [c.options[0].value] }
    : c.kind === 'toggle'
      ? { [c.path]: true }
      : c.kind === 'range'
        ? { [c.path]: { min: c.span.min, max: c.span.max } }
        : null;

async function question1(): Promise<{ findings: string[]; summaries: string[]; model: ControlModel }> {
  const findings: string[] = [];
  const summaries: string[] = [];
  const { categoryKeys, allKeys } = await scopeKeys();
  let model: ControlModel | null = null;
  for (const { scope, keys } of [
    { scope: 'headphones' as const, keys: categoryKeys },
    { scope: 'all-products' as const, keys: allKeys },
  ]) {
    const r = await ask(ROUTE_MAP_QUERY, { keys });
    if (r.status !== 200) throw new Error(`route map read failed for ${scope}: HTTP ${r.status} ${r.error ?? ''}`);
    const products = toRouteMapData(r.result).products;
    const empty = await getFilterPanelOver(products, { scope, query: '' });
    const contract = buildUrlContract(empty.model);
    const usable = empty.model.controls.filter((c) => patchFor(c) !== null);
    if (usable.length < 2) throw new Error(`scope ${scope}: fewer than two controls give a patch`);
    const patches: UrlPatch[] = [{}, patchFor(usable[0])!, { ...patchFor(usable[0]), ...patchFor(usable[1]) }];
    const addresses = patches.map((p) => contract.encode('', p));
    let compared = 0;
    for (const query of addresses) {
      const over = await getFilterPanelOver(products, { scope, query });
      const route = await getFilterPanel({ keys, scope, query });
      for (const part of ['model', 'panel', 'chips', 'sort', 'narrowing'] as const) {
        if (canon(over[part]) !== canon(route[part])) findings.push(`1 ${scope} / "${query}": ${part} differs`);
      }
      compared++;
    }
    if (scope === 'all-products') model = empty.model;
    summaries.push(`scope ${scope}: ${products.length} products, ${compared} addresses compared`);
  }
  return { findings, summaries, model: model! };
}

// ---- Question 2: the result, on alien fixtures -------------------------------------------------------------------------------------

// Twelve products over the three root categories, two brands, names and values that exist nowhere in the shop.
const ALIEN_WORD = 'qzblip';
const LOOKUP: CategoryLookup = {
  idBySlug: { headphones: 'root-h', 'audio-electronics': 'root-a', accessories: 'root-x' },
  parentById: { 'leaf-h': 'root-h', 'leaf-a': 'root-a', 'leaf-x': 'root-x' },
};
const KEYS = { headphones: 'leaf-h', 'audio-electronics': 'leaf-a', accessories: 'leaf-x' } as const;

function fixture(id: string, name: string, brand: string | null, amount: number, leaf: string): SearchProduct {
  return {
    _id: id,
    name,
    sku: `sku-${id}`,
    brand: brand ? { _id: `b-${brand}`, name: brand } : null,
    price_data: { currency: 'EUR', unit_amount: amount },
    stock: 3,
    reservedStock: 0,
    availableStock: 3,
    slug: { current: `slug-${id}` },
    image: null,
    catalogueLocationKeys: [leaf],
    filterAttributes: { 'alien-pick': [`${ALIEN_WORD}-pick-${id}`] },
    brandRef: brand ? { name: brand, slug: brand } : null,
    price: amount,
  };
}

// In the headphones scope, the narrowed set is 'p-h1' (exact name, dearest), 'p-h2' (name prefix, cheapest), 'p-h3' (name substring, middle price); 'p-h4' is matched but not narrowed. One product per other category is out of the window too.
const FIXTURES: SearchProduct[] = [
  fixture('p-h1', `${ALIEN_WORD}`, 'ZQLARA', 300, KEYS.headphones),
  fixture('p-h2', `${ALIEN_WORD} probe`, 'VUNTHO', 100, KEYS.headphones),
  fixture('p-h3', `oh ${ALIEN_WORD} unit`, 'ZQLARA', 200, KEYS.headphones),
  fixture('p-h4', `${ALIEN_WORD} case`, 'VUNTHO', 400, KEYS.headphones),
  fixture('p-a1', `${ALIEN_WORD} dac`, 'ZQLARA', 500, KEYS['audio-electronics']),
  fixture('p-a2', `${ALIEN_WORD} amp`, 'VUNTHO', 600, KEYS['audio-electronics']),
  fixture('p-a3', `${ALIEN_WORD} streamer`, 'ZQLARA', 700, KEYS['audio-electronics']),
  fixture('p-a4', `${ALIEN_WORD} transport`, 'VUNTHO', 800, KEYS['audio-electronics']),
  fixture('p-x1', `${ALIEN_WORD} cable`, 'ZQLARA', 10, KEYS.accessories),
  fixture('p-x2', `${ALIEN_WORD} stand`, 'VUNTHO', 20, KEYS.accessories),
  fixture('p-x3', `${ALIEN_WORD} remote`, 'ZQLARA', 30, KEYS.accessories),
  fixture('p-x4', `${ALIEN_WORD} shelf`, 'VUNTHO', 40, KEYS.accessories),
];
const NARROWED = FIXTURES.filter((p) => !['p-h4', 'p-a4', 'p-x4'].includes(p._id)).map((p) => p._id);
const SCOPED = scopeToCategory({ matched: FIXTURES, category: 'headphones', lookup: LOOKUP }).scoped;

const baseInput = {
  matched: FIXTURES,
  scoped: SCOPED,
  category: 'headphones' as const,
  narrowedIds: NARROWED,
  unfilteredCount: FIXTURES.length,
  rawQuery: ALIEN_WORD,
  page: 1,
  perPage: 24,
  lookup: LOOKUP,
};

// The checks of question 2, run against the real functions and against mutants in the self-check.
function checkResult(featOf: (scoped: SearchProduct[]) => FeatureProduct[], build: (input: typeof baseInput & { sort?: string }) => ReturnType<typeof buildSearchResult>): string[] {
  const found: string[] = [];
  const feat = featOf(SCOPED);
  const featShape = ['brand', 'filterAttributes', 'name', 'price_data', 'stock'];
  if (feat.length !== SCOPED.length) found.push(`2 toFeatureProducts gives ${feat.length} products, the category holds ${SCOPED.length}`);
  for (const f of feat) {
    if (canon(Object.keys(f)) !== canon(featShape)) found.push(`2 a feature product has keys ${canon(Object.keys(f))}`);
    if (!SCOPED.some((p) => p.name === f.name)) found.push(`2 feature product "${f.name}" is not in the category`);
  }
  const res = build({ ...baseInput });
  if (res.totalCount !== 3) found.push(`2 totalCount ${res.totalCount}, expected 3`);
  if (canon(res.products.map((p) => p._id)) !== canon(['p-h1', 'p-h2', 'p-h3'])) found.push(`2 relevance grid ${canon(res.products.map((p) => p._id))}, expected ["p-h1","p-h2","p-h3"]`);
  const counts = Object.fromEntries((res.categoryCounts ?? []).map((c) => [c.id, c.count]));
  for (const c of ROOT_CATEGORIES) if (counts[c.id] !== 3) found.push(`2 categoryCounts.${c.id} ${counts[c.id]}, expected 3`);
  if (res.allCategoriesCount !== 9) found.push(`2 allCategoriesCount ${res.allCategoriesCount}, expected 9`);
  for (const p of res.products) {
    for (const key of ['filterAttributes', 'brandRef', 'price'] as const) if (key in p) found.push(`2 a page product still carries ${key}`);
  }
  const asc = build({ ...baseInput, sort: 'price-asc' });
  if (canon(asc.products.map((p) => p._id)) !== canon(['p-h2', 'p-h3', 'p-h1'])) found.push(`2 price-asc grid ${canon(asc.products.map((p) => p._id))}, expected ["p-h2","p-h3","p-h1"]`);
  const paged = build({ ...baseInput, page: 2, perPage: 2 });
  if (canon(paged.products.map((p) => p._id)) !== canon(['p-h3'])) found.push(`2 page 2 of 2-per-page ${canon(paged.products.map((p) => p._id))}, expected ["p-h3"]`);
  const none = build({ ...baseInput, narrowedIds: [], unfilteredCount: 0 });
  const filteredOut = build({ ...baseInput, narrowedIds: [] });
  if (!(none.unfilteredCount === 0 && none.totalCount === 0)) found.push('2 a result with no matches is not told by unfilteredCount 0 and totalCount 0');
  if (!(filteredOut.unfilteredCount === FIXTURES.length && filteredOut.totalCount === 0)) found.push('2 a result the filters emptied is not told apart from no matches');
  return found;
}

const Q2_MUTANTS: { name: string; featOf?: (scoped: SearchProduct[]) => FeatureProduct[]; build?: (input: typeof baseInput & { sort?: string }) => ReturnType<typeof buildSearchResult> }[] = [
  { name: 'buildSearchResult ignores narrowedIds', build: (input) => buildSearchResult({ ...input, narrowedIds: input.matched.map((p) => p._id) }) },
  { name: 'buildSearchResult counts the categories from the scoped products', build: (input) => buildSearchResult({ ...input, matched: input.scoped }) },
  { name: 'the feature gets the unscoped products', featOf: () => toFeatureProducts(FIXTURES) },
];

// ---- Question 4: the address --------------------------------------------------------------------------------------------------------

const ADDRESS_BASE = '?q=sony&cat=headphones&sort=price-asc&page=3';

// What one written address must hold; run against the real address and against the planted one in the self-check.
function checkAddress(addr: string, brandPath: string, brandValue: string): string[] {
  const found: string[] = [];
  const params = new URLSearchParams(addr.startsWith('?') ? addr.slice(1) : addr);
  if (params.get('q') !== 'sony') found.push(`4 the address drops q (${addr})`);
  if (params.get('cat') !== 'headphones') found.push(`4 the address drops cat (${addr})`);
  if (params.get('sort') !== 'price-asc') found.push(`4 the address drops sort=price-asc (${addr})`);
  if (params.get(brandPath) !== brandValue) found.push(`4 the address holds no ${brandPath}=${brandValue} (${addr})`);
  if (params.has('page')) found.push(`4 the address still holds page (${addr})`);
  return found;
}

const brandControlOf = (model: ControlModel) => model.controls.find((c): c is Extract<Control, { kind: 'checkbox' }> => c.kind === 'checkbox' && (c.path === 'brand' || /brand/i.test(c.label)));

// ---- Question 5: the wiring, as text -------------------------------------------------------------------------------------------------

const VIEW_FILE = 'features/product-search/view/SearchResultsView.tsx';
const VIEW_GONE = ['FilterSidebar', 'MobileFilterSheet', 'ActiveFilterChips', 'EmptyResults', 'resolvePriceBounds', 'isFiltersActive'];

function checkView(text: string): string[] {
  const found: string[] = [];
  const importLine = text.match(/import\s*\{([^}]*)\}\s*from\s*'@\/features\/product-filtering'/);
  for (const name of ['FilterPanel', 'FilterSheet', 'ActiveFilters']) {
    if (!importLine || !new RegExp(`\\b${name}\\b`).test(importLine[1])) found.push(`5 the view does not import ${name} from '@/features/product-filtering'`);
    if (!new RegExp(`<${name}[\\s>]`).test(text)) found.push(`5 the view does not mount <${name}`);
  }
  for (const name of VIEW_GONE) if (new RegExp(`\\b${name}\\b`).test(text)) found.push(`5 the view still contains ${name}`);
  return found;
}

// ---- Question 6: gone ----------------------------------------------------------------------------------------------------------------

// The files wave 4 deleted and the names they exported. A name whose defining file is still in the tree is not searched.
const DELETED: Record<string, string> = {
  FilterSidebar: 'features/product-filtering/ui/FilterSidebar.tsx',
  MobileFilterSheet: 'features/product-filtering/ui/MobileFilterSheet.tsx',
  ActiveFilterChips: 'features/product-filtering/ui/ActiveFilterChips.tsx',
  FilterControls: 'features/product-filtering/ui/FilterControls.tsx',
  ProgressiveFilterOptionList: 'features/product-filtering/ui/ProgressiveFilterOptionList.tsx',
  useFilterParam: 'features/product-filtering/state/useFilterParam.ts',
  useClearAllFilters: 'features/product-filtering/state/useFilterParam.ts',
  filterSortParams: 'features/product-filtering/url/filterSortParams.ts',
  loadFacetFilterState: 'features/product-filtering/url/filterSortParams.ts',
  computeCatalogueFacets: 'features/product-filtering/queries/getFilterFacets.ts',
  productMatchesState: 'features/product-filtering/adapters/sanity/buildProductQuery.ts',
  buildFacetSet: 'features/product-filtering/core/rules/buildFacetSet.ts',
  sanitizeFilterState: 'features/product-filtering/core/rules/sanitizeFilterState.ts',
  resolvePriceBounds: 'features/product-filtering/core/rules/priceBounds.ts',
  isFiltersActive: 'features/product-filtering/core/rules/sanitizeFilterState.ts',
  SORT_DEFAULT: 'features/product-filtering/core/definitions/sortOptions.ts',
  EmptyResults: 'features/products/ui/listing/EmptyResults.tsx',
  projectFacets: 'features/product-filtering/core/rules/projectFacets.ts',
  deriveControl: 'features/product-filtering/core/rules/deriveControl.ts',
  deriveOptions: 'features/product-filtering/core/rules/deriveOptions.ts',
  facetKey: 'features/product-filtering/core/rules/facetKey.ts',
  fieldInventory: 'features/product-filtering/core/rules/fieldInventory.ts',
  applyOptionLabels: 'features/product-filtering/core/rules/applyOptionLabels.ts',
  awaitingLaterChunks: 'features/product-filtering/core/definitions/awaitingLaterChunks.ts',
  optionLabelOverrides: 'features/product-filtering/core/definitions/optionLabelOverrides.ts',
  CatalogueFacets: 'features/product-filtering/core/types/facetProjection.ts',
  PriceRangeData: 'features/product-filtering/core/rules/priceBounds.ts',
  FacetSet: 'features/product-filtering/core/types/facetProjection.ts',
  ProductQueryState: 'features/product-filtering/core/types/filterTypes.ts',
};
const GONE_PATHS = 'features app platform docs tests tools scripts studio CLAUDE.md :(exclude)tests/product-filtering/searchDropIn.test.ts';

function question6(): { findings: string[]; searched: string[] } {
  const searched = Object.keys(DELETED).filter((name) => !fs.existsSync(DELETED[name]));
  const findings: string[] = [];
  for (const name of searched) {
    const out = execSync(`git grep -w -l ${JSON.stringify(name)} -- ${GONE_PATHS} || true`, { encoding: 'utf8' }).trim();
    if (out) findings.push(`6 ${name}: still found in ${out.split('\n').join(', ')}`);
  }
  return { findings, searched };
}

// ---- Question 3: counts equal the grid, live -------------------------------------------------------------------------------------------

const WORDS = ['headphone', 'cable', 'dac'];

async function question3(): Promise<{ findings: string[]; summaries: string[] }> {
  const findings: string[] = [];
  const summaries: string[] = [];
  const lookup = getCategoryLookup();
  for (const word of WORDS) {
    const searchTerm = `${word}*`;
    const spacedTerm = `${deriveSpacedQuery(word)}*`;
    const unfilteredCount = await countSearchMatches(searchTerm, spacedTerm);
    if (unfilteredCount === null) throw new Error(`count read failed for "${word}"`);
    if (unfilteredCount <= 30) throw new Error(`the proof's word "${word}" matches ${unfilteredCount} products (needs more than 30): pick another word`);
    const matched = await fetchMatchedProducts(searchTerm, spacedTerm, Math.min(unfilteredCount, 2000));
    if (!matched) throw new Error(`matched products read failed for "${word}"`);
    const products = toFeatureProducts(matched);
    const empty = await getFilterPanelOver(products, { scope: 'all-products', query: '' });
    const brand = brandControlOf(empty.model);
    if (!brand || brand.options.length < 3) throw new Error(`query "${word}": no brand control with three options`);
    const panelBrand = empty.panel.sections.flatMap((s) => s.controls).find((c) => c.path === brand.path);
    if (!panelBrand || panelBrand.kind !== 'checkbox') throw new Error(`query "${word}": the panel does not draw the brand control`);
    const contract = buildUrlContract(empty.model);
    for (const option of panelBrand.options.slice(0, 3)) {
      const query = contract.encode('', { [brand.path]: [option.value] });
      const res = await getFilterPanelOver(products, { scope: 'all-products', query });
      const narrowedIds = await fetchNarrowedIds(searchTerm, spacedTerm, res.narrowing);
      if (narrowedIds === null) throw new Error(`narrowed ids read failed for "${word}" / ${option.value}`);
      const { narrowing: _narrowing, ...filter } = res;
      const result = buildSearchResult({
        matched,
        scoped: matched,
        category: undefined,
        narrowedIds,
        filter,
        unfilteredCount,
        rawQuery: word,
        page: 1,
        perPage: 24,
        lookup,
      });
      if (result.totalCount !== option.count) findings.push(`3 "${word}" / ${option.value}: the panel shows ${option.count}, the grid reports ${result.totalCount}`);
      summaries.push(`query "${word}", option ${option.value}: panel count ${option.count}, grid total ${result.totalCount}`);
    }
  }
  return { findings, summaries };
}

// ---- Report ---------------------------------------------------------------------------------------------------------------------------

const QUESTIONS: Record<number, string> = {
  1: 'the drop-in door gives the route answer over the host\'s products',
  2: 'the result rules give the grid, the counts and the shape the view reads',
  3: 'on live Search the count beside an option equals the narrowed grid\'s total',
  4: 'a tick keeps q, cat and sort, writes the option and drops page',
  5: 'the view mounts the feature and nothing of the deleted components',
  6: 'the deleted exports are gone from the tree',
};

function report(summaries: string[], found: Record<number, string[]>) {
  if (summaries.length) console.log(`${summaries.join('\n')}\n`);
  for (const id of [1, 2, 3, 4, 5, 6]) {
    const lines = found[id] ?? [];
    if (!lines.length) console.log(`${id} yes - ${QUESTIONS[id]}\n`);
    else console.log(`${id} NO - ${QUESTIONS[id]}\n${lines.slice(0, 25).map((l) => `  ${l}`).join('\n')}\n`);
  }
  const bad = [1, 2, 3, 4, 5, 6].some((id) => (found[id] ?? []).length);
  console.log(bad ? 'RESULT: NO' : 'RESULT: PASS');
  return bad ? 1 : 0;
}

try {
  // The proof can say NO: question 2's checks against three planted defects, question 4's against an address that drops q, question 5's against the deleted component's name.
  const DEFECTS = 5;
  let saidNo = 0;
  for (const m of Q2_MUTANTS) {
    const found = checkResult(m.featOf ?? ((scoped) => toFeatureProducts(scoped)), m.build ?? ((input) => buildSearchResult(input)));
    if (found.length > 0) saidNo++;
    else {
      console.error(`NO VERDICT: the proof itself is broken\n  the checks of question 2 do not say NO to "${m.name}"`);
      process.exit(2);
    }
  }
  if (checkAddress('?cat=headphones&sort=price-asc&brand=X', 'brand', 'X').length > 0) saidNo++;
  else {
    console.error('NO VERDICT: the proof itself is broken\n  the checks of question 4 do not say NO to an address that drops q');
    process.exit(2);
  }
  let viewText = '';
  try {
    viewText = fs.readFileSync(VIEW_FILE, 'utf8');
  } catch {
    console.error(`NO VERDICT: cannot read ${VIEW_FILE}`);
    process.exit(2);
  }
  if (checkView(`${viewText}\n<FilterSidebar />`).length > 0) saidNo++;
  else {
    console.error('NO VERDICT: the proof itself is broken\n  the checks of question 5 do not say NO to a view still holding FilterSidebar');
    process.exit(2);
  }
  console.log(`self-check: ${DEFECTS} planted defects, ${saidNo} say NO\n`);

  // Live questions first: a failed read is no verdict.
  const q1 = await question1();
  const q3 = await question3();

  // Question 2 (pure).
  const q2 = checkResult((scoped) => toFeatureProducts(scoped), (input) => buildSearchResult(input));

  // Question 4, on the all-products model question 1 read.
  const q4: string[] = [];
  const brand = brandControlOf(q1.model);
  if (!brand) q4.push('4 the model holds no brand control');
  else {
    const contract = buildUrlContract(q1.model);
    const addr = contract.encode(ADDRESS_BASE, { [brand.path]: [brand.options[0].value] });
    q4.push(...checkAddress(addr, brand.path, brand.options[0].value));
  }

  const q6 = question6();
  if (q6.searched.length) console.log(`searched names: ${q6.searched.join(', ')}\n`);
  process.exit(
    report([...q1.summaries, ...q3.summaries], {
      1: q1.findings,
      2: q2,
      3: q3.findings,
      4: q4,
      5: checkView(viewText),
      6: q6.findings,
    }),
  );
} catch (e) {
  console.error(`NO VERDICT: ${(e as Error).message}`);
  process.exit(2);
}
