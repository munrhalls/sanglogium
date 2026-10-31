// Products integrity check: rules 4 to 7
//
// Question: in the published products, is anything repeated, held twice in a filter field, unread or misspelled?
// Answer: PASS or NO, every finding printed. It judges the text against itself, a dictionary and a list a person signed, never whether a value is true.
// Rules 1 to 3 (one form, one way to say no value, one spelling) are tests/products/check-products.mjs and need only the data.
//
// Four rules, numbered after those three. Each is a yes/no. PASS needs all four empty.
//   4. no two products share a name, sku or slug (case and punctuation ignored)
//   5. no filter field holds one value twice on one product
//   6. every filter field is signed in integrity-known.json: a person has read its name
//   7. every word is in the dictionary or signed in integrity-known.json
//
// Not judged, forced: a fact worded two ways outside the signed fields, a typo that is a real word ("form" for "from"), whether a value is true.
// Not judged, chosen: one value in two different fields, a display row or its label repeated (display rows are ordered and labelled, a repeat is how the page is laid out).
// Not read, chosen: overviewFields, numbers in words, system keys, ids, links, rich-text mechanics, sku and slug (rule 4), sourcing (assumed true).
// integrity-known.json is {"fields":[...],"words":[...]}, both sorted. Only the owner signs an entry; the check only reads it.
//
// Human-run, reads only. From the repo root:
//   node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-integrity.mjs
// Exit 0 = PASS. Exit 1 = NO, each finding is printed. Exit 2 = no verdict: it could not read, the self-proof failed or the dictionary changed.
//
// FLOW
//   1. selfProof  fake products          -> throws unless each rule says no where it must, and nothing on clean data, and the pin sees a changed dictionary
//   2. read       Sanity, dictionary, list -> every published product, the word set, the signed fields and words; throws if the dictionary differs from its pin
//   3. checks     the products           -> the findings of each rule
//   4. report     the findings           -> the screen text and the exit code

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const IDENTITY = ['name', 'sku', 'slug'];
const FILTER = 'filterAttributes';
const DICTIONARY = ['/usr/share/dict/american-english', '/usr/share/dict/british-english'];
const DICTIONARY_SHA256 = 'fd8c73ebc38400eb52677db62229e80ad811c10c0601e7804287ad20343064a8'; // of the two files, in this order, byte for byte
const SKIP = /^(_.*|sku|slug|url|href|sourcing|sourcedAt|catalogueLocationKeys|overviewFields|marks|style|listItem|level|markDefs)$/;
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const tokens = (s) => (s.replace(/’/g, "'").match(/\p{L}+(?:'\p{L}+)*/gu) || []).map((w) => w.toLowerCase().replace(/'s$/, '')).filter((w) => w.length > 1);
const short = (t) => JSON.stringify(t.length > 50 ? `${t.slice(0, 50)}…` : t);
const digest = (buffers) => buffers.reduce((h, b) => h.update(b), createHash('sha256')).digest('hex');
const dictionaryChanged = (buffers, pin) => digest(buffers) !== pin;

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

// Every value under filterAttributes, of any type: [path, value].
function filterLeaves(value, path = FILTER, out = []) {
  if (Array.isArray(value)) value.forEach((x) => filterLeaves(x, `${path}[]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, x] of Object.entries(value)) if (!SKIP.test(k)) filterLeaves(x, `${path}.${k}`, out);
  } else if (value !== null && value !== undefined && value !== '') out.push([path, value]);
  return out;
}

// RULE 4: no two products share a name, sku or slug
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

// RULE 5: no filter field holds one value twice on one product
// IN:  the products
// OUT: one finding per filter field and value that a product holds twice, with the number of products
// WHY: a filter field is a set, so a value written twice is the same fact written again. Display rows are ordered and labelled, where a repeat is layout. Two spellings of one value are rule 3 of check-products.
function twiceInField(products) {
  const out = new Map();
  for (const p of products) {
    const here = new Map();
    for (const [path, value] of filterLeaves(p[FILTER])) {
      const key = `${path}\t${JSON.stringify(value)}`;
      const at = here.get(key) ?? { path, value, n: 0 };
      at.n++;
      here.set(key, at);
    }
    for (const [key, at] of here) if (at.n > 1) out.set(key, { ...at, products: (out.get(key)?.products ?? 0) + 1 });
  }
  return [...out.values()].map(({ path, value, products: n }) => `${path}: ${short(String(value))}   (${n} products)`);
}

// RULE 6: every filter field is signed
// IN:  the products, the signed field names
// OUT: every filter field that a product holds and no person has signed
// WHY: two fields can hold one fact, and only a person who knows what they mean can say they do not. The person signs each name once, so a new field is a NO until it is read.
function unsignedFields(products, ref) {
  const all = new Set();
  for (const p of products) filterLeaves(p[FILTER]).forEach(([path]) => all.add(path));
  return [...all].filter((f) => !ref.known.fields.has(f)).sort();
}

// RULE 7: every word is in the dictionary or signed
// IN:  the products, the dictionary, the signed words
// OUT: every word in neither, rarest first
// WHY: "wirless" is in no dictionary. Brands and jargon are in none either, so a person signs them once.
function unknownWords(products, ref) {
  const n = new Map();
  for (const p of products) for (const [, text] of cells(p)) for (const w of tokens(text)) if (!ref.dict.has(w) && !ref.known.words.has(w)) n.set(w, (n.get(w) ?? 0) + 1);
  return [...n].sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1)).map(([w]) => w);
}

const CHECKS = [
  [4, 'repeated product', repeats, '\n'],
  [5, 'value twice in one filter field', twiceInField, '\n'],
  [6, 'unsigned filter field', unsignedFields, '\n'],
  [7, 'unknown word', unknownWords, ' '],
];

// STEP 1: selfProof
// IN:  fake products with alien names, a tiny dictionary, one signed field and one signed word
// OUT: throws unless a rule says yes to its planted defect, every rule says no to clean data, and the pin sees a changed dictionary
// WHY: a check that cannot say no proves nothing. One defect per rule, a second for rule 5 (a number) and rule 4, and clean data that holds what is not judged: an overviewFields word, a display row title in two spellings, a display row twice, one value in two fields, one filter value in two spellings.
function selfProof() {
  const ref = { dict: new Set(['wireless', 'headphones', 'zed', 'one', 'two', 'same', 'ploof', 'weight']), known: { words: new Set(['quuxo']), fields: new Set(['filterAttributes.zing', 'filterAttributes.tags[]']) } };
  const clean = [
    { name: 'Zed One', sku: 'Q1', t: 'wireless headphones quuxo same', filterAttributes: { zing: 'Ploof', tags: ['one', 'two'] }, specifications: [{ title: 'Weight', value: 'same' }, { title: 'Weight', value: 'same' }], overviewFields: [{ title: 'Zorp', value: 'blorbx' }] },
    { name: 'Zed Two', sku: 'Q2', t: 'wireless', filterAttributes: { zing: 'ploof', tags: ['one'] }, specifications: [{ title: 'Weight:', value: 'same' }] },
  ];
  const cases = [
    [0, [{ name: 'Zed One', sku: 'Q1' }, { name: 'Zed Two', sku: 'q-1' }], 'two products, one sku'],
    [0, [{ name: 'Zed One' }, { name: 'zed-one' }], 'two products, one name'],
    [1, [{ filterAttributes: { tags: ['blorp', 'blorp'] } }], 'one value twice in one filter field'],
    [1, [{ filterAttributes: { lens: [2, 2] } }], 'one number twice in one filter field'],
    [2, [{ filterAttributes: { vexo: 'ploof' } }], 'a filter field nobody signed'],
    [3, [{ t: 'wirless headphones' }], 'a word in no dictionary'],
  ];
  for (const [i, products, what] of cases) if (!CHECKS[i][2](products, ref).length) throw new Error(`self-proof failed: rule ${CHECKS[i][0]} missed ${what}`);
  CHECKS.forEach(([n, , run]) => { if (run(clean, ref).length) throw new Error(`self-proof failed: rule ${n} flagged clean data`); });
  const pin = digest([Buffer.from('alpha\n'), Buffer.from('beta\n')]);
  if (dictionaryChanged([Buffer.from('alpha\n'), Buffer.from('beta\n')], pin)) throw new Error('self-proof failed: the pin flagged an unchanged dictionary');
  if (!dictionaryChanged([Buffer.from('alpha\n'), Buffer.from('betz\n')], pin)) throw new Error('self-proof failed: the pin missed a changed dictionary');
}

// STEP 2: read
// IN:  the Sanity project, dataset and read token from .env.local; the two /usr/share/dict files; integrity-known.json beside this file
// OUT: every published product document whole, and ref = { dict, known }
// WHY: one request is one snapshot. api.sanity.io, not the CDN, so nothing is stale. Drafts and release versions are not published.
//      Zero products, a changed dictionary or a missing list is no verdict: an empty or different reference would flag or pass what it should not.
async function read() {
  const env = process.env;
  const query = '*[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]';
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { result } = await res.json();
  if (!Array.isArray(result) || result.length === 0) throw new Error('read returned no products');
  const files = DICTIONARY.map((f) => readFileSync(f));
  if (dictionaryChanged(files, DICTIONARY_SHA256)) throw new Error('dictionary changed');
  const dict = new Set();
  for (const file of files) for (const line of file.toString('utf8').split('\n')) dict.add(line.toLowerCase().replace(/'s$/, ''));
  const known = JSON.parse(readFileSync(new URL('./integrity-known.json', import.meta.url), 'utf8'));
  return { products: result, ref: { dict, known: { words: new Set(known.words.map((w) => w.toLowerCase())), fields: new Set(known.fields) } } };
}

// STEP 4: report
// IN:  the products and the findings of each rule
// OUT: the screen text, and the exit code: 0 PASS, 1 NO
function report(products, found) {
  console.log(`${products.length} published products\n`);
  CHECKS.forEach(([n, name, , sep], i) => {
    console.log(`${n}. ${name}: ${found[i].length}`);
    if (found[i].length) console.log(found[i].join(sep));
    console.log('');
  });
  const bad = found.some((f) => f.length);
  console.log(bad ? 'RESULT: NO' : 'RESULT: PASS');
  return bad ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: each rule says no where it must, nothing on clean data, and the pin sees a changed dictionary.\n');
  const { products, ref } = await read();
  process.exitCode = report(products, CHECKS.map(([, , run]) => run(products, ref))); // STEP 3 is the map
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
