// Primitive form consistency: do all products that hold a top-level field hold its value in the same form?
// Primitive = string, number or boolean. Top-level fields only. Fields inside objects or lists, and what is
// inside a list or an object, are the next PR.
// Human-run. Reads only. Phase 1 proves the scan on fake products; phase 2 runs it on the live data, every field in scope.
// Only the latest run is kept: tests/products/out/ is emptied before each live run.
// node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/products/primitiveFormConsistency.test.ts
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

const PRIMITIVE_TYPES = ['string', 'number', 'boolean'];
const isPrimitive = (value: unknown) => PRIMITIVE_TYPES.includes(typeof value);

// The form of one value: its JSON kind. What is inside a list or an object is not looked at here.
const formOf = (value: unknown): string => (value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value);

// Products in `_id` order. The first holder of the field sets the reference form; each later holder is compared to it.
// A field the schema does not define gets no missing list; its holders are listed instead.
function scan(products: Product[], field: string, definedBySchema: boolean) {
  const ordered = [...products].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
  let reference: string | null = null;
  const forms: Record<string, number> = {};
  const holderIds: string[] = [];
  const inconsistencies: { id: string; form: string }[] = [];
  const missing: string[] = [];
  for (const product of ordered) {
    if (!Object.hasOwn(product, field)) {
      missing.push(product._id);
      continue;
    }
    const form = formOf(product[field]);
    holderIds.push(product._id);
    forms[form] = (forms[form] ?? 0) + 1;
    if (reference === null) reference = form;
    else if (form !== reference) inconsistencies.push({ id: product._id, form });
  }
  return {
    field,
    reference,
    holders: holderIds.length,
    forms,
    inconsistencies,
    missing: definedBySchema ? missing : null,
    holderIds: definedBySchema ? null : holderIds,
  };
}

// The fields in scope: every top-level field some product holds as a primitive (not `_` keys, not filterAttributes),
// plus the schema's primitive fields, so a field no product holds still shows.
function fieldsInScope(products: Product[], schemaPrimitive: Set<string>): string[] {
  const names = new Set(schemaPrimitive);
  for (const product of products) {
    for (const [key, value] of Object.entries(product)) {
      if (!key.startsWith('_') && key !== 'filterAttributes' && isPrimitive(value)) names.add(key);
    }
  }
  return [...names].sort();
}

// The top-level fields of the product schema, outside filterAttributes.
const schemaFields = (productType as any).fields.filter((field: any) => field.name !== 'filterAttributes');
const SCHEMA_FIELDS = new Set<string>(schemaFields.map((field: any) => field.name));
const SCHEMA_PRIMITIVE = new Set<string>(schemaFields.filter((field: any) => PRIMITIVE_TYPES.includes(field.type)).map((field: any) => field.name));

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
  forms: { number: 2, string: 1, array: 2, null: 1, object: 1 },
  inconsistencies: [
    { id: 'f3', form: 'string' },
    { id: 'f4', form: 'array' },
    { id: 'f5', form: 'null' },
    { id: 'f6', form: 'object' },
    { id: 'f9', form: 'array' },
  ],
  missing: ['f0', 'f7', 'f8'],
  holderIds: null,
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
  forms: { number: 1, string: 1 },
  inconsistencies: [{ id: 'g3', form: 'string' }],
  missing: null,
  holderIds: ['g1', 'g3'],
});
// Fields in scope: `flag` and `stock` are primitive somewhere, `mix` is a primitive in one product and a list in another,
// `sku` comes from the schema list and is held by nobody. Left out: `box` (object), `tags` (lists), `note` (null only),
// `_hidden` (system key), `filterAttributes`.
const scope: Product[] = [
  { _id: 'h1', stock: 1, box: { a: 1 }, tags: ['x'], mix: 'a', _hidden: 1, filterAttributes: { anc: 'x' }, flag: true },
  { _id: 'h2', mix: ['b'], tags: [], note: null },
];
deepStrictEqual(fieldsInScope(scope, new Set(['sku', 'stock'])), ['flag', 'mix', 'sku', 'stock']);
// The schema sets come from the real productType: filterAttributes is left out, and five top-level fields are primitive.
deepStrictEqual(SCHEMA_FIELDS.has('stock'), true);
deepStrictEqual(SCHEMA_FIELDS.has('filterAttributes'), false);
deepStrictEqual([...SCHEMA_PRIMITIVE].sort(), ['displayPriority', 'name', 'reservedStock', 'sku', 'stock']);
console.log('proof on fake products: passed');

// ---- phase 2: the live data, every field in scope ----
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

const fields = fieldsInScope(published, SCHEMA_PRIMITIVE);
const results = fields.map((name) => scan(published, name, SCHEMA_FIELDS.has(name)));
const width = Math.max(5, ...fields.map((name) => name.length));
const summary = [
  `${'field'.padEnd(width)}  schema  holders  missing  inconsistent  forms`,
  ...results.map(
    (r) =>
      `${r.field.padEnd(width)}  ${(r.missing === null ? 'no' : 'yes').padEnd(6)}  ${String(r.holders).padStart(7)}  ${(r.missing === null ? '-' : String(r.missing.length)).padStart(7)}  ${String(r.inconsistencies.length).padStart(12)}  ${Object.entries(r.forms)
        .map(([form, count]) => `${form}:${count}`)
        .join(' ')}`,
  ),
];
const flagged = results.filter((r) => r.inconsistencies.length > 0).length;
const details = results
  .filter((r) => r.inconsistencies.length > 0 || (r.missing?.length ?? 0) > 0 || r.holderIds !== null)
  .flatMap((r) => [
    '',
    `== ${r.field} ==`,
    `inconsistencies: ${r.inconsistencies.length}`,
    ...r.inconsistencies.map((item) => `  ${item.id}  ${item.form}`),
    ...(r.missing === null ? [`holders (not in schema): ${r.holderIds!.length}`, ...r.holderIds!.map((id) => `  ${id}`)] : [`missing: ${r.missing.length}`, ...r.missing.map((id) => `  ${id}`)]),
  ]);
const head = [
  `products read: ${published.length} published (not published: ${docs.length - published.length})`,
  `fields in scope: ${fields.length}, with inconsistencies: ${flagged}`,
  '',
];
const text = `${[...head, ...summary, ...details].join('\n')}\n`;

rmSync('tests/products/out', { recursive: true, force: true });
mkdirSync('tests/products/out', { recursive: true });
writeFileSync('tests/products/out/primitiveFormConsistency.txt', text);

console.log([...head, ...summary].join('\n'));
console.log(`\nlists: tests/products/out/primitiveFormConsistency.txt (${details.length} detail lines)`);
console.log(`fetched ${docs.length} documents, ${(JSON.stringify(docs).length / 1e6).toFixed(1)} MB, in ${fetchSeconds.toFixed(1)} s`);
