// Products consistency check
//
// Question: is the product data consistent? Three yes/no answers; all yes = PASS.
//   1. Is every published product in exactly one of the three slices?
//   2. Does every filter cell of every product hold a value from its legal set, or its one empty form?
//   3. Does every other path of the products hold one form across all products?
// Before the live read the check proves it can say no (self-proof); without that a PASS means nothing.
// Human-run, reads only. From the repo root:
// node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-products.mjs
// Exit 0 = PASS. Exit 1 = a no; each failure prints its product, field and what is stored.
//
// WHAT "CONSISTENT" MEANS, the only definition used: within one field, one fact has one stored form and one stored form means one fact.
// FORCED by that definition:
//   - read the live data, in one query: the store runs no validation on writes, and a write can land between two reads.
//   - a closed legal set per field (the tables below): without one, a lone typo cannot be told from a rare real value.
//   - the stored value is in its set: that is the whole of "one fact, one form". Form counts: 7 is not "7".
//   - one empty form: otherwise "no value" has two forms. Chosen which, since the data already holds it: the key present, [] for a list, null for anything else.
//     A yes/no has no empty form: it is true or false.
//   - every product judged: a product in no slice would escape; in two slices it could not hold both tables.
//   - the self-proof: a check that cannot say no proves nothing. Only the "can say no" half is needed: a check that says no to everything cannot pass live data.
// CHOSEN, so only data: which values are in the sets (the owner's).
// NOT FORCED, so absent: rules for when a cell applies, "not empty when it applies", duplicate entries, undeclared keys, comparison with the schema.
//   They test whether a value is true or complete. No script can know that.
// SCOPE: proves the data matches the tables below. Whether the filters read the same tables is a different fact, not judged here.
//
// THE FLOW.
//   1. TABLES     nothing in            -> per slice: each filter cell and its legal set
//   2. judge      one filterAttributes  -> the cells not in their set
//   3. mixedForms all products          -> the non-filter paths that hold more than one form
//   4. selfProof  fake data             -> throws unless the steps above say no where they must
//   5. read       the live dataset      -> every published product and the catalogue, in one query
//   6. report     all verdicts          -> the screen text and the exit code

// ── STEP 1: TABLES ─────────────────────────────────────────────────
// cell id = a path inside filterAttributes. Its legal set:
//   ['a', 'b']        one of these texts, or null (enum)
//   L(['a', 'b'])     a list whose items are all these texts, [] when empty. L('number') = numbers, L('string') = any texts.
//   'number'          a finite number, or null (null = no maker publishes it)
//   'boolean'         true or false
//   /regex/           a text matching it, or null
const L = (of) => ({ of });
const SLICES = [
  {
    slug: 'headphones',
    cells: {
      wearingStyle: ['over-ear', 'on-ear', 'in-ear'],
      connectivity: ['wired', 'wireless', 'true-wireless', 'hybrid', 'rf-wireless'],
      acousticDesign: ['open-back', 'closed-back', 'semi-open'],
      soundSignature: ['Neutral', 'Warm', 'Bright/Analytical', 'Dark', 'V-Shaped', 'Basshead', 'Mid-Forward', 'Harman-target-like'],
      anc: ['anc', 'passive', 'none'],
      ipxRating: ['none', 'IPX2', 'IPX4', 'IPX5', 'IPX7', 'IPX8'],
      driverConfigBucket: ['single-dynamic', 'single-ba', 'multi-ba', 'hybrid-config', 'planar', 'other'],
      driverType: L(['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid', 'amt', 'bone-conduction', 'electret']),
      portable: 'boolean',
      microphone: 'boolean',
      foldable: 'boolean',
      impedanceOhms: 'number',
      sensitivityDbMw: 'number',
      'freqResponseHz.min': 'number',
      'freqResponseHz.max': 'number',
      bluetoothCodecs: L(['SBC', 'AAC', 'aptX', 'aptX HD', 'aptX Adaptive', 'aptX LL', 'LDAC', 'LC3']),
      cableTermination: L(['3.5mm', '2.5mm-balanced', '4.4mm-balanced', '4-pin-xlr', '6.35mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable', 'pro-bias', 'lemo']),
      detachableCable: 'boolean',
      cableLengthM: 'number',
      'batteryLifeHours.ancOff': 'number',
      'batteryLifeHours.ancOn': 'number',
    },
  },
  {
    slug: 'audio-electronics',
    cells: {
      deviceType: ['dac', 'network-streamer', 'preamplifier', 'headphone-amplifier', 'digital-audio-player', 'integrated-amplifier', 'cd-player-transport', 'power-amplifier'],
      deviceConnectivity: ['wired', 'bluetooth', 'wifi-networked', 'wired-wireless'],
      formFactor: ['desktop', 'portable', 'dongle'],
      condition: ['new', 'open-box', 'refurbished'],
      dacIncluded: 'boolean',
      balancedOutput: 'boolean',
      rackMountable19: 'boolean',
      inputs: L(['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu']),
      amplification: ['solid-state', 'tube', 'hybrid', 'class-d'],
      outputs: L(['speaker-terminals', 'pre-out-rca', 'pre-out-xlr', 'headphone-jack', 'subwoofer-out']),
      powerOutputPerChannelW: 'number',
      channelCount: L(['2.0', '2.1', '5.1', '7.1', '7.1.4']),
      phonoStageBuiltIn: ['none', 'mm', 'mc'],
      trigger12v: 'boolean',
      remoteControlIncluded: 'boolean',
      maxSampleRateBitDepth: /^\d+-bit\/\d+(\.\d+)?kHz$/,
      dsdSupport: ['none', 'dsd64', 'dsd128', 'dsd256-plus'],
      hiResCertification: L(['mqa', 'hi-res-audio']),
      dacChipsetFamily: L(['ess-sabre', 'akm', 'cirrus-logic', 'r2r-ladder']),
      streamingPlatformSupport: L(['airplay2', 'chromecast', 'spotify-connect', 'tidal-connect', 'roon-ready', 'dlna']),
      networkConnection: L(['wifi', 'ethernet']),
      voiceAssistant: L(['alexa', 'google-assistant']),
      multiroomSupport: 'boolean',
    },
  },
  {
    slug: 'accessories',
    cells: {
      accessoryType: ['cables-interconnects', 'replacement-parts', 'cases-storage-transport', 'adapters-converters', 'cleaning-maintenance', 'stands-isolation'],
      compatibleProductType: L(['headphone', 'speaker', 'amplifier-source', 'universal-any']),
      cableFunction: L(['headphone-cable', 'interconnect-rca-xlr', 'digital-usb-coaxial-optical-aes-ebu-ethernet']),
      connectorTermination: L(['rca', 'xlr', '3.5mm', '2.5mm', '4.4mm', '6.35mm', '4-pin-mini-xlr', 'mini-to-rca', 'usb-a', 'usb-b', 'usb-micro', 'usb-c']),
      lengthM: L('number'),
      conductorMaterial: L(['copper-ofc', 'silver', 'silver-plated-copper']),
      balancedUnbalanced: L(['balanced', 'unbalanced']),
      material: L(['wood', 'metal', 'acrylic', 'composite-mdf']),
      adjustableHeight: 'boolean',
      weightCapacityKg: 'number',
      partType: ['ear-pads-cushions', 'ear-tips'],
      compatibility: L('string'),
      adapterFunction: L(['bluetooth-transmitter-receiver', 'headphone-impedance-attenuator-adapter', 'connector-adapter', 'standalone-phono-preamp', 'usb-dac-dongle', 'usb-noise-filter']),
    },
  },
];

// ── STEP 2: judge ──────────────────────────────────────────────────
// IN:  a slice and one product's filterAttributes.
// OUT: [[cell id, what is wrong], ...], empty when every cell is in its set.
// WHY: a cell outside its set, or absent, is a form a filter cannot group or compare.
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const get = (o, id) => id.split('.').reduce((x, k) => (x !== null && typeof x === 'object' ? x[k] : undefined), o);
function inSet(d, v) {
  if (Array.isArray(d)) return v === null || d.includes(v);
  if (d === 'number') return v === null || isNum(v);
  if (d === 'boolean') return typeof v === 'boolean';
  if (d instanceof RegExp) return v === null || (typeof v === 'string' && d.test(v));
  const item = (x) => (Array.isArray(d.of) ? d.of.includes(x) : d.of === 'number' ? isNum(x) : typeof x === 'string');
  return Array.isArray(v) && v.every(item);
}
function judge(slice, fa) {
  const fails = [];
  for (const [id, d] of Object.entries(slice.cells)) {
    const v = get(fa, id);
    if (v === undefined) fails.push([id, 'key missing']);
    else if (!inSet(d, v)) fails.push([id, `stored ${JSON.stringify(v).slice(0, 60)}`]);
  }
  return fails;
}

// ── STEP 3: mixedForms ─────────────────────────────────────────────
// IN:  every published product document.
// OUT: [[path, Map(form -> { n values, first product names })], ...] for each path held in more than one form.
// WHY: if one path holds 7 on one product and "9" on another, no sort or compare can read it. Forms: null, string, number, boolean, array, object.
//      An absent key is not a form. filterAttributes is judged by step 2; keys starting with _ are the store's.
const form = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v);
function walk(v, path, seen, who) {
  const f = form(v);
  const at = seen.get(path) ?? new Map();
  seen.set(path, at);
  const e = at.get(f) ?? { n: 0, names: [] };
  e.n++;
  if (e.names.length < 3 && !e.names.includes(who)) e.names.push(who);
  at.set(f, e);
  if (f === 'array') v.forEach((x) => walk(x, `${path}[]`, seen, who));
  if (f === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`, seen, who);
}
function mixedForms(products) {
  const seen = new Map();
  for (const p of products) for (const [k, v] of Object.entries(p)) if (!k.startsWith('_') && k !== 'filterAttributes') walk(v, k, seen, p.name ?? p._id);
  return [...seen].filter(([, at]) => at.size > 1);
}

// the slices a product sits in: its catalogueLocationKeys hold the slice root or any descendant of it.
const slicesOf = (keys, idSets) => SLICES.filter((s) => (keys ?? []).some((k) => idSets[s.slug].has(k)));

// ── STEP 4: selfProof ──────────────────────────────────────────────
// IN:  per slice, a product with every cell missing and a product with every cell holding an object (a value that is in no set); two fake products with one path in two forms; fake slice membership.
// OUT: throws unless every cell of every slice is rejected in both cases, and steps 3 and slicesOf say no where they must.
// WHY: a check that cannot say no proves nothing. Saying yes needs no proof: a live PASS is itself the proof.
const set = (o, id, v) => { const ks = id.split('.'); ks.slice(0, -1).reduce((x, k) => (x[k] ??= {}), o)[ks.at(-1)] = v; return o; };
function selfProof() {
  for (const s of SLICES) {
    const ids = Object.keys(s.cells);
    const missing = judge(s, {}).map(([id]) => id);
    const nothing = judge(s, ids.reduce((o, id) => set(o, id, {}), {})).map(([id]) => id);
    for (const id of ids) if (!missing.includes(id) || !nothing.includes(id)) throw new Error(`selfProof: ${s.slug}.${id} did not reject a missing key and a value in no set`);
  }
  if (mixedForms([{ name: 'a', price: 7 }, { name: 'b', price: '9' }]).map(([p]) => p).join() !== 'price') throw new Error('selfProof: a path in two forms was not caught');
  const sets = { headphones: new Set(['k1']), 'audio-electronics': new Set(['k1']), accessories: new Set(['k3']) };
  if (slicesOf(['k9'], sets).length !== 0 || slicesOf(['k1'], sets).length !== 2) throw new Error('selfProof: a product in no slice or in two slices was not caught');
}

// ── STEP 5: read ───────────────────────────────────────────────────
// IN:  the live dataset, published documents only (no drafts, no versions).
// OUT: { products: every product document, idSets: per slice the ids of its catalogue root and all descendants }.
// WHY: one query = one moment.
async function read() {
  const base = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data`;
  const q = `{
    "products": *[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(name asc),
    "catalogue": *[_type == "catalogueItem"] { _id, "slug": slug.current, "parent": parent._ref }
  }`;
  const res = await fetch(`${base}/query/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` },
  });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const { products, catalogue } = (await res.json()).result;
  const idSets = {};
  for (const s of SLICES) {
    const ids = new Set([catalogue.find((c) => c.slug === s.slug)._id]);
    for (let grew = true; grew;) {
      grew = false;
      for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) { ids.add(c._id); grew = true; }
    }
    idSets[s.slug] = ids;
  }
  return { products, idSets };
}

// ── STEP 6: report ─────────────────────────────────────────────────
// IN:  every verdict.
// OUT: the screen text, and exit code 1 when any answer is no.
selfProof();
console.log('self-proof: the check says no where it must.\n');
const { products, idSets } = await read();
const bad = [];
const perSlice = {};
let cells = 0, failing = 0;
for (const p of products) {
  const who = p.name ?? p._id;
  const hits = slicesOf(p.catalogueLocationKeys, idSets);
  if (hits.length !== 1) { bad.push([who, [`in ${hits.length} slices${hits.length ? `: ${hits.map((s) => s.slug).join(', ')}` : ''}`]]); continue; }
  const s = hits[0];
  const fails = judge(s, p.filterAttributes);
  perSlice[s.slug] = (perSlice[s.slug] ?? 0) + 1;
  cells += Object.keys(s.cells).length;
  failing += fails.length;
  if (fails.length) bad.push([`${who} (${s.slug})`, fails.map(([id, why]) => `${id}: ${why}`)]);
}
const mixed = mixedForms(products);
console.log(`${products.length} published products: ${SLICES.map((s) => `${perSlice[s.slug] ?? 0} ${s.slug}`).join(', ')}`);
console.log(`filter cells: ${cells} judged, ${failing} fail\n`);
for (const [who, lines] of bad) {
  console.log(who);
  for (const l of lines) console.log(`  ${l}`);
  console.log('');
}
for (const [path, at] of mixed) console.log(`${path}: ${[...at].map(([f, e]) => `${f} x${e.n} (${e.names.join(', ')})`).join('  |  ')}`);
if (mixed.length) console.log('');
console.log(bad.length || mixed.length ? `RESULT: FAIL, ${bad.length} products, ${mixed.length} paths in more than one form` : `RESULT: PASS, ${products.length} of ${products.length} products`);
if (bad.length || mixed.length) process.exitCode = 1;
