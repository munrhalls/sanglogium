// Facet snapshot: prints, per slice, what the filter sidebar draws from the live CMS. Human-run only.
// Run it before and after the filter-picklist change, then diff the two files in tests/product-filtering/out/.
// node --conditions=react-server --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/product-filtering/snapshotFacets.test.ts <label>
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

const { getFilterFacets } = await import('@/features/product-filtering/server');

// `state` is read by the code before the change and `query` by the code after it; the other one is ignored, so this runs on both.
const DEFAULT_STATE = { sort: 'featured', minPrice: null, maxPrice: null, inStock: false, brand: [] };
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

const label = process.argv[2] ?? 'run';
const lines: string[] = [];
const failures: string[] = [];

for (const slice of SLICES) {
  const result: any = await getFilterFacets({ keys: keysOf(slice), state: DEFAULT_STATE, query: {}, category: slice });
  const { facets, queryOnly, groups } = result.facetSet;
  lines.push(`== ${slice} ==`);
  for (const group of groups) lines.push(`group ${group.id} | ${group.label}`);
  for (const facet of facets) {
    const options =
      facet.id === 'brand'
        ? Object.keys(result.brandLabels).sort()
        : (facet.options ?? []).map((o: any) => `${o.value}=${o.label}`).sort();
    const bounds = result.ranges[facet.id];
    lines.push(
      '',
      `key: ${facet.id}`,
      `control: ${facet.control}`,
      `label: ${facet.label}`,
      `group: ${facet.group}`,
      `unit: ${facet.unit ?? '-'}`,
      `showWhen: ${facet.showWhen ? JSON.stringify(facet.showWhen) : '-'}`,
      `options: ${options.length ? options.join('; ') : '-'}`,
      `bounds: ${bounds ? `${bounds.min}..${bounds.max}` : '-'}`,
    );
  }
  lines.push('');
  for (const q of queryOnly) lines.push(`queryOnly: ${q.id} | ${q.control}`);
  lines.push('');
  const ids: string[] = [...facets, ...queryOnly].map((f: any) => f.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length) failures.push(`${slice}: ${duplicates.join(', ')}`);
}

lines.push(failures.length ? `FAIL keys unique: ${failures.join(' | ')}` : 'PASS keys unique');
const text = `${lines.join('\n')}\n`;
mkdirSync('tests/product-filtering/out', { recursive: true });
writeFileSync(`tests/product-filtering/out/facets-${label}.txt`, text);
process.stdout.write(text);
