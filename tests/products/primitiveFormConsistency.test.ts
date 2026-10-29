// Primitive form consistency: do all products that hold a top-level field hold its value in the same form?
// Top-level fields only. Fields inside objects or lists, and what is inside a list or an object, are the next PR.
// Human-run. Reads only. Phase 1 proves the scan on fake products; phase 2 runs it on the live data for one field.
// Only the latest run is kept: tests/products/out/ is emptied before each live run.
// node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/products/primitiveFormConsistency.test.ts <field>
//
// `sanity` is swapped for a stub: productType.ts imports defineType and defineField from it, and the field lists are plain objects.
import { createClient } from '@sanity/client';
import { deepStrictEqual } from 'node:assert';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'sanity') {
      const source = 'export const defineType = (x) => x; export const defineField = (x) => x; export const defineArrayMember = (x) => x;';
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
});
const { productType } = await import('@/features/products/schema/productType');

type Product = Record<string, unknown> & { _id: string };

// The form of one value: its JSON kind. What is inside a list or an object is not looked at here.
const formOf = (value: unknown): string => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

// Products in `_id` order. The first holder of the field sets the reference form; each later holder is compared to it.
// A field the schema does not define gets no missing list.
function scan(products: Product[], field: string, definedBySchema: boolean) {
  const ordered = [...products].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
  let reference: string | null = null;
  let holders = 0;
  const inconsistencies: { id: string; form: string }[] = [];
  const missing: string[] = [];
  for (const product of ordered) {
    if (!Object.hasOwn(product, field)) {
      missing.push(product._id);
      continue;
    }
    holders += 1;
    const form = formOf(product[field]);
    if (reference === null) reference = form;
    else if (form !== reference) inconsistencies.push({ id: product._id, form });
  }
  return { field, reference, holders, inconsistencies, missing: definedBySchema ? missing : null };
}

// Every top-level field the product schema defines outside filterAttributes.
const SCHEMA_FIELDS = new Set(
  (productType as any).fields.map((field: any) => field.name).filter((name: string) => name !== 'filterAttributes'),
);

// ---- phase 1: proof on fake products, expected output written by hand ----
// f0, f7, f8 lack the field (so the reference comes from the first holder, f1); f2 repeats the reference form;
// f3 string, f4 list, f5 null, f6 object, f9 empty list differ.
const fake: Product[] = [
  { _id: 'f9', stock: [] },
  { _id: 'f4', stock: [1, 2] },
  { _id: 'f0' },
  { _id: 'f1', stock: 7, name: 'zzz' },
  { _id: 'f8', name: 'qqq' },
  { _id: 'f2', stock: 9 },
  { _id: 'f6', stock: { a: 1 } },
  { _id: 'f3', stock: '9' },
  { _id: 'f7', note: 'no field' },
  { _id: 'f5', stock: null },
];
deepStrictEqual(scan(fake, 'stock', true), {
  field: 'stock',
  reference: 'number',
  holders: 7,
  inconsistencies: [
    { id: 'f3', form: 'string' },
    { id: 'f4', form: 'array' },
    { id: 'f5', form: 'null' },
    { id: 'f6', form: 'object' },
    { id: 'f9', form: 'array' },
  ],
  missing: ['f0', 'f7', 'f8'],
});
// A field the schema does not define: holders and inconsistencies only, no missing list.
const alien: Product[] = [
  { _id: 'g3', dial: 'x' },
  { _id: 'g1', dial: 1 },
  { _id: 'g2' },
];
deepStrictEqual(scan(alien, 'dial', false), {
  field: 'dial',
  reference: 'number',
  holders: 2,
  inconsistencies: [{ id: 'g3', form: 'string' }],
  missing: null,
});
// The schema fields come from the real productType, and filterAttributes is left out.
deepStrictEqual(SCHEMA_FIELDS.has('stock'), true);
deepStrictEqual(SCHEMA_FIELDS.has('filterAttributes'), false);
console.log('proof on fake products: passed');

// ---- phase 2: the live data, one field ----
const field = process.argv[2];
if (!field) throw new Error('Pass the top-level field name, for example stock');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  useCdn: false,
  perspective: 'raw',
  token: process.env.SANITY_API_READ_TOKEN,
});
const started = Date.now();
const docs: Product[] = await client.fetch('*[_type == "product"]');
const fetchSeconds = (Date.now() - started) / 1000;
const published = docs.filter((doc) => !doc._id.startsWith('drafts.') && !doc._id.startsWith('versions.'));

const result = scan(published, field, SCHEMA_FIELDS.has(field));
const lines = [
  `field: ${field}`,
  `defined by schema: ${result.missing === null ? 'no' : 'yes'}`,
  `products read: ${published.length} published (not published: ${docs.length - published.length})`,
  `reference form: ${result.reference ?? 'none, no product holds the field'}`,
  `holders: ${result.holders}`,
  `inconsistencies: ${result.inconsistencies.length}`,
  ...result.inconsistencies.map((item) => `  ${item.id}  ${item.form}`),
  ...(result.missing === null ? [] : [`missing: ${result.missing.length}`, ...result.missing.map((id) => `  ${id}`)]),
];
const text = `${lines.join('\n')}\n`;

rmSync('tests/products/out', { recursive: true, force: true });
mkdirSync('tests/products/out', { recursive: true });
writeFileSync('tests/products/out/primitiveFormConsistency.txt', text);

const shown = lines.slice(0, 40);
console.log(shown.join('\n') + (lines.length > shown.length ? `\n... ${lines.length - shown.length} more lines in tests/products/out/primitiveFormConsistency.txt` : ''));
console.log(`fetched ${docs.length} documents, ${(JSON.stringify(docs).length / 1e6).toFixed(1)} MB, in ${fetchSeconds.toFixed(1)} s`);
