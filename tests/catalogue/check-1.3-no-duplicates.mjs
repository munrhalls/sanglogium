// ══════════════════════════════════════════════════════════════════
// CHECK 1.3 — zero duplicates: no two documents are the same product.
// Pass = duplicate groups: 0 on every slice, no cap warnings.
// Run: node tests/catalogue/check-1.3-no-duplicates.mjs [slice]   (no slice = all three)
//
// Read this top to bottom. Each STEP is a black box: the header says
// what goes in, what comes out, and why the output is trustworthy by
// logic alone. You verify the wiring between steps — not the mechanics.
// ══════════════════════════════════════════════════════════════════
import { readFileSync } from 'node:fs';
import { client } from './sanity-client.mjs';

// ── STEP 1: Resolve a slice slug to its full set of location keys ──
// IN:  data/catalogue-index.json + one slice slug.
// OUT: every location id inside that slice (all descendants).
// TRUST: same recursive unroll the app uses — "in slice" matches what
//      the storefront means.
const index = JSON.parse(readFileSync(new URL('../../data/catalogue-index.json', import.meta.url)));
const keysFor = (slug) => {
  const root = index.slugToIdMap[slug];
  const out = new Set();
  const stack = [root];
  while (stack.length) {
    const id = stack.pop();
    if (out.has(id)) continue;
    out.add(id);
    stack.push(...(index.slotMetadataMap[id]?.children ?? []));
  }
  return [...out];
};

const ALL = ['headphones', 'audio-electronics', 'accessories'];
const SLICES = process.argv[2] ? [process.argv[2]] : ALL;
if (!process.argv[2]) console.log('No slice arg — running all three. Pass one of: ' + ALL.join(', '));

// ── STEP 2: Fetch ALL products with a normalised identity ──────────
// IN:  one slice's `keys` (only used to tag each doc in/out of slice).
// OUT: `products` — every product with `_id`, name, brand, inSlice flag.
// TRUST: grouping happens across the WHOLE catalogue, not just the
//      slice — so a duplicate whose twin sits outside the slice is
//      still caught and printed tagged "outside".
const norm = (s) => (s ?? '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]+/g, ' ').trim();
const PRODUCTS = `*[_type == "product"] | order(_id asc) [0...1000] { _id, name, "brand": brand->name, "inSlice": count(catalogueLocationKeys[@ in $keys]) > 0 }`;

for (const slice of SLICES) {
  const products = await client.fetch(PRODUCTS, { keys: keysFor(slice) });

// ── STEP 3: Group by "same product" and keep the collisions ────────
// IN:  `products` from step 2.
// OUT: `dupes` — groups of 2+ docs of the SAME BRAND whose names are
//      equal, or where one name is a word-prefix of the other, after:
//      lower-case, &amp; decoded, punctuation ignored, the brand's own
//      words dropped from the front, and "headphone(s)" dropped.
//      Only groups with at least one member in the slice are kept.
//      Example caught: "Sennheiser HD 560S" vs "Sennheiser HD 560S
//      Open-back Reference Headphones".
// TRUST: pure string reduction, applied identically to every doc.
//      "Open Box" / "Apos Certified" listings are separate products by
//      design: they match only on a fully identical name, never by prefix.
  const core = (p) => {
    const brandWords = norm(p.brand).split(' ');
    const w = norm(p.name).split(' ');
    while (w.length && brandWords.includes(w[0])) w.shift();
    return w.filter((x) => x !== 'headphones' && x !== 'headphone');
  };
  const isVariant = (p) => /open box|apos certified/i.test(p.name ?? '');
  // Words that only DESCRIBE a product. A longer name that merely adds these
  // (or a year) is the same product; adding anything else (Pro, MG, SE, V2,
  // case, pads, ...) makes it a different product.
  const DESCRIBE = new Set('open back dynamic planar magnetic electrostatic reference over on in ear wireless bluetooth high end noise canceling cancelling portable desktop usb dac amp amplifier headphone preamp pre streamer network music player digital audio converter all one built balanced fully tube r2r and with stand'.split(' '));
  const same = (a, b) => {
    if (norm(a.brand) !== norm(b.brand)) return false;
    const [ca, cb] = [core(a), core(b)];
    if (ca.join(' ') === cb.join(' ')) return true;
    if (isVariant(a) || isVariant(b)) return false;
    let p = 0;
    while (p < ca.length && p < cb.length && ca[p] === cb[p]) p++;
    const onlyDescribes = (tail) => tail.every((w) => DESCRIBE.has(w) || /^20\d\d$/.test(w));
    return p > 0 && onlyDescribes(ca.slice(p)) && onlyDescribes(cb.slice(p));
  };
  // union-find: link every pair that is "the same product"
  const root = new Map(products.map((p) => [p._id, p._id]));
  const find = (x) => (root.get(x) === x ? x : (root.set(x, find(root.get(x))), root.get(x)));
  for (let i = 0; i < products.length; i++)
    for (let j = i + 1; j < products.length; j++)
      if (same(products[i], products[j])) root.set(find(products[i]._id), find(products[j]._id));
  const groups = new Map();
  for (const p of products) groups.set(find(p._id), [...(groups.get(find(p._id)) ?? []), p]);
  const dupes = [...groups.values()].filter((g) => g.length > 1 && g.some((p) => p.inSlice));

// ── STEP 4: Print the verdict ──────────────────────────────────────
// IN:  `dupes` from step 3.
// OUT: count + each group with members tagged in slice / outside.
// TRUST: zero groups printed means zero collisions under the rule —
//      PASS is `duplicate groups: 0`.
  console.log(`\n=== [1.3] ${slice} — ${products.length} products checked, duplicate groups: ${dupes.length} ===`);
  dupes.forEach((g, i) => {
    console.log(`\n── group ${i + 1} ──`);
    g.forEach((p) => console.log(`  ${p.inSlice ? 'in slice' : 'outside '}  ${p.brand ?? '(no brand)'} — ${p.name}  [${p._id}]`));
  });
  if (products.length >= 1000) console.log(`!! hit the 1000 cap — list may be truncated`);
}
