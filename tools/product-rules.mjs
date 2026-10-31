// Products rules 1 to 5, pure, over published product documents. The one definition:
// check-products.mjs, check-integrity.mjs and create-product.mjs all import it.
//
//   1. one form                  a place never holds two of: string, number, boolean, array, object
//   2. one way to say no value   a place writes "no value" one way: null, empty text, empty list, empty object or a missing key
//                                (a key counts as missing only where another object at that place has it)
//   3. one spelling              two values at a place never differ only in case or spaces, nor do two key names under a place
//   4. no repeated product       no two products share a name, sku or slug (case and punctuation ignored)
//   5. no value twice            no filter field holds one value twice on one product
//
// A place is a position in a product, for example filterAttributes.freqResponseHz.min. An array step is [].
// Not read: overviewFields (out of scope) and filterAttributes.sourcing (a quote is exact, and sourcing is assumed true).

export const NOT_READ = new Set(['overviewFields', 'filterAttributes.sourcing']);
const spelling = (text) => text.toLowerCase().replace(/\s/g, '');
const child = (place, key) => (place ? `${place}.${key}` : key);
export const show = (place) => place || '(product)';

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

// Rules 1 to 3, step 1: file everything the products put at each place, once.
// place -> { forms, nones, spells, names }, each a tally. spells: spelling -> tally of the values as written. names: the same for key names.
export function collect(products) {
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

// Rules 1 to 3, step 2: the places that break each rule. If a place holds 7 on one product and "9" on another, null on one and no key on another,
// or "Black" and "black", two readers of that place can read two different things.
export function judge(places) {
  const broken = { 'one form': [], 'one way to say no value': [], 'one spelling': [] };
  for (const [place, at] of places) {
    if (at.forms.size > 1) broken['one form'].push([place, at.forms]);
    if (at.nones.size > 1) broken['one way to say no value'].push([place, at.nones]);
    for (const same of [...at.spells.values(), ...at.names.values()]) if (same.size > 1) broken['one spelling'].push([place, same]);
  }
  return broken;
}

const IDENTITY = ['name', 'sku', 'slug'];
const FILTER = 'filterAttributes';
const SKIP = /^(_.*|sku|slug|url|href|sourcing|sourcedAt|catalogueLocationKeys|overviewFields|marks|style|listItem|level|markDefs)$/;
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const short = (t) => JSON.stringify(t.length > 50 ? `${t.slice(0, 50)}…` : t);
const quote = (t) => JSON.stringify(t.length > 60 ? `${t.slice(0, 60)}…` : t);

// Every value under filterAttributes, of any type: [path, value].
function filterLeaves(value, path = FILTER, out = []) {
  if (Array.isArray(value)) value.forEach((x) => filterLeaves(x, `${path}[]`, out));
  else if (value && typeof value === 'object') {
    for (const [k, x] of Object.entries(value)) if (!SKIP.test(k)) filterLeaves(x, `${path}.${k}`, out);
  } else if (value !== null && value !== undefined && value !== '') out.push([path, value]);
  return out;
}

// RULE 4: no two products share a name, sku or slug
// OUT: one finding per name, sku or slug held by more than one product
// WHY: a customer or an order line cannot tell two products with one identity apart
export function repeats(products) {
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
// OUT: one finding per filter field and value that a product holds twice, with the number of products
// WHY: a filter field is a set, so a value written twice is the same fact written again. Display rows are ordered and labelled, where a repeat is layout. Two spellings of one value are rule 3.
export function twiceInField(products) {
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

// All five rules as text lines. Empty = the products pass the done-proof.
export function findings(products) {
  const out = [];
  for (const [rule, found] of Object.entries(judge(collect(products)))) {
    for (const [place, held] of found) {
      out.push(`${rule}: ${show(place)}`);
      for (const [what, { n, first }] of held) out.push(`  ${rule === 'one spelling' ? quote(what) : what} x${n}, first: ${first}`);
    }
  }
  for (const line of repeats(products)) out.push(`repeated product: ${line}`);
  for (const line of twiceInField(products)) out.push(`value twice in one filter field: ${line}`);
  return out;
}
