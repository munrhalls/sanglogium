// The product create gate: new products enter Sanity only through here.
//
// Question: if these new products are added, do rules 1 to 5 (tools/product-rules.mjs) still hold for every published product?
// Answer: yes, and they are written, in one transaction. Or a refusal that lists every finding, and nothing is written.
//
// Create only. An input names no id, type or revision, so it cannot address an existing product: no product is read for change,
// replaced or patched, and no existing document's revision moves. That keeps checkout untouched (docs/adr/ADR-003-product-write-freeze.md).
// Editing existing products is closed until checkout provides its marker.
//
// Concurrent writes: rules 3 and 4 compare products with each other, so two writes can each pass alone and break a rule together.
// Every write reads a lock document and commits with its revision. If another write landed since, the commit is rejected and the run is repeated.
//
// Use, from the repo root. The file is a JSON list of product objects (checkout fields included: they are set once, at creation).
//   node --env-file=.env.local tools/create-product.mjs new-products.json           judge only
//   node --env-file=.env.local tools/create-product.mjs new-products.json --apply   judge, then write
// Exit 0 passed (and written, with --apply). Exit 1 refused. Exit 2 no verdict: it could not read or write, or the lock moved (run again).
//
// FLOW  createProducts: check the input -> read -> judge the whole set -> commit

import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { findings } from './product-rules.mjs';

export class Refused extends Error {
  constructor(lines) {
    super(lines[0]);
    this.lines = lines;
  }
}

// store.read()   -> { products: every published product, lock: { _rev } or null }, from one snapshot
// store.commit() -> creates the products and moves the lock in one transaction; throws if the lock is not the one that was read
export async function createProducts(store, inputs) {
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.some((x) => !x || typeof x !== 'object' || Array.isArray(x))) {
    throw new Refused(['the input must be a non-empty list of product objects']);
  }
  if (inputs.some((x) => Object.keys(x).some((k) => k.startsWith('_')))) {
    throw new Refused(['create only: an input names a key starting with "_" (an id, type or revision). The gate assigns them.']);
  }
  const news = inputs.map((x) => ({ _id: randomUUID(), _type: 'product', ...x }));
  const { products, lock } = await store.read();
  const lines = findings([...products, ...news]);
  if (lines.length) throw new Refused(lines);
  await store.commit({ lock, products: news });
  return news.map((x) => x._id);
}

const LOCK_ID = 'gate.productWrite';

function sanityStore(env) {
  const base = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data`;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  return {
    async read() {
      const query = `{ "products": *[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id), "lock": *[_id == "${LOCK_ID}"][0]{ _rev } }`;
      const res = await fetch(`${base}/query/${dataset}?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
      if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
      const { result } = await res.json();
      if (!Array.isArray(result?.products) || result.products.length === 0) throw new Error('read returned no products');
      return result;
    },
    async commit({ lock, products }) {
      const at = new Date().toISOString();
      const mutations = [
        lock ? { patch: { id: LOCK_ID, ifRevisionID: lock._rev, set: { at } } } : { create: { _id: LOCK_ID, _type: 'productGateLock', at } },
        ...products.map((p) => ({ create: p })),
      ];
      const res = await fetch(`${base}/mutate/${dataset}?visibility=sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutations }),
      });
      if (!res.ok) throw new Error(`rejected, nothing written: HTTP ${res.status} ${(await res.text()).slice(0, 300)}. Run again.`);
    },
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [file] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
    if (!file) throw new Error('usage: node --env-file=.env.local tools/create-product.mjs <products.json> [--apply]');
    const inputs = JSON.parse(readFileSync(file, 'utf8'));
    const real = sanityStore(process.env);
    const apply = process.argv.includes('--apply');
    const store = apply ? real : { read: real.read, commit: async () => {} };
    const ids = await createProducts(store, inputs);
    console.log(apply ? `created ${ids.length} products:\n${ids.join('\n')}` : `passed: ${ids.length} products would be created. Add --apply to write.`);
  } catch (e) {
    if (e instanceof Refused) {
      console.log(`REFUSED, nothing written:\n${e.lines.join('\n')}`);
      process.exitCode = 1;
    } else {
      console.error(`NO VERDICT: ${e.message}`);
      process.exitCode = 2;
    }
  }
}
