// Products integrity check
//
// Question: in the published products, is anything repeated, spelled two ways or misspelled?
// Answer: PASS or NO, every finding printed. It judges the text against itself and a dictionary, never whether a value is true.
//
// Four checks, in this order. Each is a yes/no. PASS needs all four empty.
//   1. repeated product      two products share a name, sku or slug (case and punctuation ignored)
//   2. value spelled twice   one field holds "Focal Utopia" on one product and "FOCAL Utopia" on another
//   3. same value twice      one product holds the same value in two fields, or twice in one field
//   4. unknown word          a word is in no dictionary and not in integrity-known.json
//
// Not judged, forced: a fact worded two ways, a typo that is a real word ("form" for "from"). Chosen: numbers.
// Not read: system keys, ids, links, rich-text mechanics, sku and slug (check 1), sourcing (assumed true).
// integrity-known.json holds the words and field pairs a person has read and accepted. The check only reads it.
//
// Human-run, reads only. From the repo root:
//   node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-integrity.mjs
// Exit 0 = PASS. Exit 1 = NO, each finding is printed. Exit 2 = no verdict: it could not read, or the self-proof failed.
//
// FLOW
//   1. selfProof  fake products          -> throws unless each check says no where it must, and nothing on clean data
//   2. read       Sanity, dictionary, list -> every published product, the word set, the accepted words and pairs
//   3. checks     the products           -> the findings of each check
//   4. report     the findings           -> the screen text and the exit code

import { readFileSync } from 'node:fs';

const IDENTITY = ['name', 'sku', 'slug'];
const SKIP = /^(_.*|sku|slug|url|href|sourcing|sourcedAt|catalogueLocationKeys|marks|style|listItem|level|markDefs)$/;
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const tokens = (s) => (s.replace(/’/g, "'").match(/\p{L}+(?:'\p{L}+)*/gu) || []).map((w) => w.toLowerCase().replace(/'s$/, '')).filter((w) => w.length > 1);

// The text cells of a product: [path, text]. An array step is []. A row with a title and a value is keyed by its title: specifications[Impedance].value
function cells(value, path = '', out = []) {
  if (Array.isArray(value)) value.forEach((x) => cells(x, `${path}[]`, out));
  else if (value && typeof value === 'object') {
    const row = typeof value.title === 'string' && 'value' in value ? `[${value.title}]` : '';
    for (const [k, x] of Object.entries(value)) {
      if (SKIP.test(k)) continue;
      const base = k === 'value' ? path + row : path;
      cells(x, base ? `${base}.${k}` : k, out);
    }
  } else if (typeof value === 'string' && norm(value).length > 1) out.push([path, value]);
  return out;
}

// CHECK 1: repeated product
// IN:  the products
// OUT: one finding per name, sku or slug held by more than one product
// WHY: a customer or an order line cannot tell two products with one identity apart
function repeats(products) {
  const out = [];
  for (const key of IDENTITY) {
    const by = new Map();
    for (const p of products) {
      const text = key === 'slug' ? p.slug?.current : p[key];
      if (typeof text !== 'string' || !norm(text)) continue;
      const at = by.get(norm(text)) ?? { text, names: [] };
      at.names.push(p.name);
      by.set(norm(text), at);
    }
    for (const { text, names } of by.values()) if (names.length > 1) out.push(`${key} ${text}: ${names.join(' | ')}`);
  }
  return out;
}

// CHECK 2: value spelled twice
// IN:  the products
// OUT: one finding per field that holds two spellings of one value
// WHY: if "Focal Utopia" and "FOCAL Utopia" are both stored, one fact is stored twice. Names are check 1.
function twins(products) {
  const seen = new Map();
  for (const p of products) for (const [path, text] of cells(p)) {
    if (path === 'name') continue;
    const m = seen.get(path) ?? new Map();
    m.set(norm(text), (m.get(norm(text)) ?? new Set()).add(text));
    seen.set(path, m);
  }
  return [...seen].flatMap(([path, m]) => [...m.values()].filter((s) => s.size > 1).map((s) => `${path}: ${[...s].map((t) => JSON.stringify(t)).join(' / ')}`));
}

// CHECK 3: same value twice
// IN:  the products, the accepted pairs
// OUT: one finding per pair of fields that hold one value on a product, or the same field twice. The pair is the text before the three spaces.
// WHY: two fields with one value may be one fact stored twice. Only a person can say they are not, so a person accepts the pair once.
function sameValue(products, ref) {
  const seen = new Map();
  for (const p of products) {
    const by = new Map();
    for (const [path, text] of cells(p)) by.set(norm(text), [...(by.get(norm(text)) ?? []), path]);
    const pairs = new Map();
    for (const [value, paths] of by) {
      paths.sort();
      for (let i = 0; i < paths.length; i++) for (let j = i + 1; j < paths.length; j++) pairs.set(`${paths[i]}  <>  ${paths[j]}`, value);
    }
    for (const [pair, value] of pairs) seen.set(pair, { n: (seen.get(pair)?.n ?? 0) + 1, value });
  }
  return [...seen].filter(([pair]) => !ref.known.pairs.has(pair)).sort((a, b) => b[1].n - a[1].n).map(([pair, { n, value }]) => `${pair}   (${n} products, e.g. ${value.slice(0, 40)})`);
}

// CHECK 4: unknown word
// IN:  the products, the dictionary, the accepted words
// OUT: every word in neither, rarest first
// WHY: "wirless" is in no dictionary. Brands and jargon are in none either, so a person accepts them once.
function unknownWords(products, ref) {
  const n = new Map();
  for (const p of products) for (const [, text] of cells(p)) for (const w of tokens(text)) if (!ref.dict.has(w) && !ref.known.words.has(w)) n.set(w, (n.get(w) ?? 0) + 1);
  return [...n].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1)).map(([w]) => w);
}

const CHECKS = [
  ['repeated product', repeats, '\n'],
  ['value spelled twice', twins, '\n'],
  ['same value twice', sameValue, '\n'],
  ['unknown word', unknownWords, ' '],
];

// STEP 1: selfProof
// IN:  fake products with alien names, a tiny dictionary, one accepted word and one accepted pair
// OUT: throws unless a check says yes to its planted defect, and every check says no to clean data
// WHY: a check that cannot say no proves nothing. One defect per check, a second for check 1 and check 3, and clean data that holds an accepted word and an accepted pair.
function selfProof() {
  const ref = { dict: new Set(['wireless', 'headphones', 'zed', 'one', 'two', 'same', 'ploof']), known: { words: new Set(['quuxo']), pairs: new Set(['kappa  <>  omega']) } };
  const clean = [
    { name: 'Zed One', sku: 'Q1', t: 'wireless headphones quuxo', kappa: 'ploof', omega: 'ploof', zorb: 'same' },
    { name: 'Zed Two', sku: 'Q2', t: 'wireless', zorb: 'same' },
  ];
  const cases = [
    [0, [{ name: 'Zed One', sku: 'Q1' }, { name: 'Zed Two', sku: 'q-1' }], 'two products, one sku'],
    [0, [{ name: 'Zed One' }, { name: 'zed-one' }], 'two products, one name'],
    [1, [{ zorb: 'Quux Plomb' }, { zorb: 'quux-plomb' }], 'one field, two spellings'],
    [2, [{ vexo: 'blorp', wix: 'Blorp' }], 'one value in two fields'],
    [2, [{ vexo: ['blorp', 'blorp'] }], 'one value twice in one field'],
    [3, [{ t: 'wirless headphones' }], 'a word in no dictionary'],
  ];
  for (const [i, products, what] of cases) if (!CHECKS[i][1](products, ref).length) throw new Error(`self-proof failed: check ${i + 1} missed ${what}`);
  CHECKS.forEach(([, run], i) => { if (run(clean, ref).length) throw new Error(`self-proof failed: check ${i + 1} flagged clean data`); });
}

// STEP 2: read
// IN:  the Sanity project, dataset and read token from .env.local; /usr/share/dict; integrity-known.json beside this file
// OUT: every published product document whole, and ref = { dict, known }
// WHY: one request is one snapshot. api.sanity.io, not the CDN, so nothing is stale. Drafts and release versions are not published.
//      Zero products, or a missing dictionary or list, is no verdict: an empty reference would flag or pass everything.
async function read() {
  const env = process.env;
  const query = '*[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]';
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { result } = await res.json();
  if (!Array.isArray(result) || result.length === 0) throw new Error('read returned no products');
  const dict = new Set();
  for (const f of ['american-english', 'british-english']) for (const line of readFileSync(`/usr/share/dict/${f}`, 'utf8').split('\n')) dict.add(line.toLowerCase().replace(/'s$/, ''));
  const known = JSON.parse(readFileSync(new URL('./integrity-known.json', import.meta.url), 'utf8'));
  return { products: result, ref: { dict, known: { words: new Set(known.words.map((w) => w.toLowerCase())), pairs: new Set(known.pairs) } } };
}

// STEP 4: report
// IN:  the products and the findings of each check
// OUT: the screen text, and the exit code: 0 PASS, 1 NO
function report(products, found) {
  console.log(`${products.length} published products\n`);
  CHECKS.forEach(([name, , sep], i) => {
    console.log(`${i + 1}. ${name}: ${found[i].length}`);
    if (found[i].length) console.log(found[i].join(sep));
    console.log('');
  });
  const bad = found.some((f) => f.length);
  console.log(bad ? 'RESULT: NO' : 'RESULT: PASS');
  return bad ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: each check says no where it must, and nothing on clean data.\n');
  const { products, ref } = await read();
  process.exitCode = report(products, CHECKS.map(([, run]) => run(products, ref))); // STEP 3 is the map
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
