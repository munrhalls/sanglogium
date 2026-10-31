// Products structural orderliness check
//
// Question: in the published products, is anything repeated, held twice, spelled two ways or misspelled?
// Answer: PASS or NO, every finding printed. It judges the text against itself and a dictionary, never whether a value is true.
//
// Four questions, in this order. Each is a yes/no. PASS needs all four empty.
//   1. repeated product      two products share a name, sku or slug (case and punctuation ignored)
//   2. unread filter field   a filter field name is not in integrity-known.json: no person has read it yet
//   3. value stored twice    a filter field holds "Focal Utopia" on one product and "FOCAL Utopia" on another, or holds one value twice on one product
//   4. unknown word          a word is in no dictionary and not in integrity-known.json
//
// Not judged, forced: a fact worded two ways, a typo that is a real word ("form" for "from").
// Not judged, chosen: one value in two different fields, a display row title in two spellings ("Weight" / "Weight:"), a display row or its group label repeated. Filter fields are sets, where a repeat is a duplicate. Display rows are ordered and labelled, where a repeat is how the page is laid out.
// Not read, chosen: overviewFields, numbers, system keys, ids, links, rich-text mechanics, sku and slug (question 1), sourcing (assumed true).
// integrity-known.json holds the filter field names and the words a person has read and accepted. The check only reads it.
//
// Human-run, reads only. From the repo root:
//   node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-integrity.mjs
// Exit 0 = PASS. Exit 1 = NO, each finding is printed. Exit 2 = no verdict: it could not read, or the self-proof failed.
//
// FLOW
//   1. selfProof  fake products          -> throws unless each question says no where it must, and nothing on clean data
//   2. read       Sanity, dictionary, list -> every published product, the word set, the signed fields and accepted words
//   3. checks     the products           -> the findings of each question
//   4. report     the findings           -> the screen text and the exit code

import { readFileSync } from 'node:fs';

const IDENTITY = ['name', 'sku', 'slug'];
const FILTER = 'filterAttributes';
const SKIP = /^(_.*|sku|slug|url|href|sourcing|sourcedAt|catalogueLocationKeys|overviewFields|marks|style|listItem|level|markDefs)$/;
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const tokens = (s) => (s.replace(/’/g, "'").match(/\p{L}+(?:'\p{L}+)*/gu) || []).map((w) => w.toLowerCase().replace(/'s$/, '')).filter((w) => w.length > 1);
const short = (t) => JSON.stringify(t.length > 50 ? `${t.slice(0, 50)}…` : t);

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

// The field names under filterAttributes that a value of any type sits on.
function filterPaths(value, path = FILTER, out = new Set()) {
  if (Array.isArray(value)) value.forEach((x) => filterPaths(x, `${path}[]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, x] of Object.entries(value)) if (!SKIP.test(k)) filterPaths(x, `${path}.${k}`, out);
  } else if (value !== null && value !== undefined && value !== '') out.add(path);
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

// CHECK 2: unread filter field
// IN:  the products, the signed field names
// OUT: every filter field that a product holds and no person has signed
// WHY: two fields can hold one fact, and only a person who knows what they mean can say they do not. The person signs each name once, so a new field is a NO until it is read.
function unreadFields(products, ref) {
  const all = new Set();
  for (const p of products) filterPaths(p[FILTER]).forEach((f) => all.add(f));
  return [...all].filter((f) => !ref.known.fields.has(f)).sort();
}

// CHECK 3: value stored twice
// IN:  the products
// OUT: one finding per filter field with one value in two spellings, and per filter field and value held twice on one product
// WHY: "Focal Utopia" and "FOCAL Utopia" in one filter are one fact stored twice. A value twice in a set is the same fact written again.
function storedTwice(products) {
  const spelled = new Map();
  const doubled = new Map();
  for (const p of products) {
    const here = new Map();
    for (const [path, text] of cells(p)) {
      if (!path.startsWith(FILTER)) continue;
      const key = `${path}\t${norm(text)}`;
      const at = here.get(key) ?? { path, text, n: 0 };
      at.n++;
      here.set(key, at);
      const s = spelled.get(key) ?? { path, forms: new Set() };
      s.forms.add(text);
      spelled.set(key, s);
    }
    for (const [key, at] of here) if (at.n > 1) doubled.set(key, { ...at, products: (doubled.get(key)?.products ?? 0) + 1 });
  }
  const out = [];
  for (const { path, forms } of spelled.values()) if (forms.size > 1) out.push(`spelled twice, ${path}: ${[...forms].map(short).join(' / ')}`);
  for (const { path, text, products: n } of doubled.values()) out.push(`twice in one field, ${path}: ${short(text)}   (${n} products)`);
  return out;
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
  ['unread filter field', unreadFields, '\n'],
  ['value stored twice', storedTwice, '\n'],
  ['unknown word', unknownWords, ' '],
];

// STEP 1: selfProof
// IN:  fake products with alien names, a tiny dictionary, two signed fields and one accepted word
// OUT: throws unless a check says yes to its planted defect, and every check says no to clean data
// WHY: a check that cannot say no proves nothing. One defect per question, a second for question 3, and clean data that holds what is not judged: an overviewFields word, a display row title in two spellings, a display row twice, one value in two fields.
function selfProof() {
  const ref = { dict: new Set(['wireless', 'headphones', 'zed', 'one', 'two', 'same', 'ploof', 'weight']), known: { words: new Set(['quuxo']), fields: new Set(['filterAttributes.zing', 'filterAttributes.tags[]']) } };
  const clean = [
    { name: 'Zed One', sku: 'Q1', t: 'wireless headphones quuxo same', filterAttributes: { zing: 'Ploof', tags: ['one', 'two'] }, specifications: [{ title: 'Weight', value: 'same' }, { title: 'Weight', value: 'same' }], overviewFields: [{ title: 'Zorp', value: 'blorbx' }] },
    { name: 'Zed Two', sku: 'Q2', t: 'wireless', filterAttributes: { zing: 'Ploof', tags: ['one'] }, specifications: [{ title: 'Weight:', value: 'same' }] },
  ];
  const cases = [
    [0, [{ name: 'Zed One', sku: 'Q1' }, { name: 'Zed Two', sku: 'q-1' }], 'two products, one sku'],
    [0, [{ name: 'Zed One' }, { name: 'zed-one' }], 'two products, one name'],
    [1, [{ filterAttributes: { vexo: 'ploof' } }], 'a filter field nobody signed'],
    [2, [{ filterAttributes: { zing: 'Quux Plomb' } }, { filterAttributes: { zing: 'quux-plomb' } }], 'one filter field, two spellings'],
    [2, [{ filterAttributes: { tags: ['blorp', 'Blorp'] } }], 'one value twice in one filter field'],
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
  return { products: result, ref: { dict, known: { words: new Set(known.words.map((w) => w.toLowerCase())), fields: new Set(known.fields) } } };
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
