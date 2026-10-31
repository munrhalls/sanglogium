// CMS data vs what filtering and sorting read: on the live data, every rule the filter and sort code relies on.
// Human-run only. Prints one block per rule: why the code needs it, how many products break it, a few examples.
// Exit code 1 when any rule is broken. Reads only; the same input gives the same output until the data changes.
// node --conditions=react-server --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/cmsContractRealData.test.ts
//
// Same transport swap as pickablePathsRealData.test.ts: the code that shapes the data is the real one, only the fetch differs.
// `sanity` is swapped too: headphones.ts imports defineArrayMember from it, and the field lists are plain objects.
import { createClient } from '@sanity/client';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

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
    if (specifier === 'sanity') return stub('export const defineArrayMember = (x) => x; export const defineField = (x) => x;');
    if (specifier === 'next-sanity') {
      return stub('export const groq = (s, ...v) => s.reduce((a, c, i) => a + c + (v[i] ?? ""), "");');
    }
    if (specifier === '@/platform/sanity/client') {
      return stub('export const sanityFetch = ({ query, params }) => globalThis.__snapshotFetch(query, params ?? {});');
    }
    return nextResolve(specifier, context);
  },
});

const { fetchFacetProducts } = await import('@/features/product-filtering/adapters/sanity/fetchFacetProducts');
const { fetchPicklist } = await import('@/features/product-filtering/adapters/sanity/fetchPicklist');
const { buildFacetSet } = await import('@/features/product-filtering/core/rules/buildFacetSet');
const { PICKABLE: SIGNED } = await import('@/features/product-filtering/schema/pickableFields');

const SLICES = ['headphones', 'audio-electronics', 'accessories'] as const;
const FETCH_CAP = 1000; // fetchFacetProducts reads [0...1000]

// The fields each slice's picklist can offer: the owner's signed closed list.
const PICKABLE: Record<(typeof SLICES)[number], Set<string>> = {
  headphones: new Set(SIGNED.headphones),
  'audio-electronics': new Set(SIGNED.audioElectronics),
  accessories: new Set(SIGNED.accessories),
};

// The same walk as unrollDescendantKeys in features/catalogue, on the same JSON.
const index = JSON.parse(readFileSync('data/catalogue-index.json', 'utf8'));
const keysOf = (slug: string): string[] => {
  const seen = new Set<string>();
  const stack: string[] = [index.slugToIdMap[slug]];
  while (stack.length) {
    const id = stack.pop() as string;
    if (seen.has(id)) continue;
    seen.add(id);
    stack.push(...(index.slotMetadataMap[id]?.children ?? []));
  }
  return [...seen];
};

interface Rule {
  name: string;
  why: string;
  hits: string[];
}
const rules: Rule[] = [];
const rule = (name: string, why: string) => {
  const r: Rule = { name, why, hits: [] };
  rules.push(r);
  return (hit: string) => r.hits.push(hit);
};
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const present = (v: unknown) => v !== undefined && v !== null;

// ---- product-level rules, on every published product ----
const all: any[] = await client.fetch(`*[_type == "product"] | order(_id asc) {
  _id, name, catalogueLocationKeys,
  "unitAmount": price_data.unit_amount, stock, reservedStock,
  filterAttributes, sortAttributes, displayPriority,
  "brandSlug": brand->slug.current
}`);

const sliceKeys = SLICES.map((slice) => ({ slice, keys: new Set(keysOf(slice)) }));

const badName = rule('name is text', 'the A-Z and Z-A sorts order by lower(name)');
const badPrice = rule('price is a number', 'the price sorts and the price filter read price_data.unit_amount');
const stockUndecidable = rule(
  'in stock can be decided',
  'the in-stock filter reads stock minus reservedStock; a missing number counts as out of stock in the query and as zero in the counts',
);
const brandMissing = rule('brand has a document', 'the brand filter and its list read the brand document slug (brand->slug.current); a product without one has no brand');
const sortNumbers = rule(
  'sort numbers are numbers',
  'featured and best-selling read sortAttributes.featuredPriority, displayPriority and popularity',
);
const unreachable = rule(
  'product is in one of the three slices',
  'the sidebar and the counts read a slice by its catalogue keys; a product in none is never counted',
);

for (const p of all) {
  if (typeof p.name !== 'string' || !p.name.trim()) badName(p._id);
  if (!isNumber(p.unitAmount) || p.unitAmount < 0) badPrice(`${p._id}: ${JSON.stringify(p.unitAmount)}`);
  if (!(isNumber(p.stock) && isNumber(p.reservedStock))) {
    stockUndecidable(`${p._id}: stock ${JSON.stringify(p.stock)}, reserved ${JSON.stringify(p.reservedStock)}`);
  }
  if (typeof p.brandSlug !== 'string' || !p.brandSlug) brandMissing(`${p._id}: ${JSON.stringify(p.brandSlug)}`);
  for (const [key, value] of [
    ['sortAttributes.featuredPriority', p.sortAttributes?.featuredPriority],
    ['sortAttributes.popularity', p.sortAttributes?.popularity],
    ['displayPriority', p.displayPriority],
  ] as const) {
    if (present(value) && !isNumber(value)) sortNumbers(`${p._id}: ${key} ${JSON.stringify(value)}`);
  }
  const keys: string[] = p.catalogueLocationKeys ?? [];
  if (!sliceKeys.some(({ keys: set }) => keys.some((key) => set.has(key)))) {
    unreachable(`${p._id}: keys ${JSON.stringify(keys)}`);
  }
}

// ---- slice-level rules, on the products each slice's sidebar reads ----
const tooMany = rule('a slice fits one fetch', `fetchFacetProducts reads at most ${FETCH_CAP} products; the rest are silently left out`);
const mixedKinds = rule(
  'one kind per field',
  'a pickable field holding text in some products and numbers or true/false in others gets no control; a list counts as its items',
);
const unheld = rule(
  'every offered field is held by a product',
  'a field the schema offers but no product of the slice holds can never draw a control',
);
const deadPick = rule('every pick draws a control', 'a pick in the picklist that no product backs, or that mixes kinds, draws nothing');
const staleSpec = rule('every pick is offered by the schema', 'the picklist offers only the fields of its slice; a pick outside them was offered once and the schema moved on');
const noPicks = rule(
  'every slice has picks',
  'a missing, unpublished or emptied picklist document gives three empty lists, and then every pick rule passes with nothing to check while the sidebar draws no attribute control',
);
const pickLines: string[] = [];
const deriveWrong = rule(
  'derive matches the data',
  'a control must offer exactly what the products hold: a checkbox the distinct values (spellings that differ only by case are one value), a range the smallest to the largest number, on/off only true/false, and none when the field is empty or mixes kinds',
);
const fieldClasses = new Map<string, number>();

const picklist = await fetchPicklist();

const kindOf = (v: unknown): string | null =>
  typeof v === 'string' ? 'text' : typeof v === 'boolean' ? 'true/false' : isNumber(v) ? 'number' : null;

for (const slice of SLICES) {
  const products = await fetchFacetProducts({ keys: keysOf(slice) });
  if (products.length >= FETCH_CAP) tooMany(`${slice}: ${products.length}`);

  let currentId = '';
  const kinds = new Map<string, Map<string, { n: number; ex: string[] }>>();
  const walk = (obj: Record<string, unknown>, prefix: string) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('_')) continue;
      const path = prefix ? `${prefix}.${key}` : key;
      const items = Array.isArray(value) ? value : [value];
      const seen = new Set<string>();
      for (const item of items) {
        if (item && typeof item === 'object' && !Array.isArray(item) && !Array.isArray(value)) {
          walk(item as Record<string, unknown>, path);
          continue;
        }
        const kind = kindOf(item);
        if (kind === null || (kind === 'text' && item === '')) continue;
        seen.add(kind);
      }
      for (const kind of seen) {
        if (!kinds.has(path)) kinds.set(path, new Map());
        const counts = kinds.get(path)!;
        const entry = counts.get(kind) ?? { n: 0, ex: [] };
        entry.n += 1;
        if (entry.ex.length < 2) entry.ex.push(`${currentId}=${JSON.stringify(value)}`);
        counts.set(kind, entry);
      }
    }
  };
  for (const product of products) {
    currentId = product._id;
    if (product.filterAttributes && typeof product.filterAttributes === 'object') walk(product.filterAttributes, '');
  }

  for (const path of [...PICKABLE[slice]].sort()) {
    if (!kinds.has(path)) unheld(`${slice} ${path}`);
  }
  for (const [path, counts] of [...kinds].sort(([a], [b]) => a.localeCompare(b))) {
    if (!PICKABLE[slice].has(path) || counts.size < 2) continue;
    mixedKinds(`${slice} ${path}: ${[...counts].map(([kind, { n, ex }]) => `${kind} in ${n} (e.g. ${ex.join(' ')})`).join('; ')}`);
  }
  // derive step, every pickable field: the expected control, options and bounds are read straight from the raw products
  // (a list counts as its items; a list of objects holds no value) and compared with what buildFacetSet derives.
  const fieldPaths = [...PICKABLE[slice]].sort();
  const derived = new Map<string, any>(buildFacetSet(products, fieldPaths).facets.map((facet: any) => [facet.attribute, facet]));
  for (const path of fieldPaths) {
    const classes = new Set<string>();
    const texts = new Map<string, string>();
    const numbers: number[] = [];
    let listed = false;
    for (const product of products) {
      const value = path.split('.').reduce<any>(
        (cur, key) => (cur && typeof cur === 'object' && !Array.isArray(cur) ? cur[key] : undefined),
        product.filterAttributes,
      );
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) continue;
      if (Array.isArray(value)) listed = true;
      else if (typeof value === 'object') {
        classes.add('object');
        continue;
      }
      for (const item of Array.isArray(value) ? value : [value]) {
        if (typeof item === 'string' && item !== '') {
          classes.add('text');
          const kept = texts.get(item.toLowerCase());
          if (kept === undefined || item < kept) texts.set(item.toLowerCase(), item);
        } else if (typeof item === 'boolean') classes.add('true/false');
        else if (isNumber(item)) (classes.add('number'), numbers.push(item));
      }
    }
    let expected = 'none';
    let cls = 'none, empty';
    if (classes.size > 1 || classes.has('object')) cls = 'none, mixed';
    else if (classes.has('true/false')) (expected = 'boolean', (cls = 'on/off'));
    else if (classes.has('number')) (expected = 'range', (cls = listed ? 'range, from lists' : 'range'));
    else if (classes.has('text')) (expected = 'checkbox', (cls = listed ? 'checkbox, from lists' : 'checkbox'));
    fieldClasses.set(cls, (fieldClasses.get(cls) ?? 0) + 1);

    const facet = derived.get(path);
    const control = facet ? facet.control : 'none';
    const problems: string[] = [];
    if (control !== expected) problems.push(`control ${control}, data says ${expected}`);
    else if (expected === 'checkbox') {
      const want = [...texts.values()].sort();
      const got = (facet.options ?? []).map((option: any) => option.value);
      if (JSON.stringify(want) !== JSON.stringify(got)) problems.push(`options ${JSON.stringify(got)}, data holds ${JSON.stringify(want)}`);
    } else if (expected === 'range') {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      if (facet.min !== min || facet.max !== max) problems.push(`bounds ${facet.min}..${facet.max}, data spans ${min}..${max}`);
    }
    if (problems.length) deriveWrong(`${slice} ${path}: ${problems.join('; ')}`);
  }

  const picks = [...new Set(picklist[slice] as string[])];
  if (picks.length === 0) noPicks(slice);
  const drawn = new Map<string, any>(buildFacetSet(products, picks).facets.map((facet: any) => [facet.attribute, facet]));
  pickLines.push(`${slice}: ${picks.length} picks`);
  for (const pick of picks) {
    const offered = PICKABLE[slice].has(pick);
    const facet = drawn.get(pick);
    const held = kinds.get(pick);
    const holding = held ? Math.max(...[...held.values()].map((k) => k.n)) : 0;
    if (!offered) staleSpec(`${slice} ${pick}`);
    if (!facet) deadPick(`${slice} ${pick}`);
    pickLines.push(`  ${pick} | offered ${offered ? 'yes' : 'NO'} | in ${holding} products | ${facet ? facet.control : 'NO CONTROL'}`);
  }
}

// ---- print ----
const lines: string[] = [
  'picklist, every pick',
  ...pickLines,
  '',
  'derive, every pickable field, by class',
  ...[...fieldClasses].sort(([a], [b]) => a.localeCompare(b)).map(([cls, n]) => `  ${cls}: ${n}`),
  '',
];
for (const r of rules) {
  r.hits.sort();
  lines.push(r.name, `why: ${r.why}`, `broken in: ${r.hits.length}`);
  for (const hit of r.hits.slice(0, 5)) lines.push(`  ${hit}`);
  if (r.hits.length > 5) lines.push(`  ... and ${r.hits.length - 5} more`);
  lines.push('');
}
const broken = rules.filter((r) => r.hits.length > 0);
lines.push(`${all.length} products, ${rules.length} rules, ${broken.length} broken`);
lines.push(broken.length === 0 ? 'the data holds every rule' : `broken: ${broken.map((r) => r.name).join('; ')}`);

const text = `${lines.join('\n')}\n`;
mkdirSync('tests/product-filtering/out', { recursive: true });
writeFileSync('tests/product-filtering/out/cms-contract.txt', text);
process.stdout.write(text);
process.exitCode = broken.length === 0 ? 0 : 1;
