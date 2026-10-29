// Checks that every product holds the value at each path of a non-primitive
// field in the same form. Human-run, reads only.
// Phase 1: node --experimental-strip-types --import ./tools/alias-loader.mjs tests/products/nonPrimitiveFormConsistency.test.ts

import { deepStrictEqual } from 'node:assert';
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
type Entry = { id: string; at: string };
type Odd = Entry & { form: string };
type Result = { path: string; reference: string | null; holders: number; inconsistencies: Odd[]; missing: Entry[] | null; empty: Entry[] };

function formOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

// Which keys the schema gives each container path; list members share one Set.
const SCHEMA_CHILDREN: Map<string, Set<string>> = new Map();
function collect(fields: any[], path: string): void {
  let keys = SCHEMA_CHILDREN.get(path);
  if (!keys) {
    keys = new Set();
    SCHEMA_CHILDREN.set(path, keys);
  }
  for (const f of fields) {
    if (path === '' && f.name === 'filterAttributes') continue;
    keys.add(f.name);
    const childPath = path === '' ? f.name : path + '.' + f.name;
    if (Array.isArray(f.fields)) collect(f.fields, childPath);
    if (Array.isArray(f.of)) {
      for (const m of f.of) {
        if (Array.isArray(m.fields)) collect(m.fields, childPath + '[]');
      }
    }
  }
}
collect((productType as any).fields, '');

const DEFINED: Set<string> = new Set();
for (const [container, keys] of SCHEMA_CHILDREN) {
  for (const k of keys) {
    DEFINED.add(container === '' ? k : container + '.' + k);
  }
}

function scan(products: Product[]): Result[] {
  const sorted = [...products].sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0));
  const slots: Map<string, Result> = new Map();
  const slot = (path: string): Result => {
    let r = slots.get(path);
    if (!r) {
      r = { path, reference: null, holders: 0, inconsistencies: [], missing: [], empty: [] };
      slots.set(path, r);
    }
    return r;
  };

  const visit = (value: unknown, path: string, id: string, at: string): void => {
    const form = formOf(value);
    const r = slot(path);
    r.holders += 1;
    if (r.reference === null) r.reference = form;
    else if (form !== r.reference) r.inconsistencies.push({ id, at, form });
    if (form === 'array') {
      const list = value as unknown[];
      if (list.length === 0) r.empty.push({ id, at });
      for (let i = 0; i < list.length; i++) {
        visit(list[i], path + '[]', id, at + '[' + i + ']');
      }
    } else if (form === 'object') {
      const obj = value as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        if (key.startsWith('_')) continue;
        visit(obj[key], path + '.' + key, id, at + '.' + key);
      }
      const children = SCHEMA_CHILDREN.get(path);
      if (children) {
        for (const k of children) {
          if (!Object.hasOwn(obj, k)) slot(path + '.' + k).missing!.push({ id, at: at + '.' + k });
        }
      }
    }
  };

  const primitiveHeld = new Set<string>();
  for (const product of sorted) {
    for (const key of Object.keys(product)) {
      if (key.startsWith('_') || key === 'filterAttributes') continue;
      visit(product[key], key, product._id, key);
      const form = formOf(product[key]);
      if (form === 'string' || form === 'number' || form === 'boolean') primitiveHeld.add(key);
    }
    const top = SCHEMA_CHILDREN.get('');
    if (top) {
      for (const k of top) {
        if (!Object.hasOwn(product, k)) slot(k).missing!.push({ id: product._id, at: k });
      }
    }
  }

  // Scope: a top-level field counts only if some product holds it non-primitive.
  const kept: Result[] = [];
  for (const r of slots.values()) {
    const topField = r.path.split(/[.[]/, 1)[0];
    if (slot(topField).holders === 0 || primitiveHeld.has(topField)) continue;
    if (!DEFINED.has(r.path)) r.missing = null;
    kept.push(r);
  }
  kept.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return kept;
}

const fake: Product[] = [
  { _id: 'p3', _rev: 'v3', price_data: [1, 2], overviewFields: [] },
  {
    _id: 'p1', _rev: 'v1',
    price_data: { currency: 'zz', unit_amount: 5 },
    overviewFields: [{ _key: 'k1', title: 'aa', value: 'bb' }, { _key: 'k2', title: 'dd', value: 9 }],
    gallery: [], dial: { knob: 1 }, stock: 3, filterAttributes: { tone: ['x'] },
  },
  { _id: 'p5', _rev: 'v5' },
  {
    _id: 'p2', _rev: 'v2',
    price_data: { currency: 7, unit_amount: 6 },
    overviewFields: ['plain', { _key: 'k3', title: 'ff', value: 'gg' }],
    gallery: [{ _key: 'g1' }, 'oops'], dial: { knob: 'two' }, stock: [1],
  },
  { _id: 'p4', _rev: 'v4', price_data: null, dial: {} },
];

const expected: Result[] = [
  { path: 'dial', reference: 'object', holders: 3, inconsistencies: [], missing: null, empty: [] },
  { path: 'dial.knob', reference: 'number', holders: 2, inconsistencies: [{ id: 'p2', at: 'dial.knob', form: 'string' }], missing: null, empty: [] },
  { path: 'gallery', reference: 'array', holders: 2, inconsistencies: [], missing: [{ id: 'p3', at: 'gallery' }, { id: 'p4', at: 'gallery' }, { id: 'p5', at: 'gallery' }], empty: [{ id: 'p1', at: 'gallery' }] },
  { path: 'gallery[]', reference: 'object', holders: 2, inconsistencies: [{ id: 'p2', at: 'gallery[1]', form: 'string' }], missing: null, empty: [] },
  { path: 'overviewFields', reference: 'array', holders: 3, inconsistencies: [], missing: [{ id: 'p4', at: 'overviewFields' }, { id: 'p5', at: 'overviewFields' }], empty: [{ id: 'p3', at: 'overviewFields' }] },
  { path: 'overviewFields[]', reference: 'object', holders: 4, inconsistencies: [{ id: 'p2', at: 'overviewFields[0]', form: 'string' }], missing: null, empty: [] },
  { path: 'overviewFields[].information', reference: null, holders: 0, inconsistencies: [], missing: [{ id: 'p1', at: 'overviewFields[0].information' }, { id: 'p1', at: 'overviewFields[1].information' }, { id: 'p2', at: 'overviewFields[1].information' }], empty: [] },
  { path: 'overviewFields[].title', reference: 'string', holders: 3, inconsistencies: [], missing: [], empty: [] },
  { path: 'overviewFields[].value', reference: 'string', holders: 3, inconsistencies: [{ id: 'p1', at: 'overviewFields[1].value', form: 'number' }], missing: [], empty: [] },
  { path: 'price_data', reference: 'object', holders: 4, inconsistencies: [{ id: 'p3', at: 'price_data', form: 'array' }, { id: 'p4', at: 'price_data', form: 'null' }], missing: [{ id: 'p5', at: 'price_data' }], empty: [] },
  { path: 'price_data.currency', reference: 'string', holders: 2, inconsistencies: [{ id: 'p2', at: 'price_data.currency', form: 'number' }], missing: [], empty: [] },
  { path: 'price_data.unit_amount', reference: 'number', holders: 2, inconsistencies: [], missing: [], empty: [] },
  { path: 'price_data[]', reference: 'number', holders: 2, inconsistencies: [], missing: null, empty: [] },
];

deepStrictEqual(scan(fake), expected);
console.log('proof on fake products: passed');
