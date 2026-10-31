// Products consistency check
//
// Question: in every published product, does each path hold one form?
// Answer: PASS or NO. It judges whether products agree with each other, never whether a value is true.
//
// Form: string, number, boolean, array or object. null is no value and has no form.
// An array is a form; its items are judged at path[].
// Path: the keys from the document down, for example filterAttributes.freqResponseHz.min. No key is excluded.
// Not judged: a fact kept under two keys or two spellings. Only a declared list of facts could tell.
//
// Human-run, reads only. From the repo root:
//   node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-products.mjs
// Exit 0 = PASS. Exit 1 = NO, each path in more than one form is printed. Exit 2 = no verdict: it could not read, or the self-proof failed.
//
// FLOW
//   1. selfProof  fake products     -> throws unless conflicts() says no where it must
//   2. read       the Sanity dataset -> every published product, whole
//   3. conflicts  the products      -> the paths held in more than one form
//   4. report     the conflicts     -> the screen text and the exit code

// STEP 1: selfProof
// IN:  fake products with alien names, so no real path can match
// OUT: throws unless conflicts() says no at each place a conflict can sit, and says yes to null against a value
// WHY: a check that cannot say no proves nothing. A conflict can sit at the top, inside an object or inside an array: one case each.
function selfProof() {
  // product 1, product 2, the conflicting paths wanted ('' = none)
  const cases = [
    [{ zorb: 7 }, { zorb: '7' }, '["zorb"]'],
    [{ zorb: { quux: 7 } }, { zorb: { quux: '7' } }, '["zorb","quux"]'],
    [{ zorb: [7] }, { zorb: ['7'] }, '["zorb",null]'],
    [{ zorb: null }, { zorb: 7 }, ''],
  ];
  for (const [a, b, want] of cases) {
    const got = conflicts([{ name: 'p1', ...a }, { name: 'p2', ...b }]).map(([path]) => path).join();
    if (got !== want) throw new Error(`self-proof failed on ${JSON.stringify(a)} against ${JSON.stringify(b)}: wanted [${want}], got [${got}]`);
  }
}

// STEP 2: read
// IN:  the Sanity project, dataset and read token from .env.local
// OUT: every published product document, whole
// WHY: one request is one snapshot, so no write can land between two reads. No projection, so nothing is reshaped.
//      api.sanity.io, not the CDN, so nothing is stale. Drafts and release versions are not published, so they are left out.
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

// STEP 3: conflicts
// IN:  the product documents
// OUT: [[path, Map(form -> {n, first})]] for each path held in more than one form. A path is JSON: ["a","b"], an array step is null.
// WHY: if one path holds 7 on one product and "9" on another, nothing can read it as one thing.
function conflicts(products) {
  const seen = new Map();
  for (const p of products) visit(p, [], p.name ?? p._id, seen);
  return [...seen].filter(([, forms]) => forms.size > 1);
}

function visit(value, path, who, seen) {
  if (value === null) return;
  const key = JSON.stringify(path);
  const form = Array.isArray(value) ? 'array' : typeof value;
  const forms = seen.get(key) ?? new Map();
  const at = forms.get(form) ?? { n: 0, first: who };
  at.n++;
  forms.set(form, at);
  seen.set(key, forms);
  if (Array.isArray(value)) for (const item of value) visit(item, [...path, null], who, seen);
  else if (typeof value === 'object') for (const [k, v] of Object.entries(value)) visit(v, [...path, k], who, seen);
}

// STEP 4: report
// IN:  the products and their conflicts
// OUT: the screen text, and the exit code: 0 PASS, 1 NO
function report(products, bad) {
  const show = (key) => JSON.parse(key).reduce((a, step) => a + (step === null ? '[]' : (a ? '.' : '') + step), '');
  console.log(`${products.length} published products, ${bad.length} paths in more than one form\n`);
  for (const [key, forms] of bad) {
    console.log(show(key));
    for (const [form, { n, first }] of forms) console.log(`  ${form} x${n}, first: ${first}`);
    console.log('');
  }
  console.log(bad.length ? 'RESULT: NO' : 'RESULT: PASS');
  return bad.length ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: the check says no where it must.\n');
  const products = await read();
  process.exitCode = report(products, conflicts(products));
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
