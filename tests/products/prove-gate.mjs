// Proof of the product create gate (tools/create-product.mjs). It only reports what is true; it decides nothing.
//
// Question: does the gate create products only, refuse every violation of rules 1 to 5, and land at most one of two writes that break a rule only together?
// Answer: yes or NO for each of 5 questions. Needs no network and no token: the gate runs against an in-memory store with Sanity's behaviour
//         (a transaction is all or nothing, the lock is a compare-and-set on its revision). Fake products, alien names, real format.
//
//   1. a planted violation of each rule 1 to 5 is refused, and the store is unchanged
//   2. a clean batch lands exactly as given; every product that was there is untouched
//   3. anything that names an id, type or revision is refused: the gate creates, it never edits
//   4. a batch with one bad product lands nothing
//   5. two writes that are each clean but break a rule together: exactly one lands
//
// A proof that cannot say no proves nothing, so first it runs 7 deliberately broken copies of the gate. Each must get at least one NO.
//
// Human-run, no network: node tests/products/prove-gate.mjs
// Exit 0 every answer yes. Exit 1 some answer NO. Exit 2 no verdict: the proof itself failed (a broken gate got no NO, or a crash).
//
// FLOW  broken gates -> ask the real gate -> report

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findings } from '../../tools/product-rules.mjs';

const GATE = fileURLToPath(new URL('../../tools/create-product.mjs', import.meta.url));
const RULES = pathToFileURL(fileURLToPath(new URL('../../tools/product-rules.mjs', import.meta.url))).href;

// The store: what the gate needs of Sanity, as a port. commit is one transaction, all or nothing.
// The lock is compared by revision: a commit made on a stale lock is rejected, like ifRevisionID.
function fakeStore(products, between = async () => {}) {
  const state = { products: structuredClone(products), lock: null, n: 0 };
  return {
    state,
    async read() {
      const seen = { products: structuredClone(state.products), lock: state.lock && { _rev: state.lock._rev } };
      await between();
      return seen;
    },
    async commit({ lock, products: made }) {
      if (Boolean(lock) !== Boolean(state.lock) || (lock && lock._rev !== state.lock._rev)) throw new Error('rejected: the lock moved');
      if (made.some((p) => state.products.some((q) => q._id === p._id))) throw new Error('rejected: id exists');
      state.lock = { _rev: `lock${++state.n}` };
      for (const p of made) state.products.push({ ...structuredClone(p), _rev: `new${++state.n}`, _createdAt: '2026-11-01T00:00:00Z', _updatedAt: '2026-11-01T00:00:00Z' });
    },
  };
}

const product = (n, over = {}) => ({
  _id: `base${n}`, _type: 'product', _rev: `b${n}`, _createdAt: '2026-01-01T00:00:00Z', _updatedAt: '2026-01-01T00:00:00Z',
  name: `Zorb Quux ${n}`, slug: { _type: 'slug', current: `zorb-quux-${n}` }, sku: `ZORB-${n}00`,
  price_data: { currency: 'usd', unit_amount: 1000 + n }, stock: 5, reservedStock: 0,
  parcel: { length: 6, width: 6, height: 3, weight: 20, distance_unit: 'cm', mass_unit: 'g' },
  filterAttributes: { zorbShape: 'quux', plomb: ['aa', 'bb'], flux: true },
  specifications: [{ _key: `s${n}`, title: 'Plomb', value: 'x' }],
  ...over,
});
// Product 3 has no plomb at all: a missing key is fine alone, and is what a planted null disagrees with.
const BASE = [product(1), product(2), product(3, { filterAttributes: { zorbShape: 'quux', flux: false } })];
const { _id, _type, _rev, _createdAt, _updatedAt, ...CLEAN } = product(9);
const withFilter = (change) => ({ ...CLEAN, filterAttributes: { ...CLEAN.filterAttributes, ...change } });

const refused = async (gate, inputs, rule) => {
  const store = fakeStore(BASE);
  const before = JSON.stringify(store.state);
  try {
    await gate.createProducts(store, inputs);
    return false;
  } catch (e) {
    return e instanceof gate.Refused && (!rule || e.lines.some((line) => line.startsWith(rule))) && JSON.stringify(store.state) === before;
  }
};

// The five questions, asked of one gate. Each returns yes (true) or NO (false).
async function ask(gate) {
  const q1 = [
    await refused(gate, [withFilter({ flux: 'true' })], 'one form'),
    await refused(gate, [withFilter({ plomb: null })], 'one way to say no value'),
    await refused(gate, [withFilter({ zorbShape: 'Quux' })], 'one spelling'),
    await refused(gate, [{ ...CLEAN, sku: 'zorb 100' }], 'repeated product'),
    await refused(gate, [withFilter({ plomb: ['aa', 'aa'] })], 'value twice'),
  ].every(Boolean);

  const store = fakeStore(BASE);
  const second = { ...CLEAN, name: 'Zorb Quux 10', slug: { _type: 'slug', current: 'zorb-quux-10' }, sku: 'ZORB-1000' };
  let ids = [];
  try {
    ids = await gate.createProducts(store, [CLEAN, second]);
  } catch {} // refusing clean products is the NO below
  const landed = store.state.products.filter((p) => ids.includes(p._id));
  const q2 =
    ids.length === 2 && landed.length === 2 && store.state.products.length === BASE.length + 2 &&
    JSON.stringify(store.state.products.slice(0, BASE.length)) === JSON.stringify(BASE) &&
    landed.every((p, i) => p._type === 'product' && JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => !k.startsWith('_')))) === JSON.stringify([CLEAN, second][i])) &&
    Boolean(store.state.lock);

  const q3 = [
    await refused(gate, [{ ...CLEAN, _id: 'base1' }]),
    await refused(gate, [{ ...CLEAN, _type: 'product' }]),
    await refused(gate, [{ ...CLEAN, _rev: 'x' }]),
    await refused(gate, [{ _id: 'base1', stock: 9 }]),
  ].every(Boolean);

  const q4 = await refused(gate, [CLEAN, withFilter({ zorbShape: 'Quux' })]);

  // Fixed order: write one reads, write two reads (so neither sees the other), write one commits in full, then write two commits.
  let reads = 0;
  let secondRead;
  let firstCommitted;
  const a = new Promise((resolve) => (secondRead = resolve));
  const b = new Promise((resolve) => (firstCommitted = resolve));
  const race = fakeStore(BASE, async () => {
    const mine = ++reads;
    if (mine === 1) await a;
    if (mine === 2) { secondRead(); await b; }
  });
  const one = { ...CLEAN, name: 'Zorb Quux 8', slug: { _type: 'slug', current: 'zorb-quux-8' }, sku: 'ZORB-800' };
  const two = { ...CLEAN, name: 'zorb quux 8', slug: { _type: 'slug', current: 'zorb-quux-80' }, sku: 'ZORB-8000' };
  const alone = (x) => findings([...BASE, { ...x, _id: 'n', _type: 'product' }]).length === 0;
  const results = await Promise.allSettled([gate.createProducts(race, [one]).finally(() => firstCommitted()), gate.createProducts(race, [two])]);
  const q5 = alone(one) && alone(two) && results.filter((r) => r.status === 'fulfilled').length === 1 && race.state.products.length === BASE.length + 1 && findings(race.state.products).length === 0;

  return [q1, q2, q3, q4, q5];
}

const QUESTIONS = [
  'a planted violation of each rule 1 to 5 is refused, store unchanged',
  'a clean batch lands exactly as given, existing products untouched',
  'anything naming an id, type or revision is refused: create only',
  'a batch with one bad product lands nothing',
  'two writes clean alone, breaking a rule together: exactly one lands',
];

// Broken copies of the gate: each changes one line, and must get a NO.
const BROKEN = [
  ['rules off', 'const lines = findings([...products, ...news]);', 'const lines = [];'],
  ['judges only the new products', 'const lines = findings([...products, ...news]);', 'const lines = findings(news);'],
  ['judges only the first new product', 'const lines = findings([...products, ...news]);', 'const lines = findings([...products, news[0]]);'],
  ['allows an id, type or revision', "if (inputs.some((x) => Object.keys(x).some((k) => k.startsWith('_'))))", 'if (false)'],
  ['commits on a fresh lock', 'await store.commit({ lock, products: news });', 'await store.commit({ lock: (await store.read()).lock, products: news });'],
  ['refuses everything', 'if (lines.length)', 'if (true)'],
  ['drops all but the first product', 'await store.commit({ lock, products: news });', 'await store.commit({ lock, products: news.slice(0, 1) });'],
];

async function brokenGates() {
  const source = readFileSync(GATE, 'utf8');
  const dir = mkdtempSync(path.join(tmpdir(), 'prove-gate-'));
  try {
    const out = [];
    for (const [i, [name, from, to]] of BROKEN.entries()) {
      if (!source.includes(from)) throw new Error(`broken copy "${name}": the line it breaks is not in the gate`);
      const file = path.join(dir, `broken${i}.mjs`);
      writeFileSync(file, source.replace(from, to).replace(/'\.\/product-rules\.mjs'/, `'${RULES}'`));
      out.push([name, await import(pathToFileURL(file).href)]);
    }
    return out;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

try {
  for (const [name, gate] of await brokenGates()) {
    if ((await ask(gate)).every(Boolean)) throw new Error(`the proof cannot say no: the gate that ${name} got only yes`);
  }
  console.log(`self-proof: each of ${BROKEN.length} broken gates gets at least one NO.\n`);
  const answers = await ask(await import(pathToFileURL(GATE).href));
  answers.forEach((yes, i) => console.log(`${i + 1}. ${QUESTIONS[i]}: ${yes ? 'yes' : 'NO'}`));
  const bad = answers.some((yes) => !yes);
  console.log(bad ? '\nRESULT: NO' : '\nRESULT: PASS');
  process.exitCode = bad ? 1 : 0;
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
