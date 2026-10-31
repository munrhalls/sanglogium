// Products integrity check: rules 4 and 5
//
// Question: in the published products, is a product repeated, or a value held twice in a filter field?
// Answer: PASS or NO, every finding printed. It needs only the data, like check-products.mjs (rules 1 to 3).
//
// Two rules, numbered after those three. Each is a yes/no. PASS needs both empty.
//   4. no two products share a name, sku or slug (case and punctuation ignored)
//   5. no filter field holds one value twice on one product
//
// Not judged, forced: a fact worded two ways, a typo ("wirless"), whether a value is true. Each needs a reference for what was meant, and none exists in the data.
// Not read, chosen: overviewFields, filterAttributes.sourcing, system keys, ids, links, sku and slug (rule 4 reads them), rich-text mechanics.
//
// Human-run, reads only. From the repo root:
//   node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-integrity.mjs
// Exit 0 = PASS. Exit 1 = NO, each finding is printed. Exit 2 = no verdict: it could not read, or the self-proof failed.
//
// FLOW
//   1. selfProof  fake products -> throws unless each rule says no where it must, and nothing on clean data
//   2. read       Sanity        -> every published product
//   3. checks     the products  -> the findings of each rule
//   4. report     the findings  -> the screen text and the exit code

const IDENTITY = ['name', 'sku', 'slug'];
const FILTER = 'filterAttributes';
const SKIP = /^(_.*|sku|slug|url|href|sourcing|sourcedAt|catalogueLocationKeys|overviewFields|marks|style|listItem|level|markDefs)$/;
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const short = (t) => JSON.stringify(t.length > 50 ? `${t.slice(0, 50)}…` : t);

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

const CHECKS = [
  ['repeated product', repeats],
  ['value twice in one filter field', twiceInField],
];

// STEP 1: selfProof
// IN:  fake products with alien names
// OUT: throws unless a rule says yes to its planted defect, and every rule says no to clean data
// WHY: a check that cannot say no proves nothing. Two defects for rule 4, one for rule 5, and clean data that holds what is not judged: a sourcing quote twice, a display row twice, one value in two fields.
function selfProof() {
  const clean = [
    { name: 'Zed One', sku: 'Q1', filterAttributes: { tags: ['one', 'two'], zing: 'same', sourcing: [{ quote: 'same' }, { quote: 'same' }] }, specifications: [{ title: 'Weight', value: 'same' }, { title: 'Weight', value: 'same' }] },
    { name: 'Zed Two', sku: 'Q2', filterAttributes: { tags: ['one'], zing: 'same' } },
  ];
  const cases = [
    [0, [{ name: 'Zed One', sku: 'Q1' }, { name: 'Zed Two', sku: 'q-1' }], 'two products, one sku'],
    [0, [{ name: 'Zed One' }, { name: 'zed-one' }], 'two products, one name'],
    [1, [{ filterAttributes: { tags: ['blorp', 'blorp'] } }], 'one value twice in one filter field'],
  ];
  for (const [i, products, what] of cases) if (!CHECKS[i][1](products).length) throw new Error(`self-proof failed: rule ${i + 4} missed ${what}`);
  CHECKS.forEach(([, run], i) => { if (run(clean).length) throw new Error(`self-proof failed: rule ${i + 4} flagged clean data`); });
}

// STEP 2: read
// IN:  the Sanity project, dataset and read token from .env.local
// OUT: every published product document, whole
// WHY: one request is one snapshot. api.sanity.io, not the CDN, so nothing is stale. Drafts and release versions are not published.
//      Zero products is no verdict: a wrong dataset would pass.
async function read() {
  const env = process.env;
  const query = '*[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]';
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { result } = await res.json();
  if (!Array.isArray(result) || result.length === 0) throw new Error('read returned no products');
  return result;
}

// STEP 4: report
// IN:  the products and the findings of each rule
// OUT: the screen text, and the exit code: 0 PASS, 1 NO
function report(products, found) {
  console.log(`${products.length} published products\n`);
  CHECKS.forEach(([name], i) => {
    console.log(`${i + 4}. ${name}: ${found[i].length}`);
    if (found[i].length) console.log(found[i].join('\n'));
    console.log('');
  });
  const bad = found.some((f) => f.length);
  console.log(bad ? 'RESULT: NO' : 'RESULT: PASS');
  return bad ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: each rule says no where it must, and nothing on clean data.\n');
  const products = await read();
  process.exitCode = report(products, CHECKS.map(([, run]) => run(products))); // STEP 3 is the map
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
