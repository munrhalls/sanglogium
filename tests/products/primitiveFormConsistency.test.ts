// Primitive form consistency
//
// Question: is the value of each top-level product field in the same form on every product that holds it?
// Primitive = string, number or boolean. Top-level fields only; lists, objects and everything inside them are the next PR.
//
// Human-run, reads only. From the repo root:
// node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/products/primitiveFormConsistency.test.ts
//
// THE FLOW. Each step is a black box: what goes in, what comes out.
//   0. readSchema             productType.ts in            -> the schema's top-level field names, and which of them are primitive
//   1. proveTheScan           fake products in             -> throws unless every step gives the hand-written answer
//   2. readPublishedProducts  live dataset in              -> the published products
//   3. findFieldsInScope      products in                  -> the names of the fields to scan
//   4. scanField              products + one field in      -> that field's lists (inconsistencies, missing or holders)
//   5. formatReport           every field's lists in       -> the screen text and the file text
//   6. saveLatestRun          file text in                 -> tests/products/out/ holds only this run
import { createClient } from '@sanity/client';
import { deepStrictEqual } from 'node:assert';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

type Product = Record<string, unknown> & { _id: string };
type Schema = Awaited<ReturnType<typeof readSchema>>;

const PRIMITIVE_TYPES = ['string', 'number', 'boolean'];
const OUT_DIR = 'tests/products/out';
const OUT_FILE = `${OUT_DIR}/primitiveFormConsistency.txt`;

async function main() {
  swapSanityForStub();
  const schema = await readSchema(); // 0
  proveTheScan(schema); // 1

  const { published, notPublished, fetchNote } = await readPublishedProducts(); // 2
  const fields = findFieldsInScope(published, schema.primitive); // 3
  const lists = fields.map((field) => scanField(published, field, schema.all.has(field))); // 4
  const { screen, file } = formatReport(lists, published.length, notPublished); // 5
  saveLatestRun(file); // 6

  console.log(screen);
  console.log(fetchNote);
}

// ---- 0. readSchema --------------------------------------------------------------------------------------------
// IN: the real productType.ts. OUT: its top-level field names outside filterAttributes, and the primitive ones among them.
// `sanity` is swapped for a stub first: productType.ts imports defineType and defineField from it, and the fields are plain objects.
function swapSanityForStub() {
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (specifier === 'sanity') {
        const source = 'export const defineType = (x) => x; export const defineField = (x) => x; export const defineArrayMember = (x) => x;';
        return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
  });
}

async function readSchema() {
  const { productType } = await import('@/features/products/schema/productType');
  const fields = (productType as any).fields.filter((field: any) => field.name !== 'filterAttributes');
  return {
    all: new Set<string>(fields.map((field: any) => field.name)),
    primitive: new Set<string>(fields.filter((field: any) => PRIMITIVE_TYPES.includes(field.type)).map((field: any) => field.name)),
  };
}

// ---- 1. proveTheScan ------------------------------------------------------------------------------------------
// IN: fake products in the real format, with made-up content. OUT: nothing, or a thrown error naming the difference.
// The expected answers are written by hand. Steps 3 and 4 are called here exactly as the live run calls them.
function proveTheScan(schema: Schema) {
  // Step 4. f0, f7, f8 lack the field, so the reference comes from the first holder, f1. f2 repeats the reference form.
  // f3 string, f4 list, f5 null, f6 object and f9 empty list differ.
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
  deepStrictEqual(scanField(fake, 'stock', true), {
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

  // Step 4 again, for a field the schema does not define: holders and inconsistencies, no missing list.
  const alien: Product[] = [
    { _id: 'g3', dial: 'x' },
    { _id: 'g1', dial: 1 },
    { _id: 'g2' },
  ];
  deepStrictEqual(scanField(alien, 'dial', false), {
    field: 'dial',
    reference: 'number',
    holders: 2,
    forms: { number: 1, string: 1 },
    inconsistencies: [{ id: 'g3', form: 'string' }],
    missing: null,
    holderIds: ['g1', 'g3'],
  });

  // Step 3. In scope: `flag` and `stock` (primitive somewhere), `mix` (a primitive in one product, a list in another),
  // `sku` (from the schema list, held by nobody). Left out: `box` (object), `tags` (lists), `note` (null only),
  // `_hidden` (system key), `filterAttributes`.
  const scope: Product[] = [
    { _id: 'h1', stock: 1, box: { a: 1 }, tags: ['x'], mix: 'a', _hidden: 1, filterAttributes: { anc: 'x' }, flag: true },
    { _id: 'h2', mix: ['b'], tags: [], note: null },
  ];
  deepStrictEqual(findFieldsInScope(scope, new Set(['sku', 'stock'])), ['flag', 'mix', 'sku', 'stock']);

  // Step 0. The schema sets come from the real productType.
  deepStrictEqual(schema.all.has('stock'), true);
  deepStrictEqual(schema.all.has('filterAttributes'), false);
  deepStrictEqual([...schema.primitive].sort(), ['displayPriority', 'name', 'reservedStock', 'sku', 'stock']);

  console.log('proof on fake products: passed');
}

// ---- 2. readPublishedProducts ---------------------------------------------------------------------------------
// IN: the live dataset (raw perspective, so drafts could be seen). OUT: the published products, and how many documents were not.
async function readPublishedProducts() {
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
  const seconds = (Date.now() - started) / 1000;
  const published = docs.filter((doc) => !doc._id.startsWith('drafts.') && !doc._id.startsWith('versions.'));
  return {
    published,
    notPublished: docs.length - published.length,
    fetchNote: `fetched ${docs.length} documents, ${(JSON.stringify(docs).length / 1e6).toFixed(1)} MB, in ${seconds.toFixed(1)} s`,
  };
}

// ---- 3. findFieldsInScope -------------------------------------------------------------------------------------
// IN: products, and the schema's primitive field names.
// OUT: sorted names of the top-level fields to scan: every field some product holds as a primitive
// (not `_` keys, not filterAttributes), plus the schema's primitive fields, so a field nobody holds still shows.
function findFieldsInScope(products: Product[], schemaPrimitive: Set<string>): string[] {
  const names = new Set(schemaPrimitive);
  for (const product of products) {
    for (const [key, value] of Object.entries(product)) {
      if (!key.startsWith('_') && key !== 'filterAttributes' && isPrimitive(value)) names.add(key);
    }
  }
  return [...names].sort();
}

function isPrimitive(value: unknown) {
  return PRIMITIVE_TYPES.includes(typeof value);
}

// ---- 4. scanField ---------------------------------------------------------------------------------------------
// IN: products, one field name, and whether the schema defines that field.
// OUT: the field's lists. Products are taken in `_id` order. The first holder sets the reference form; each later
// holder is compared to it. A product lacking the field goes to `missing`, unless the schema does not define the
// field: then there is no missing list (null) and the holders are listed instead.
function scanField(products: Product[], field: string, definedBySchema: boolean) {
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

// The form of one value: its JSON kind. What is inside a list or an object is not looked at here.
function formOf(value: unknown): string {
  return value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
}

// ---- 5. formatReport ------------------------------------------------------------------------------------------
// IN: every field's lists, and the product counts. OUT: `screen` (header and one table row per field)
// and `file` (the same, then the full lists of every field that has something to list).
function formatReport(lists: ReturnType<typeof scanField>[], publishedCount: number, notPublishedCount: number) {
  const width = Math.max(5, ...lists.map((list) => list.field.length));

  const header = [
    `products read: ${publishedCount} published (not published: ${notPublishedCount})`,
    `fields in scope: ${lists.length}, with inconsistencies: ${lists.filter((list) => list.inconsistencies.length > 0).length}`,
    '',
  ];

  const row = (list: ReturnType<typeof scanField>) => {
    const schemaCell = (list.missing === null ? 'no' : 'yes').padEnd(6);
    const holdersCell = String(list.holders).padStart(7);
    const missingCell = (list.missing === null ? '-' : String(list.missing.length)).padStart(7);
    const inconsistentCell = String(list.inconsistencies.length).padStart(12);
    const formsCell = Object.entries(list.forms)
      .map(([form, count]) => `${form}:${count}`)
      .join(' ');
    return `${list.field.padEnd(width)}  ${schemaCell}  ${holdersCell}  ${missingCell}  ${inconsistentCell}  ${formsCell}`;
  };
  const table = [`${'field'.padEnd(width)}  schema  holders  missing  inconsistent  forms`, ...lists.map(row)];

  const block = (list: ReturnType<typeof scanField>) => [
    '',
    `== ${list.field} ==`,
    `inconsistencies: ${list.inconsistencies.length}`,
    ...list.inconsistencies.map((item) => `  ${item.id}  ${item.form}`),
    ...(list.missing === null
      ? [`holders (not in schema): ${list.holderIds!.length}`, ...list.holderIds!.map((id) => `  ${id}`)]
      : [`missing: ${list.missing.length}`, ...list.missing.map((id) => `  ${id}`)]),
  ];
  const details = lists
    .filter((list) => list.inconsistencies.length > 0 || (list.missing?.length ?? 0) > 0 || list.holderIds !== null)
    .flatMap(block);

  return {
    screen: `${[...header, ...table].join('\n')}\n\nlists: ${OUT_FILE} (${details.length} detail lines)`,
    file: `${[...header, ...table, ...details].join('\n')}\n`,
  };
}

// ---- 6. saveLatestRun -----------------------------------------------------------------------------------------
// IN: the file text. OUT: tests/products/out/ holds that one file and nothing from earlier runs.
function saveLatestRun(file: string) {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, file);
}

await main();
