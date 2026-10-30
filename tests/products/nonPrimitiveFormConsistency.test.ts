// Form consistency of the product data in the CMS. It lists the inconsistencies of
//   - the non-filter fields, once for all published products, and
//   - filterAttributes, for each catalogue slice (each slice has its own fields).
// Human-run. Reads only. The same data and the same code give the same text; the fingerprint says which data.
// node --env-file=/home/jan/work/sanglogium/.env.local --experimental-strip-types --import ./tools/alias-loader.mjs tests/products/nonPrimitiveFormConsistency.test.ts
// The whole list (every product, no cut) is also written to tests/products/nonPrimitiveOut/nonPrimitiveFormConsistency.txt.
// Exit code 1 when the live data has any inconsistency.
//
// FLOW  one snapshot -> slices -> schema facts -> what each product holds -> judge each path -> one report -> printout
// The proofs on fake products run first (no network), then the live run.
//
// What counts as an inconsistency (the owner's rulings, 2026-10-30), in the order it is printed.
// A value is listed once, under the first kind that finds it, so the totals count it once;
// the items inside a list or object that is already listed are covered by that entry.
//   null stored                          a key whose value is null (the clean form of "no value" is no key at all)
//   empty list stored                    filterAttributes only: a list with no items
//   path the schema does not declare     a value on a path the schema does not declare for this scope
//   mixed form on one path               the products of one scope hold the same path in different forms
//                                        (text, number, true/false, list, object)
//   form differs from the schema         a stored form other than the one the schema declares
//   value outside the option list        text not in the schema's option list
//   spellings that differ only by capitals
//                                        filterAttributes only: a facet groups by exact text, so Black and black are two options;
//                                        the non-filter fields are display text, so capitals are not checked there
//   required field absent                non-filter fields only: the schema requires the field and the product has no key
// A missing key is clean (except a required field). This checks form, not truth: a wrong but well-formed value passes.

import { createClient } from '@sanity/client';
import { deepStrictEqual } from 'node:assert';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// `sanity` is swapped for a stub: the schema files import defineType, defineField and defineArrayMember from it,
// and the field lists are plain objects.
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
const { headphonesFields } = await import('@/features/products/schema/productFilterAttributes/headphones');
const { audioElectronicsFields } = await import('@/features/products/schema/productFilterAttributes/audioElectronics');
const { accessoriesFields } = await import('@/features/products/schema/productFilterAttributes/accessories');

type Doc = Record<string, any> & { _id: string };
type CatalogueItem = { _id: string; _rev: string; slug: string | null; parent: string | null };
type Snapshot = { count: number; products: Doc[]; catalogue: CatalogueItem[] };
type Form = 'null' | 'array' | 'object' | 'string' | 'number' | 'boolean';
type Seen = { id: string; at: string; up: string | null; form: Form; empty: boolean; value: string | null };
type Decl = { form: Form | 'any'; opaque: boolean; required: boolean; vocab: string[] | null };
type Section = Record<string, { note: string; entries: string[] }>;
type Findings = {
  nullStored: Section;
  emptyListStored: Section;
  mixedForm: Section;
  differsFromSchema: Section;
  undeclared: Section;
  offList: Section;
  caseVariants: Section;
  requiredAbsent: Section;
  info: { emptyLists: Section; heldByNobody: string[] };
};
type SchemaInput = { productFields: any[]; filterGroups: Record<string, any[]> };

// The kinds of inconsistency, in the order they are printed. A value is listed under the first kind that finds it.
const SECTIONS = [
  ['nullStored', 'null stored'],
  ['emptyListStored', 'empty list stored'],
  ['undeclared', 'path the schema does not declare here'],
  ['mixedForm', 'mixed form on one path'],
  ['differsFromSchema', 'form differs from the schema'],
  ['offList', 'value outside the option list'],
  ['caseVariants', 'spellings that differ only by capitals'],
  ['requiredAbsent', 'required field absent'],
] as const;
const FILTER_METADATA = ['sourcing']; // filterAttributes.sourcing records where a value came from; it is not a filter value
const PLACEHOLDER_LIST = '<brand-slug>'; // the brand option list is a placeholder, so it is no option list

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const isPublished = (p: Doc) => !p._id.startsWith('drafts.') && !p._id.startsWith('versions.');
const formOf = (v: unknown): Form =>
  v === null || v === undefined ? 'null' : Array.isArray(v) ? 'array' : typeof v === 'object' ? 'object' : (typeof v as Form);
const emptyFindings = (): Findings => ({
  nullStored: {},
  emptyListStored: {},
  mixedForm: {},
  differsFromSchema: {},
  undeclared: {},
  offList: {},
  caseVariants: {},
  requiredAbsent: {},
  info: { emptyLists: {}, heldByNobody: [] },
});

// ===== STEP 1  READ ONE SNAPSHOT =====================================================================
// IN   a Sanity client
// OUT  { count, products, catalogue }: every product document and every catalogue item
// WHY  one query is one moment in time, so the lists cannot mix two states of the data;
//      the count comes from the same query and must equal the documents read
async function readSnapshot(client: any): Promise<Snapshot> {
  const snapshot: Snapshot = await client.fetch(`{
    "count": count(*[_type == "product"]),
    "products": *[_type == "product"] | order(_id asc),
    "catalogue": *[_type == "catalogueItem"] | order(_id asc) { _id, _rev, "slug": slug.current, "parent": parent._ref }
  }`);
  if (snapshot.products.length !== snapshot.count) {
    throw new Error(`read ${snapshot.products.length} products but the query counts ${snapshot.count}`);
  }
  return snapshot;
}

// ===== STEP 2  NAME THE SLICES =======================================================================
// IN   published products, catalogue items, the slice names ['headphones', ...]
// OUT  { members: { headphones: ['p01', ...], ... }, none: [ids in no slice], several: [ids in two or more] }
// WHY  filterAttributes differ by slice, so every product is judged inside the slice its catalogue keys put it in
function sliceKeySets(catalogue: CatalogueItem[], names: string[]): Record<string, Set<string>> {
  const sets: Record<string, Set<string>> = {};
  for (const name of names) {
    const root = catalogue.find((item) => item.slug === name);
    if (!root) throw new Error(`no catalogue item has the slug ${name}`);
    const ids = new Set<string>([root._id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const item of catalogue) {
        if (item.parent && ids.has(item.parent) && !ids.has(item._id)) {
          ids.add(item._id);
          grew = true;
        }
      }
    }
    sets[name] = ids;
  }
  return sets;
}

function findSlices(products: Doc[], catalogue: CatalogueItem[], names: string[]) {
  const sets = sliceKeySets(catalogue, names);
  const members: Record<string, string[]> = Object.fromEntries(names.map((name) => [name, [] as string[]]));
  const none: string[] = [];
  const several: string[] = [];
  for (const p of products) {
    const keys: string[] = Array.isArray(p.catalogueLocationKeys) ? p.catalogueLocationKeys : [];
    const mine = names.filter((name) => keys.some((key) => sets[name].has(key)));
    for (const name of mine) members[name].push(p._id);
    if (mine.length === 0) none.push(p._id);
    if (mine.length > 1) several.push(p._id);
  }
  return { members, none, several };
}

// ===== STEP 3  READ THE SCHEMA =======================================================================
// IN   a list of schema fields (plain objects), the field names to leave out
// OUT  a map path -> { form, opaque, required, vocab }
//      for example 'cost.amount' -> { form: 'number', opaque: false, required: true, vocab: null }
//      a list item has the path 'rows[]', a field of a list item 'rows[].k'
// WHY  the schema says which form a path should have, which text values it may hold and which fields are required;
//      a path under a built-in object type (slug, image, reference, block) is not spelled out in the schema,
//      so such a type is judged as a whole only
const SIMPLE: Record<string, Form> = {
  string: 'string',
  text: 'string',
  url: 'string',
  date: 'string',
  datetime: 'string',
  number: 'number',
  boolean: 'boolean',
};
const BUILT_IN_OBJECTS = new Set(['slug', 'reference', 'image', 'file', 'geopoint', 'block']);

// A field is required when its validation calls .required(); a stand-in Rule records that call.
function isRequired(field: any): boolean {
  if (typeof field.validation !== 'function') return false;
  let required = false;
  const rule: any = new Proxy(function () {}, {
    get: (_target, prop) =>
      prop === 'required'
        ? () => {
            required = true;
            return rule;
          }
        : () => rule,
    apply: () => rule,
  });
  try {
    field.validation(rule);
  } catch {
    // a validation that needs a real document says nothing about presence
  }
  return required;
}

function listOf(field: any): string[] | null {
  const list = field?.options?.list;
  if (!Array.isArray(list)) return null;
  const values = list.map((x: any) => (typeof x === 'string' ? x : x?.value));
  return values.includes(PLACEHOLDER_LIST) ? null : values;
}

function readSchema(fields: any[], leaveOut: string[] = []): Map<string, Decl> {
  const map = new Map<string, Decl>();
  const add = (path: string, form: Form | 'any', extra: Partial<Decl> = {}) => {
    map.set(path, { form, opaque: false, required: false, vocab: null, ...extra });
  };
  const readMember = (member: any, path: string) => {
    const type = member.type as string;
    if (SIMPLE[type]) return add(path, SIMPLE[type], { vocab: listOf(member) });
    if (Array.isArray(member.fields)) {
      add(path, 'object');
      for (const child of member.fields) readField(child, `${path}.${child.name}`);
      return;
    }
    if (BUILT_IN_OBJECTS.has(type)) return add(path, 'object', { opaque: true });
    add(path, 'any');
  };
  const readField = (field: any, path: string) => {
    const type = field.type as string;
    const required = isRequired(field);
    if (SIMPLE[type]) return add(path, SIMPLE[type], { required, vocab: listOf(field) });
    if (type === 'object' && Array.isArray(field.fields)) {
      add(path, 'object', { required });
      for (const child of field.fields) readField(child, `${path}.${child.name}`);
      return;
    }
    if (BUILT_IN_OBJECTS.has(type)) return add(path, 'object', { opaque: true, required });
    if (type === 'array') {
      add(path, 'array', { required });
      for (const member of field.of ?? []) readMember(member, `${path}[]`);
      return;
    }
    add(path, 'any', { required });
  };
  for (const field of fields) if (!leaveOut.includes(field.name)) readField(field, field.name);
  return map;
}

// ===== STEP 4  LIST WHAT EACH PRODUCT HOLDS ==========================================================
// IN   roots to read, one per product: { id, root, skip }
// OUT  a map path -> every place the path occurs
//      for example 'rows[].v' -> [{ id: 'p01', at: 'rows[0].v', form: 'string', ... }, ...]
// WHY  everything after this compares the places that share a path; a list is read item by item under 'path[]'
//      keys that start with _ are the CMS's own and are skipped
//      each place also names its parent place (up), so a place inside a list or object can be tied to it
function walk(roots: { id: string; root: Record<string, any>; skip: string[] }[]): Map<string, Seen[]> {
  const seen = new Map<string, Seen[]>();
  const visit = (value: unknown, path: string, id: string, at: string, up: string | null) => {
    const form = formOf(value);
    const places = seen.get(path) ?? [];
    seen.set(path, places);
    places.push({
      id,
      at,
      up,
      form,
      empty: form === 'array' && (value as unknown[]).length === 0,
      value: form === 'string' ? (value as string) : null,
    });
    if (form === 'array') {
      (value as unknown[]).forEach((item, i) => visit(item, `${path}[]`, id, `${at}[${i}]`, at));
    } else if (form === 'object') {
      for (const key of Object.keys(value as object)) {
        if (!key.startsWith('_')) visit((value as any)[key], `${path}.${key}`, id, `${at}.${key}`, at);
      }
    }
  };
  for (const { id, root, skip } of roots) {
    for (const key of Object.keys(root)) {
      if (!key.startsWith('_') && !skip.includes(key)) visit(root[key], key, id, key, null);
    }
  }
  return seen;
}

// ===== STEP 5  JUDGE EACH PATH =======================================================================
// IN   the places per path, the schema map, the kind of scope ('nonFilter' or 'filter'), the ids in scope,
//      the schema maps of the other slices
// OUT  Findings: one section per kind of inconsistency; each path has a one-line note and its entries
//      an entry is 'id place' (for example 'p02 cost.amount string')
// WHY  this is the one place that decides what is an inconsistency; the proof below pins every decision
//      a value is listed once, under the first kind in the printed order; the items inside a list or object that is already listed are covered by that entry
const histogram = (counts: Record<string, number>) =>
  Object.keys(counts)
    .sort()
    .map((form) => `${form} ${counts[form]}`)
    .join(', ');
const entry = (s: Seen, extra = '') => `${s.id} ${s.at}${extra}`;

function classify(
  seen: Map<string, Seen[]>,
  schema: Map<string, Decl>,
  mode: 'nonFilter' | 'filter',
  scopeIds: string[],
  others: Record<string, Map<string, Decl>> = {},
): Findings {
  const f = emptyFindings();
  const put = (section: Section, path: string, note: string, entries: string[]) => {
    section[path] = { note, entries: entries.sort(byText) };
  };
  const opaqueRoots = [...schema].filter(([, d]) => d.opaque).map(([path]) => path);
  const underOpaque = (path: string) => opaqueRoots.some((o) => path.startsWith(`${o}.`) || path.startsWith(`${o}[`));

  // A value is listed once: `take` keeps the places that no earlier kind has listed, and lists them now.
  const claimed = new Set<string>();
  const take = (places: Seen[]) => {
    const fresh = places.filter((s) => !claimed.has(`${s.id} ${s.at}`));
    for (const s of fresh) claimed.add(`${s.id} ${s.at}`);
    return fresh;
  };

  for (const path of [...seen.keys()].sort(byText)) {
    // A path sorts before its children, so a place inside a list or object that is already listed is covered by that entry.
    const all = (seen.get(path) as Seen[]).filter((s) => {
      if (s.up === null || !claimed.has(`${s.id} ${s.up}`)) return true;
      claimed.add(`${s.id} ${s.at}`);
      return false;
    });
    const nulls = take(all.filter((s) => s.form === 'null'));
    const empties = take(all.filter((s) => s.empty));
    const real = all.filter((s) => s.form !== 'null' && !s.empty);

    if (nulls.length) put(f.nullStored, path, '', nulls.map((s) => entry(s)));
    if (empties.length) put(mode === 'filter' ? f.emptyListStored : f.info.emptyLists, path, '', empties.map((s) => entry(s)));

    const decl = schema.get(path);
    if (!decl && !underOpaque(path)) {
      const declaredIn = Object.keys(others).filter((name) => others[name].has(path)).sort();
      const here = take(real);
      if (here.length) put(f.undeclared, path, declaredIn.length ? `declared in ${declaredIn.join(', ')}` : 'declared nowhere', here.map((s) => entry(s)));
    }

    const counts: Record<string, number> = {};
    for (const s of real) counts[s.form] = (counts[s.form] ?? 0) + 1;
    const forms = Object.keys(counts).sort();
    if (forms.length > 1) {
      const majority = forms.reduce((a, b) => (counts[b] > counts[a] ? b : a));
      const rest = { ...counts };
      delete rest[majority];
      const minority = take(real.filter((s) => s.form !== majority));
      if (minority.length) {
        put(f.mixedForm, path, `most hold ${majority}; others: ${histogram(rest)}`, minority.map((s) => entry(s, ` ${s.form}`)));
      }
    }

    if (decl && decl.form !== 'any') {
      const wrong = take(real.filter((s) => s.form !== decl.form));
      if (wrong.length) {
        put(f.differsFromSchema, path, `schema declares ${decl.form}; stored: ${histogram(counts)}`, wrong.map((s) => entry(s, ` ${s.form}`)));
      }
    }

    const strings = real.filter((s) => s.form === 'string');
    const vocab = decl?.vocab ?? null;
    if (vocab) {
      const off = take(strings.filter((s) => !vocab.includes(s.value as string)));
      if (off.length) put(f.offList, path, 'outside the option list', off.map((s) => entry(s, ` value=${s.value}`)));
    } else if (mode === 'filter') {
      // a facet groups by exact text, so two spellings of one word are two options; the non-filter fields are display text
      const spellings = new Map<string, Set<string>>();
      for (const s of strings) {
        const lower = (s.value as string).toLowerCase();
        spellings.set(lower, (spellings.get(lower) ?? new Set<string>()).add(s.value as string));
      }
      const clashing = new Set([...spellings.values()].filter((raws) => raws.size > 1).flatMap((raws) => [...raws]));
      const hits = take(strings.filter((s) => clashing.has(s.value as string)));
      if (hits.length) put(f.caseVariants, path, 'same word, different capitals', hits.map((s) => entry(s, ` value=${s.value}`)));
    }
  }

  if (mode === 'nonFilter') {
    for (const [path, d] of schema) {
      if (!d.required || path.includes('[')) continue;
      const parent = path.includes('.') ? path.slice(0, path.lastIndexOf('.')) : null;
      const holding = new Set((seen.get(path) ?? []).map((s) => s.id));
      const candidates = parent
        ? new Set((seen.get(parent) ?? []).filter((s) => s.form === 'object').map((s) => s.id))
        : new Set(scopeIds);
      const absent = [...candidates].filter((id) => !holding.has(id));
      if (absent.length) put(f.requiredAbsent, path, 'required by the schema', absent.map((id) => `${id} ${path}`));
    }
  }

  f.info.heldByNobody = [...schema.keys()].filter((path) => !path.includes('[') && !seen.has(path)).sort(byText);
  return f;
}

// ===== STEP 6  ONE REPORT ============================================================================
// IN   the snapshot, the schema fields
// OUT  { slices, nonFilter, filter: { headphones: Findings, ... } }
// WHY  the non-filter fields follow the same rules in every slice, so they are judged once over all published products;
//      filterAttributes are judged inside each slice, against that slice's own fields
function filterRoot(p: Doc): Record<string, any> {
  const fa = p.filterAttributes;
  if (fa === undefined) return {};
  if (fa === null || typeof fa !== 'object' || Array.isArray(fa)) throw new Error(`filterAttributes of ${p._id} is not an object`);
  return fa;
}

function report(snapshot: Snapshot, input: SchemaInput) {
  const products = snapshot.products.filter(isPublished).sort((a, b) => byText(a._id, b._id));
  const names = Object.keys(input.filterGroups);
  const slices = findSlices(products, snapshot.catalogue, names);

  const nonFilter = classify(
    walk(products.map((p) => ({ id: p._id, root: p, skip: ['filterAttributes'] }))),
    readSchema(input.productFields, ['filterAttributes']),
    'nonFilter',
    products.map((p) => p._id),
  );

  const schemas = Object.fromEntries(names.map((name) => [name, readSchema(input.filterGroups[name], FILTER_METADATA)]));
  const filter: Record<string, Findings> = {};
  for (const name of names) {
    const mine = products.filter((p) => slices.members[name].includes(p._id));
    const others = Object.fromEntries(names.filter((n) => n !== name).map((n) => [n, schemas[n]]));
    filter[name] = classify(
      walk(mine.map((p) => ({ id: p._id, root: filterRoot(p), skip: FILTER_METADATA }))),
      schemas[name],
      'filter',
      mine.map((p) => p._id),
      others,
    );
  }
  return { slices, nonFilter, filter };
}

// ===== STEP 7  PRINT =================================================================================
// IN   one scope's Findings, how many entries to show under each path
// OUT  plain text lines: a blank line between kinds, nothing else drawn
// WHY  the printout shows a few entries per path; the file written by the live run shows all of them
const countEntries = (section: Section) => Object.values(section).reduce((n, p) => n + p.entries.length, 0);
const totalOf = (f: Findings) => SECTIONS.reduce((n, [key]) => n + countEntries(f[key]), 0);

function block(label: string, section: Section, limit: number): string[] {
  const paths = Object.keys(section).sort(byText);
  if (!paths.length) return [`${label}: none`];
  const lines = [`${label}: entries ${countEntries(section)}, paths ${paths.length}`];
  for (const path of paths) {
    const { note, entries } = section[path];
    lines.push(`  ${path}  count ${entries.length}`);
    if (note) lines.push(`    ${note}`);
    for (const e of entries.slice(0, limit)) lines.push(`    ${e}`);
    if (entries.length > limit) lines.push(`    and ${entries.length - limit} more in the file`);
  }
  return lines;
}

function renderScope(title: string, f: Findings, limit: number): string[] {
  const lines = [title, `inconsistencies: ${totalOf(f)}`];
  for (const [key, label] of SECTIONS) lines.push('', ...block(label, f[key], limit));
  lines.push('', 'for information, not inconsistencies', ...block('empty lists stored', f.info.emptyLists, limit));
  lines.push(`declared but held by no product: ${f.info.heldByNobody.length ? f.info.heldByNobody.join(', ') : 'none'}`);
  return lines;
}

// ===== PROOF 1  THE REPORT, ON FAKE PRODUCTS =========================================================
// Fake fields and products in the real format with alien content. The expected values are written by hand.
// Slices: headphones p01 p02 p03 p09, audio-electronics p04 p05 p09, accessories p06 p07 p10; p08 is in none, p09 in two.
// Each kind of inconsistency appears at least once; the draft must be ignored; the products are not in id order.
// Capitals: mat (p06 Brass, p10 brass) is flagged in filterAttributes; the labels a (p01) and A (p10) are one word with other capitals on a non-filter field and must not be flagged.
// Counted once: fx (p01 text, p03 number) is an undeclared path, so it is listed whole and not again as mixed form; extras (p03) is an undeclared
// list, so its items are not listed again, nor as capitals; wire (p06) is a list where the schema says text, listed once as differing form, its items not again.
const img = (ref: string) => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } });
const fakeSchema: SchemaInput = {
  productFields: [
    { name: 'label', type: 'string', validation: (Rule: any) => Rule.required() },
    {
      name: 'cost',
      type: 'object',
      validation: (Rule: any) => Rule.required(),
      fields: [
        { name: 'amount', type: 'number', validation: (Rule: any) => Rule.required().min(0) },
        { name: 'unit', type: 'string' },
      ],
    },
    { name: 'cover', type: 'image' },
    {
      name: 'rows',
      type: 'array',
      of: [{ type: 'object', fields: [{ name: 'k', type: 'string' }, { name: 'v', type: 'string' }] }],
    },
    { name: 'spare', type: 'string' },
    { name: 'catalogueLocationKeys', type: 'array', of: [{ type: 'string' }], validation: (Rule: any) => Rule.required() },
    { name: 'filterAttributes', type: 'object', fields: [] },
  ],
  filterGroups: {
    headphones: [
      { name: 'tags', type: 'array', of: [{ type: 'string' }] },
      { name: 'cups', type: 'array', of: [{ type: 'string', options: { list: ['open', 'closed'] } }] },
      { name: 'ohms', type: 'number' },
      {
        name: 'bat',
        type: 'object',
        fields: [{ name: 'on', type: 'number' }, { name: 'off', type: 'number' }],
      },
    ],
    'audio-electronics': [
      { name: 'tags', type: 'array', of: [{ type: 'string' }] },
      { name: 'chip', type: 'string', options: { list: ['alpha', 'beta'] } },
      { name: 'bal', type: 'boolean' },
    ],
    accessories: [
      { name: 'tags', type: 'array', of: [{ type: 'string' }] },
      { name: 'len', type: 'number' },
      { name: 'mat', type: 'string' },
      { name: 'idle', type: 'string' },
      { name: 'wire', type: 'string' },
    ],
  },
};
const fakeSnapshot: Snapshot = {
  count: 11,
  catalogue: [
    { _id: 'c-hp', _rev: 'r', slug: 'headphones', parent: null },
    { _id: 'c-hp-1', _rev: 'r', slug: 'over-ear', parent: 'c-hp' },
    { _id: 'c-ae', _rev: 'r', slug: 'audio-electronics', parent: null },
    { _id: 'c-ac', _rev: 'r', slug: 'accessories', parent: null },
    { _id: 'c-ac-1', _rev: 'r', slug: 'cables', parent: 'c-ac' },
    { _id: 'c-misc', _rev: 'r', slug: 'misc', parent: null },
  ],
  products: [
    { _id: 'p07', label: 'g', cost: { unit: 'zz' }, cover: img('i6'), catalogueLocationKeys: ['c-ac'], filterAttributes: { tags: 'r', len: 'x' } },
    { _id: 'drafts.p01', label: 'draft', cost: { amount: 'x' }, catalogueLocationKeys: ['c-hp'] },
    {
      _id: 'p03',
      label: 'c',
      cost: { amount: 30 },
      cover: 'img',
      rows: [],
      catalogueLocationKeys: ['c-hp-1'],
      filterAttributes: { tags: [], cups: ['closed', 'Closed'], ohms: 32, bat: { on: 6 }, fx: 1, extras: ['n', 'N'] },
    },
    { _id: 'p10', label: 'A', cost: { amount: 90, unit: 'zz' }, cover: img('i9'), catalogueLocationKeys: ['c-ac-1'], filterAttributes: { tags: ['r'], len: 2, mat: 'brass' } },
    {
      _id: 'p01',
      label: 'a',
      cost: { amount: 10, unit: 'zz' },
      cover: img('i1'),
      rows: [{ k: 'a', v: 'b' }],
      catalogueLocationKeys: ['c-hp-1'],
      filterAttributes: { tags: ['q'], cups: ['open'], ohms: 32, bat: { on: 5, off: 7 }, fx: 'one' },
    },
    { _id: 'p05', label: 'e', cost: null, cover: img('i4'), catalogueLocationKeys: ['c-ae'], filterAttributes: { tags: ['q'], chip: 'Alpha', bal: null } },
    { _id: 'p09', label: 'i', cost: { amount: 80, unit: 'zz' }, cover: img('i8'), catalogueLocationKeys: ['c-hp-1', 'c-ae'], filterAttributes: { tags: ['q'] } },
    {
      _id: 'p02',
      label: 'b',
      cost: { amount: '20', unit: 'zz' },
      cover: img('i2'),
      rows: [{ k: 'c', v: 9 }],
      catalogueLocationKeys: ['c-hp'],
      filterAttributes: { tags: ['q', 'r'], cups: 'open', ohms: 40, bat: { on: 5, off: null } },
    },
    { _id: 'p08', cost: { amount: 70, unit: 'zz' }, cover: img('i7'), catalogueLocationKeys: ['c-misc'] },
    {
      _id: 'p04',
      label: 'd',
      cost: { amount: 40, unit: 'zz' },
      cover: img('i3'),
      rows: [{ k: 'd', v: 'e' }],
      dial: 1,
      catalogueLocationKeys: ['c-ae'],
      filterAttributes: { tags: ['q'], chip: 'alpha', bal: true, len: 3 },
    },
    { _id: 'p06', label: 'f', cost: { amount: 50, unit: 'zz' }, cover: img('i5'), catalogueLocationKeys: ['c-ac-1'], filterAttributes: { tags: ['r'], len: 1.5, mat: 'Brass', wire: ['x', 'X'] } },
  ],
};

const blank = () => ({
  nullStored: {},
  emptyListStored: {},
  mixedForm: {},
  differsFromSchema: {},
  undeclared: {},
  offList: {},
  caseVariants: {},
  requiredAbsent: {},
  info: { emptyLists: {}, heldByNobody: [] as string[] },
});
const s = (note: string, entries: string[]) => ({ note, entries });

const expectedReport = {
  slices: {
    members: {
      headphones: ['p01', 'p02', 'p03', 'p09'],
      'audio-electronics': ['p04', 'p05', 'p09'],
      accessories: ['p06', 'p07', 'p10'],
    },
    none: ['p08'],
    several: ['p09'],
  },
  nonFilter: {
    ...blank(),
    nullStored: { cost: s('', ['p05 cost']) },
    undeclared: { dial: s('declared nowhere', ['p04 dial']) },
    mixedForm: {
      'cost.amount': s('most hold number; others: string 1', ['p02 cost.amount string']),
      cover: s('most hold object; others: string 1', ['p03 cover string']),
      'rows[].v': s('most hold string; others: number 1', ['p02 rows[0].v number']),
    },
    requiredAbsent: {
      label: s('required by the schema', ['p08 label']),
      'cost.amount': s('required by the schema', ['p07 cost.amount']),
    },
    info: { emptyLists: { rows: s('', ['p03 rows']) }, heldByNobody: ['spare'] },
  },
  filter: {
    headphones: {
      ...blank(),
      nullStored: { 'bat.off': s('', ['p02 bat.off']) },
      emptyListStored: { tags: s('', ['p03 tags']) },
      undeclared: {
        extras: s('declared nowhere', ['p03 extras']),
        fx: s('declared nowhere', ['p01 fx', 'p03 fx']),
      },
      mixedForm: { cups: s('most hold array; others: string 1', ['p02 cups string']) },
      offList: { 'cups[]': s('outside the option list', ['p03 cups[1] value=Closed']) },
    },
    'audio-electronics': {
      ...blank(),
      nullStored: { bal: s('', ['p05 bal']) },
      undeclared: { len: s('declared in accessories', ['p04 len']) },
      offList: { chip: s('outside the option list', ['p05 chip value=Alpha']) },
    },
    accessories: {
      ...blank(),
      mixedForm: {
        len: s('most hold number; others: string 1', ['p07 len string']),
        tags: s('most hold array; others: string 1', ['p07 tags string']),
      },
      differsFromSchema: { wire: s('schema declares string; stored: array 1', ['p06 wire array']) },
      caseVariants: { mat: s('same word, different capitals', ['p06 mat value=Brass', 'p10 mat value=brass']) },
      info: { emptyLists: {}, heldByNobody: ['idle'] },
    },
  },
};
deepStrictEqual(report(fakeSnapshot, fakeSchema), expectedReport);
console.log('proof on fake products: passed');

// ===== PROOF 2  THE PRINTOUT, ON A SMALL HAND-MADE SCOPE =============================================
const miniScope: Findings = {
  ...blank(),
  nullStored: { 'bat.off': s('', ['p02 bat.off', 'p05 bat.off']) },
  mixedForm: { cups: s('most hold array; others: string 1', ['p02 cups string']) },
  info: { emptyLists: {}, heldByNobody: ['idle'] },
};
const expectedLines = `Mini scope
inconsistencies: 3

null stored: entries 2, paths 1
  bat.off  count 2
    p02 bat.off
    and 1 more in the file

empty list stored: none

path the schema does not declare here: none

mixed form on one path: entries 1, paths 1
  cups  count 1
    most hold array; others: string 1
    p02 cups string

form differs from the schema: none

value outside the option list: none

spellings that differ only by capitals: none

required field absent: none

for information, not inconsistencies
empty lists stored: none
declared but held by no product: idle`.split('\n');
deepStrictEqual(renderScope('Mini scope', miniScope, 1), expectedLines);
console.log('proof of the printout: passed');

// ===== LIVE RUN  THE CMS =============================================================================
const SLICES = ['headphones', 'audio-electronics', 'accessories'];
const OUT = 'tests/products/nonPrimitiveOut/nonPrimitiveFormConsistency.txt';
const liveSchema: SchemaInput = {
  productFields: (productType as any).fields,
  filterGroups: {
    headphones: [...headphonesFields],
    'audio-electronics': [...audioElectronicsFields],
    accessories: [...accessoriesFields],
  },
};

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14',
  useCdn: false,
  perspective: 'raw',
  token: process.env.SANITY_API_READ_TOKEN,
});
const snapshot = await readSnapshot(client);
const published = snapshot.products.filter(isPublished);
const result = report(snapshot, liveSchema);

// The app routes by the build-time catalogue index; the test judges by the live catalogue. They should agree.
const index = JSON.parse(readFileSync('data/catalogue-index.json', 'utf8'));
const liveSets = sliceKeySets(snapshot.catalogue, SLICES);
const indexDiffers = SLICES.filter((name) => {
  const fromIndex = new Set<string>();
  const stack: string[] = [index.slugToIdMap[name]];
  while (stack.length) {
    const id = stack.pop() as string;
    if (fromIndex.has(id)) continue;
    fromIndex.add(id);
    stack.push(...(index.slotMetadataMap[id]?.children ?? []));
  }
  return fromIndex.size !== liveSets[name].size || [...fromIndex].some((id) => !liveSets[name].has(id));
});

const fingerprint = createHash('sha256')
  .update(
    [...published.map((p) => `${p._id}:${p._rev}`), ...snapshot.catalogue.map((c) => `${c._id}:${c._rev}`)]
      .sort(byText)
      .join('\n'),
  )
  .digest('hex')
  .slice(0, 12);

const scopes = [
  { title: `non-filter fields, all ${published.length} products`, findings: result.nonFilter },
  ...SLICES.map((name) => ({
    title: `filterAttributes, slice ${name}, ${result.slices.members[name].length} products`,
    findings: result.filter[name],
  })),
];
const idsOf = (ids: string[]) => `${ids.length}${ids.length ? `: ${ids.slice(0, 5).join(', ')}` : ''}`;
const head = [
  `products read: ${published.length} published (not published: ${snapshot.products.length - published.length}), one query`,
  `fingerprint: ${fingerprint}`,
  `catalogue index (generated ${index.generatedAt}): ${indexDiffers.length ? `differs from the live catalogue for ${indexDiffers.join(', ')}` : 'agrees with the live catalogue'}`,
  '',
  'products by slice',
  ...SLICES.map((name) => `  ${name} ${result.slices.members[name].length}`),
  `  in no slice: ${idsOf(result.slices.none)}`,
  `  in several slices: ${idsOf(result.slices.several)}`,
  '',
  'inconsistencies by scope (each value is counted once, under the first kind that finds it)',
  ...scopes.map((scope) => `  ${scope.title}: ${totalOf(scope.findings)}`),
];
const body = (limit: number) => scopes.flatMap((scope) => ['', '', ...renderScope(scope.title, scope.findings, limit)]);

mkdirSync('tests/products/nonPrimitiveOut', { recursive: true });
writeFileSync(OUT, `${[...head, ...body(Infinity)].join('\n')}\n`);
console.log([...head, ...body(3)].join('\n'));
console.log(`\noutput: ${pathToFileURL(resolve(OUT)).href}`);
process.exitCode = scopes.some((scope) => totalOf(scope.findings) > 0) ? 1 : 0;
