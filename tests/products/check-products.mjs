// Products structure check
//
// Question: in the published products, is each thing written one way, in every place it appears?
// Answer: PASS or NO. It judges whether products agree with each other, never whether a value is true.
//
// A place is a position in a product document, for example filterAttributes.freqResponseHz.min. An array step is [].
// Three rules, each a yes/no. PASS needs all three to be yes.
//   1. one form                  a place holds string, number, boolean, array or object, never two of them
//   2. one way to say no value   "no value" at a place is written one way: null, empty text, empty list, empty object or a missing key.
//                                A key counts as missing only where another object at that place has it.
//   3. one spelling              two values at a place never differ only in case or spaces. Nor do two key names under one place.
//
// Not judged, forced: two different words for one fact ("Frequency response" and "Freq. response", or one key under two names),
// a letter-off typo ("wirless"), a unit. Each looks exactly like two real values: "in-ear" and "on-ear" are both real.
// Only a list of the facts and their allowed values, written by a person, could tell.
// Not judged, chosen: punctuation. "Weight:" and "Weight" are one value but "105dB" and "≥105dB" are two, and only a person can tell.
// Not read: overviewFields, in every product. It is out of scope, so the walk never looks inside it.
// Not read: filterAttributes.sourcing, in every product. A quote is exact, so two quotes that differ in case are two quotes, not one value spelled twice. Sourcing is assumed true.
//
// Human-run, reads only. From the repo root:
//   node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-products.mjs
// Exit 0 = PASS. Exit 1 = NO, every place that breaks a rule is printed. Exit 2 = no verdict: it could not read, or the self-proof failed.
//
// FLOW
//   1. selfProof  fake products      -> throws unless each rule says no where it must, and yes on clean data
//   2. read       the Sanity dataset -> every published product, whole
//   3. places     the products       -> what the products put at each place, overviewFields left out
//   4. rules      the places         -> the places that break each rule
//   5. report     the broken places  -> the screen text and the exit code

// STEP 1: selfProof
// IN:  fake products with alien names, so no real place can match
// OUT: throws unless the rules find exactly the planted defects and nothing in the clean cases
// WHY: a check that cannot say no proves nothing. One defect for each rule and for each spot a defect can sit.
//      The clean cases pin the edges: null against a value, a missing key against a value, two real values one letter apart,
//      and two values that differ only in punctuation are all fine.
function selfProof() {
  // product 1, product 2, the broken places wanted ('' = none)
  const cases = [
    [{ zorb: 7 }, { zorb: '7' }, 'one form ["zorb"]'],
    [{ zorb: { quux: 7 } }, { zorb: { quux: '7' } }, 'one form ["zorb","quux"]'],
    [{ zorb: [7] }, { zorb: ['7'] }, 'one form ["zorb",null]'],
    [{ zorb: null }, {}, 'one way to say no value ["zorb"]'],
    [{ zorb: [] }, { zorb: null }, 'one way to say no value ["zorb"]'],
    [{ zorb: {} }, { zorb: null }, 'one way to say no value ["zorb"]'],
    [{ zorb: '  ' }, {}, 'one way to say no value ["zorb"]'],
    [{ zorb: [{ quux: null }] }, { zorb: [{}] }, 'one way to say no value ["zorb",null,"quux"]'],
    [{ zorb: 'Quux Plomb' }, { zorb: 'quux plomb' }, 'one spelling ["zorb"]'],
    [{ zorb: 'HD 600' }, { zorb: 'HD600' }, 'one spelling ["zorb"]'],
    [{ zorbQuux: 1 }, { ZORBQUUX: 1 }, 'one spelling []'],
    [{ zorb: null }, { zorb: 7 }, ''],
    [{ zorb: 7 }, {}, ''],
    [{ zorb: 'in-ear' }, { zorb: 'on-ear' }, ''],
    [{ zorb: '105dB' }, { zorb: '≥105dB' }, ''],
    [{ zorb: 'in-ear' }, { zorb: 'in-ear' }, ''],
    // the same defect (7 against '7') under overviewFields is not read, and beside it is flagged
    [{ overviewFields: { zorb: 7 }, quux: 7 }, { overviewFields: { zorb: '7' }, quux: '7' }, 'one form ["quux"]'],
    // the same for filterAttributes.sourcing: two quotes differing in case are not flagged, the same defect beside them is
    [{ filterAttributes: { sourcing: [{ quote: 'Quux Plomb' }], quux: 7 } }, { filterAttributes: { sourcing: [{ quote: 'quux plomb' }], quux: '7' } }, 'one form ["filterAttributes","quux"]'],
  ];
  for (const [a, b, want] of cases) {
    const broken = rules(places([{ name: 'p1', ...a }, { name: 'p2', ...b }]));
    const got = Object.entries(broken).flatMap(([rule, found]) => found.map(([key]) => `${rule} ${key}`)).join();
    if (got !== want) throw new Error(`self-proof failed on ${JSON.stringify(a)} against ${JSON.stringify(b)}: wanted [${want}], got [${got}]`);
  }
}

// STEP 2: read
// IN:  the Sanity project, dataset and read token from .env.local
// OUT: every published product document, whole, in _id order
// WHY: one request is one snapshot, so no write can land between two reads. No projection, so nothing is reshaped.
//      api.sanity.io, not the CDN, so nothing is stale. Drafts and release versions are not published, so they are left out.
//      order(_id), so "first" in the report is the same on every run.
//      Zero products is no verdict: a wrong dataset would pass.
async function read() {
  const env = process.env;
  const query = '*[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id)';
  const url = `https://${env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data/query/${env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${env.SANITY_API_READ_TOKEN}` } });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status}`);
  const { result } = await res.json();
  if (!Array.isArray(result) || result.length === 0) throw new Error('read returned no products');
  return result;
}

// STEP 3: places
// IN:  the product documents
// OUT: Map of place -> { path, forms, nones, spells, names, objects }
//      The place is JSON: ["a","b"], an array step is null.
//      forms, nones: Map(what -> { n, first }) where first is the first product that has it. forms: the form of each value. nones: each way "no value" is written.
//      spells: Map(value without case and spaces -> Map(value as written -> { n, first })). names: the same, for the key names under the place.
//      objects: [{ keys, who }] for each object at the place, so a missing key can be found.
// WHY: every rule is a question about one place, so each value is filed under its place once and the rules only read the Map.
//      overviewFields and filterAttributes.sourcing are cut off the copy before the walk, so they leave no place, no key name and no missing key behind.
function places(products) {
  const seen = new Map();
  for (const p of products) {
    const read = { ...p };
    delete read.overviewFields;
    if (read.filterAttributes && typeof read.filterAttributes === 'object') {
      read.filterAttributes = { ...read.filterAttributes };
      delete read.filterAttributes.sourcing;
    }
    visit(read, [], p.name ?? p._id, seen);
  }
  for (const at of seen.values()) {
    const all = new Set(at.objects.flatMap((o) => [...o.keys]));
    for (const { keys, who } of at.objects) for (const k of all) if (!keys.has(k)) note(seen.get(JSON.stringify([...at.path, k])).nones, 'missing key', who);
  }
  return seen;
}

function visit(value, path, who, seen) {
  const key = JSON.stringify(path);
  const at = seen.get(key) ?? { path, forms: new Map(), nones: new Map(), spells: new Map(), names: new Map(), objects: [] };
  seen.set(key, at);
  if (value === null) {
    note(at.nones, 'null', who);
    return;
  }
  note(at.forms, Array.isArray(value) ? 'array' : typeof value, who);
  if (typeof value === 'string') {
    if (value.trim() === '') note(at.nones, 'empty text', who);
    note(group(at.spells, spelling(value)), value, who);
  } else if (Array.isArray(value)) {
    if (value.length === 0) note(at.nones, 'empty list', who);
    for (const item of value) visit(item, [...path, null], who, seen);
  } else if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) note(at.nones, 'empty object', who);
    at.objects.push({ keys: new Set(keys), who });
    for (const k of keys) {
      note(group(at.names, spelling(k)), k, who);
      visit(value[k], [...path, k], who, seen);
    }
  }
}

const spelling = (text) => text.toLowerCase().replace(/\s/g, '');

function note(map, what, who) {
  const at = map.get(what) ?? { n: 0, first: who };
  at.n++;
  map.set(what, at);
}

function group(map, key) {
  if (!map.has(key)) map.set(key, new Map());
  return map.get(key);
}

// STEP 4: rules
// IN:  the places
// OUT: { rule: [[place, Map(what -> { n, first })], ...] } for the places that break the rule. An empty list is a yes.
// WHY: if a place holds 7 on one product and "9" on another, or null on one and no key on another, or "Black" and "black",
//      two readers of the same place can read two different things.
function rules(seen) {
  const broken = { 'one form': [], 'one way to say no value': [], 'one spelling': [] };
  const quoted = (m) => new Map([...m].map(([text, at]) => [JSON.stringify(text.length > 60 ? text.slice(0, 60) + '…' : text), at]));
  for (const [key, at] of seen) {
    if (at.forms.size > 1) broken['one form'].push([key, at.forms]);
    if (at.nones.size > 1) broken['one way to say no value'].push([key, at.nones]);
    for (const same of [...at.spells.values(), ...at.names.values()]) if (same.size > 1) broken['one spelling'].push([key, quoted(same)]);
  }
  return broken;
}

// STEP 5: report
// IN:  the products and the broken places of each rule
// OUT: the screen text, and the exit code: 0 PASS, 1 NO
function report(products, broken) {
  const show = (key) => JSON.parse(key).reduce((a, step) => a + (step === null ? '[]' : (a ? '.' : '') + step), '') || '(product)';
  console.log(`${products.length} published products\n`);
  for (const [rule, found] of Object.entries(broken)) {
    for (const [key, held] of found) {
      console.log(`${rule}: ${show(key)}`);
      for (const [what, { n, first }] of held) console.log(`  ${what} x${n}, first: ${first}`);
      console.log('');
    }
  }
  Object.entries(broken).forEach(([rule, found], i) => console.log(`${i + 1}. ${rule}: ${found.length ? `NO, ${found.length} found` : 'yes'}`));
  const bad = Object.values(broken).some((found) => found.length);
  console.log(bad ? '\nRESULT: NO' : '\nRESULT: PASS');
  return bad ? 1 : 0;
}

try {
  selfProof();
  console.log('self-proof: each rule says no where it must, and yes on clean data.\n');
  const products = await read();
  process.exitCode = report(products, rules(places(products)));
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
