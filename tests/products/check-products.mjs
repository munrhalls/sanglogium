// Products structure check: is each thing written one way, wherever it appears?
// PASS or NO. It judges whether products agree with each other, never whether a value is true.
//
// A place is a position in a product, for example filterAttributes.freqResponseHz.min. An array step is [].
//   1. one form                  a place never holds two of: string, number, boolean, array, object
//   2. one way to say no value   a place writes "no value" one way: null, empty text, empty list, empty object or a missing key
//                                (a key counts as missing only where another object at that place has it)
//   3. one spelling              two values at a place never differ only in case or spaces, nor do two key names under a place
//
// Not read: overviewFields (out of scope) and filterAttributes.sourcing (a quote is exact, and sourcing is assumed true).
// Not judged: two words for one fact, typos, units, punctuation. Each looks like two real values; only a person's list could tell.
//
// Human-run, reads only: node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-products.mjs
// Exit 0 PASS. Exit 1 NO, every broken place is printed. Exit 2 no verdict: it could not read, or the self-proof failed.
//
// FLOW  selfProof -> read -> collect -> judge -> report

const NOT_READ = new Set(['overviewFields', 'filterAttributes.sourcing']);
const spelling = (text) => text.toLowerCase().replace(/\s/g, '');
const child = (place, key) => (place ? `${place}.${key}` : key);
const show = (place) => place || '(product)';

// A tally: what was seen -> how many times, and the first product that had it.
function count(tally, what, who) {
  const seen = tally.get(what) ?? { n: 0, first: who };
  seen.n++;
  tally.set(what, seen);
}

function inner(map, key) {
  if (!map.has(key)) map.set(key, new Map());
  return map.get(key);
}

// 1. selfProof: a check that cannot say no proves nothing.
// Two fake products must give exactly the finding, or none. Alien names, so no real place can match.
function selfProof() {
  const findings = (a, b) => Object.entries(judge(collect([{ name: 'p1', ...a }, { name: 'p2', ...b }]))).flatMap(([rule, found]) => found.map(([place]) => `${rule}: ${show(place)}`)).join('; ');
  const flagged = [
    [{ zorb: 7 }, { zorb: '7' }, 'one form: zorb'],
    [{ zorb: { quux: 7 } }, { zorb: { quux: '7' } }, 'one form: zorb.quux'],
    [{ zorb: [7] }, { zorb: ['7'] }, 'one form: zorb[]'],
    [{ zorb: null }, {}, 'one way to say no value: zorb'],
    [{ zorb: [] }, { zorb: null }, 'one way to say no value: zorb'],
    [{ zorb: {} }, { zorb: null }, 'one way to say no value: zorb'],
    [{ zorb: '  ' }, {}, 'one way to say no value: zorb'],
    [{ zorb: [{ quux: null }] }, { zorb: [{}] }, 'one way to say no value: zorb[].quux'],
    [{ zorb: 'Quux Plomb' }, { zorb: 'quux plomb' }, 'one spelling: zorb'],
    [{ zorb: 'HD 600' }, { zorb: 'HD600' }, 'one spelling: zorb'],
    [{ zorbQuux: 1 }, { ZORBQUUX: 1 }, 'one spelling: (product)'],
    // the same defect under a place that is not read is not flagged, beside it it is
    [{ overviewFields: { zorb: 7 }, quux: 7 }, { overviewFields: { zorb: '7' }, quux: '7' }, 'one form: quux'],
    [{ filterAttributes: { sourcing: [{ quote: 'Quux Plomb' }], quux: 7 } }, { filterAttributes: { sourcing: [{ quote: 'quux plomb' }], quux: '7' } }, 'one form: filterAttributes.quux'],
  ];
  const fine = [
    [{ zorb: null }, { zorb: 7 }],
    [{ zorb: 7 }, {}],
    [{ zorb: 'in-ear' }, { zorb: 'on-ear' }],
    [{ zorb: '105dB' }, { zorb: '≥105dB' }],
    [{ zorb: 'in-ear' }, { zorb: 'in-ear' }],
  ];
  for (const [a, b, want] of [...flagged, ...fine.map(([a, b]) => [a, b, ''])]) {
    const got = findings(a, b);
    if (got !== want) throw new Error(`self-proof failed on ${JSON.stringify(a)} against ${JSON.stringify(b)}: wanted [${want}], got [${got}]`);
  }
}

// 2. read: every published product, whole, in _id order, so "first" in the report is the same on every run.
// One request is one snapshot. api.sanity.io, not the CDN, so nothing is stale. Zero products is no verdict: a wrong dataset would pass.
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

// 3. collect: file everything the products put at each place, once.
// place -> { forms, nones, spells, names }, each a tally. spells: spelling -> tally of the values as written. names: the same for key names.
function collect(products) {
  const places = new Map();
  const objects = new Map(); // place -> the key set of each object found there, to find missing keys

  function visit(value, place, who) {
    if (!places.has(place)) places.set(place, { forms: new Map(), nones: new Map(), spells: new Map(), names: new Map() });
    const at = places.get(place);
    if (value === null) {
      count(at.nones, 'null', who);
      return;
    }
    count(at.forms, Array.isArray(value) ? 'array' : typeof value, who);
    if (typeof value === 'string') {
      if (value.trim() === '') count(at.nones, 'empty text', who);
      count(inner(at.spells, spelling(value)), value, who);
    } else if (Array.isArray(value)) {
      if (value.length === 0) count(at.nones, 'empty list', who);
      for (const item of value) visit(item, `${place}[]`, who);
    } else if (typeof value === 'object') {
      const keys = Object.keys(value).filter((key) => !NOT_READ.has(child(place, key)));
      if (keys.length === 0) count(at.nones, 'empty object', who);
      if (!objects.has(place)) objects.set(place, []);
      objects.get(place).push({ keys: new Set(keys), who });
      for (const key of keys) {
        count(inner(at.names, spelling(key)), key, who);
        visit(value[key], child(place, key), who);
      }
    }
  }

  for (const product of products) visit(product, '', product.name ?? product._id);

  for (const [place, found] of objects) {
    const all = new Set(found.flatMap((object) => [...object.keys]));
    for (const { keys, who } of found) for (const key of all) if (!keys.has(key)) count(places.get(child(place, key)).nones, 'missing key', who);
  }
  return places;
}

// 4. judge: the places that break each rule. If a place holds 7 on one product and "9" on another, null on one and no key on another,
// or "Black" and "black", two readers of that place can read two different things.
function judge(places) {
  const broken = { 'one form': [], 'one way to say no value': [], 'one spelling': [] };
  for (const [place, at] of places) {
    if (at.forms.size > 1) broken['one form'].push([place, at.forms]);
    if (at.nones.size > 1) broken['one way to say no value'].push([place, at.nones]);
    for (const same of [...at.spells.values(), ...at.names.values()]) if (same.size > 1) broken['one spelling'].push([place, same]);
  }
  return broken;
}

// 5. report: the screen text and the exit code.
function report(products, broken) {
  const quote = (text) => JSON.stringify(text.length > 60 ? `${text.slice(0, 60)}…` : text);
  console.log(`${products.length} published products\n`);
  for (const [rule, found] of Object.entries(broken)) {
    for (const [place, held] of found) {
      console.log(`${rule}: ${show(place)}`);
      for (const [what, { n, first }] of held) console.log(`  ${rule === 'one spelling' ? quote(what) : what} x${n}, first: ${first}`);
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
  process.exitCode = report(products, judge(collect(products)));
} catch (e) {
  console.error(`NO VERDICT: ${e.message}`);
  process.exitCode = 2;
}
