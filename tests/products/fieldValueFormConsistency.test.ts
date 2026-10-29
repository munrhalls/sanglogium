// Field consistency: do all products that hold a field hold it in the same form?
// Human-run. Reads only. Phase 1 proves the scan on fake products; phase 2 runs it on the live data for one field.
// Only the latest run is kept: tests/products/out/ is emptied before each live run.
// node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/products/fieldValueFormConsistency.test.ts <field path>
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

// The value at a dotted path. Not held when a step is absent or the step before it is not an object.
const valueAt = (product: Product, path: string): { held: boolean; value?: unknown } => {
  let current: unknown = product;
  for (const key of path.split('.')) {
    if (current === null || typeof current !== 'object' || Array.isArray(current) || !(key in current)) return { held: false };
    current = (current as Record<string, unknown>)[key];
  }
  return { held: true, value: current };
};

// Products in `_id` order. The first holder of the field sets the reference form; each later holder is compared to it.
// A field the schema does not define gets no missing list.
function scan(products: Product[], path: string, definedBySchema: boolean) {
  const ordered = [...products].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
  let reference: string | null = null;
  let holders = 0;
  const inconsistencies: { id: string; form: string }[] = [];
  const missing: string[] = [];
  for (const product of ordered) {
    const found = valueAt(product, path);
    if (!found.held) {
      missing.push(product._id);
      continue;
    }
    holders += 1;
    const form = formOf(found.value);
    if (reference === null) reference = form;
    else if (form !== reference) inconsistencies.push({ id: product._id, form });
  }
  return { path, reference, holders, inconsistencies, missing: definedBySchema ? missing : null };
}

// Every field path the product schema defines outside filterAttributes, nested object fields included.
const schemaPaths = (fields: any[], prefix = ''): string[] =>
  fields.flatMap((field) => {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    return field.type === 'object' && Array.isArray(field.fields) ? [path, ...schemaPaths(field.fields, path)] : [path];
  });
const SCHEMA_PATHS = new Set(schemaPaths((productType as any).fields.filter((field: any) => field.name !== 'filterAttributes')));

// ---- phase 1: proof on fake products, expected output written by hand ----
// f0 lacks the field (so the reference comes from the first holder, f1); f2 repeats the reference form;
// f3 string, f4 list of numbers, f5 null, f9 empty list differ; f6 empty parent, f7 no parent, f8 parent not an object lack it.
const fake: Product[] = [
  { _id: 'f9', price_data: { unit_amount: [] } },
  { _id: 'f4', price_data: { unit_amount: [1, 2] } },
  { _id: 'f0' },
  { _id: 'f1', price_data: { currency: 'zzz', unit_amount: 7 } },
  { _id: 'f8', price_data: 'x' },
  { _id: 'f2', price_data: { unit_amount: 9 } },
  { _id: 'f3', price_data: { unit_amount: '9' } },
  { _id: 'f7', note: 'no parent' },
  { _id: 'f5', price_data: { unit_amount: null } },
  { _id: 'f6', price_data: {} },
];
deepStrictEqual(scan(fake, 'price_data.unit_amount', true), {
  path: 'price_data.unit_amount',
  reference: 'number',
  holders: 6,
  inconsistencies: [
    { id: 'f3', form: 'string' },
    { id: 'f4', form: 'array' },
    { id: 'f5', form: 'null' },
    { id: 'f9', form: 'array' },
  ],
  missing: ['f0', 'f6', 'f7', 'f8'],
});
// A field the schema does not define: holders and inconsistencies only, no missing list.
const alien: Product[] = [{ _id: 'g3', box: { dial: 'x' } }, { _id: 'g1', box: { dial: 1 } }, { _id: 'g2' }];
deepStrictEqual(scan(alien, 'box.dial', false), {
  path: 'box.dial',
  reference: 'number',
  holders: 2,
  inconsistencies: [{ id: 'g3', form: 'string' }],
  missing: null,
});
// The schema paths come from the real productType, and filterAttributes is left out.
deepStrictEqual(SCHEMA_PATHS.has('price_data.unit_amount'), true);
deepStrictEqual(SCHEMA_PATHS.has('filterAttributes'), false);
console.log('proof on fake products: passed');

// ---- phase 2: the live data, one field ----
const field = process.argv[2];
if (!field) throw new Error('Pass the field path, for example price_data.unit_amount');

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

const result = scan(published, field, SCHEMA_PATHS.has(field));
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
writeFileSync('tests/products/out/fieldValueFormConsistency.txt', text);

const shown = lines.slice(0, 40);
console.log(shown.join('\n') + (lines.length > shown.length ? `\n... ${lines.length - shown.length} more lines in tests/products/out/fieldValueFormConsistency.txt` : ''));
console.log(`fetched ${docs.length} documents, ${(JSON.stringify(docs).length / 1e6).toFixed(1)} MB, in ${fetchSeconds.toFixed(1)} s`);
