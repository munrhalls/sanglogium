// Pickable paths on real data: per slice, every field's stored kinds, text-value count, number span and the
// control chunk 1 gives it. Human-run only: it shows what the live data holds so the chunk 1 proof's classes
// can be checked against it.
// node --conditions=react-server --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/pickablePathsRealData.test.ts
//
// Plain node cannot load `next-sanity` (it imports next/dynamic) and has no `server-only` package (Next aliases it),
// so those imports are swapped: `server-only` for nothing, the other two for the same GROQ string and a plain @sanity/client fetch. Every query, and all the code that shapes the
// result, is the real one; only the transport differs. useCdn is off so a just-written picklist is read at once.
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
const { fieldInventory } = await import('@/features/product-filtering/core/rules/fieldInventory');
const { buildFacetSet } = await import('@/features/product-filtering/core/rules/buildFacetSet');

const SLICES = ['headphones', 'audio-electronics', 'accessories'];

// The same walk as unrollDescendantKeys in features/catalogue, on the same JSON (that module cannot load in plain node).
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

const lines: string[] = [];
const classes = new Map<string, { count: number; example: string }>();

const recordClass = (cls: string, path: string) => {
  const acc = classes.get(cls);
  if (acc) acc.count += 1;
  else classes.set(cls, { count: 1, example: path });
};

for (const slice of SLICES) {
  const products = await fetchFacetProducts({ keys: keysOf(slice) });
  const inventory = fieldInventory(products);
  const paths = Object.keys(inventory).filter(
    (path) => !(inventory[path].kinds.length === 1 && inventory[path].kinds[0] === 'object'),
  );
  const facetSet = buildFacetSet(products, paths);

  lines.push(`== ${slice} ==`);
  lines.push('path | kinds | products | text values | numbers | control');
  for (const path of [...paths].sort()) {
    const stat = inventory[path];
    const kinds = stat.kinds.join('+');
    const numbers = stat.min === null ? '-' : `${stat.min}..${stat.max}`;
    const facet = facetSet.facets.find((f: any) => f.attribute === path);
    const control = facet ? facet.control : 'none';
    lines.push(`${path} | ${kinds} | ${stat.count} | ${stat.values.length} | ${numbers} | ${control}`);

    const cls =
      kinds === 'array' && stat.values.length === 0 && stat.min === null ? 'array, no text values' : kinds;
    recordClass(cls, path);
  }
  lines.push('');
}

lines.push('classes seen');
for (const cls of [...classes.keys()].sort()) {
  const { count, example } = classes.get(cls)!;
  lines.push(`${cls} | ${count} | e.g. ${example}`);
}

const text = `${lines.join('\n')}\n`;
mkdirSync('tests/product-filtering/out', { recursive: true });
writeFileSync('tests/product-filtering/out/pickable-paths.txt', text);
process.stdout.write(text);
