// Headphones cells check
//
// Question: is every one of the 21 cells of every headphone's filterAttributes in its one legal form, with no undeclared key beside them?
// Human-run, reads only. From the repo root:
// node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-headphones-cells.mjs
// Exit 0 = every cell of every headphone passes. Exit 1 = at least one fails; the failing cells are printed. Run it after every data write to headphones.
//
// Why a check and not a lock: the Content Lake does not run schema validation on writes (Sanity docs, "Schema validation and the Content Lake"), so no file in this repo can stop a write.
// This file is the one definition of "uniform"; a data-write script ends by running it.
//
// THE FLOW. Each step is a black box: what goes in, what comes out.
//   1. STRUCTURE   nothing in            -> the 21 cells as data: legal values, and for 6 of them the rule that says when they apply
//   2. judge       one filterAttributes  -> its failing cells and its undeclared keys
//   3. selfProof   fake headphones in    -> throws unless step 2 gives the hand-written verdict on each
//   4. readLive    the live dataset in   -> the published headphones
//   5. report      every verdict in      -> the screen text and the exit code

// ── STEP 1: STRUCTURE ──────────────────────────────────────────────
// Group A applies to every headphone. Group B (has a rule) applies only when its rule says so; otherwise it takes the n/a form:
// [] for a list, false for a yes/no, null for a number. A number that applies may be null: null = "no source publishes this figure".
const CONN = ['wired', 'wireless', 'true-wireless', 'hybrid', 'rf-wireless'];
const ANC = ['anc', 'passive', 'none'];
const ENUM = (items) => ({ t: 'enum', items });
const LIST = (items) => ({ t: 'list', items });
const NUM = { t: 'num' };
const BOOL = { t: 'bool' };
const BAD = Symbol('parent object null or wrong form');
const top = (k) => (fa) => fa[k];
const sub = (k, s) => (fa) => {
  const o = fa[k];
  return o === undefined ? undefined : o === null || typeof o !== 'object' || Array.isArray(o) ? BAD : o[s];
};
const conn = (fa) => (CONN.includes(fa.connectivity) ? fa.connectivity : null);
const anc = (fa) => (ANC.includes(fa.anc) ? fa.anc : null);
const cabled = (fa) => { const c = conn(fa); return c === null ? null : c === 'wired' || c === 'hybrid'; };
const radio = (fa) => { const c = conn(fa); return c === null ? null : c !== 'wired'; };
const bluetooth = (fa) => { const c = conn(fa); return c === null ? null : c === 'wireless' || c === 'true-wireless' || c === 'hybrid'; };
const battery = (fa) => {
  const r = radio(fa), a = anc(fa);
  if (r === true || a === 'anc') return true;
  if (r === false && a !== null) return false;
  return null;
};
const ancOn = (fa) => { const a = anc(fa); return a === null ? null : a === 'anc'; };

const CELLS = [
  { id: 'wearingStyle', get: top('wearingStyle'), def: ENUM(['over-ear', 'on-ear', 'in-ear']) },
  { id: 'connectivity', get: top('connectivity'), def: ENUM(CONN) },
  { id: 'acousticDesign', get: top('acousticDesign'), def: ENUM(['open-back', 'closed-back', 'semi-open']) },
  { id: 'soundSignature', get: top('soundSignature'), def: ENUM(['Neutral', 'Warm', 'Bright/Analytical', 'Dark', 'V-Shaped', 'Basshead', 'Mid-Forward', 'Harman-target-like']) },
  { id: 'anc', get: top('anc'), def: ENUM(ANC) },
  { id: 'ipxRating', get: top('ipxRating'), def: ENUM(['none', 'IPX2', 'IPX4', 'IPX5', 'IPX7', 'IPX8']) },
  { id: 'driverConfigBucket', get: top('driverConfigBucket'), def: ENUM(['single-dynamic', 'single-ba', 'multi-ba', 'hybrid-config', 'planar', 'other']) },
  { id: 'driverType', get: top('driverType'), def: LIST(['dynamic', 'planar-magnetic', 'electrostatic', 'balanced-armature', 'hybrid', 'amt', 'bone-conduction', 'electret']) },
  { id: 'portable', get: top('portable'), def: BOOL },
  { id: 'microphone', get: top('microphone'), def: BOOL },
  { id: 'foldable', get: top('foldable'), def: BOOL },
  { id: 'impedanceOhms', get: top('impedanceOhms'), def: NUM },
  { id: 'sensitivityDbMw', get: top('sensitivityDbMw'), def: NUM },
  { id: 'freqResponseHz.min', get: sub('freqResponseHz', 'min'), def: NUM },
  { id: 'freqResponseHz.max', get: sub('freqResponseHz', 'max'), def: NUM },
  { id: 'bluetoothCodecs', get: top('bluetoothCodecs'), def: LIST(['SBC', 'AAC', 'aptX', 'aptX HD', 'aptX Adaptive', 'aptX LL', 'LDAC', 'LC3']), rule: bluetooth },
  { id: 'cableTermination', get: top('cableTermination'), def: LIST(['3.5mm', '2.5mm-balanced', '4.4mm-balanced', '4-pin-xlr', '6.35mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable', 'pro-bias', 'lemo']), rule: cabled },
  { id: 'detachableCable', get: top('detachableCable'), def: BOOL, rule: cabled },
  { id: 'cableLengthM', get: top('cableLengthM'), def: NUM, rule: cabled },
  { id: 'batteryLifeHours.ancOff', get: sub('batteryLifeHours', 'ancOff'), def: NUM, rule: battery },
  { id: 'batteryLifeHours.ancOn', get: sub('batteryLifeHours', 'ancOn'), def: NUM, rule: ancOn },
];
// Keys that may sit beside the cells: `sourcing` is declared in the schema. PENDING are known strays whose removal waits for a production deploy; delete them from this list when they are gone from the data.
const ALLOWED = new Set([...CELLS.map((c) => c.id.split('.')[0]), 'sourcing']);
const PENDING = new Set(['brand', 'requiresAmplifier', 'condition']);

// ── STEP 2: judge ──────────────────────────────────────────────────
// IN:  one product's filterAttributes (an object, possibly empty).
// OUT: { fails: [[cell, cause], ...], strays: [key, ...], pending: [key, ...] }.
// TRUST: a cell that applies must hold a legal value (a number may be null); a cell that does not apply must hold exactly its n/a form;
//        a cell whose rule input is unusable cannot be judged and fails. Nothing is skipped.
const kindOk = (d, v) => (d.t === 'enum' ? typeof v === 'string' : d.t === 'list' ? Array.isArray(v) : d.t === 'num' ? typeof v === 'number' && Number.isFinite(v) : typeof v === 'boolean');
function judgeApplies(d, v) {
  if (v === undefined) return 'key missing';
  if (v === BAD) return 'parent object null or wrong form';
  if (v === null) return d.t === 'num' ? null : d.t === 'list' ? 'null (a list is [] when empty)' : 'null where a value is required';
  if (!kindOk(d, v)) return 'wrong form';
  if (d.t === 'enum') return d.items.includes(v) ? null : 'illegal value';
  if (d.t === 'list') return v.length === 0 ? '[] where a value is required' : v.every((x) => d.items.includes(x)) ? null : 'illegal value';
  return null;
}
function judgeNA(d, v) {
  if (v === undefined) return 'key missing';
  if (v === BAD) return 'parent object null or wrong form';
  if (d.t === 'list') return Array.isArray(v) ? (v.length === 0 ? null : 'value where the rule says n/a') : 'must be []';
  if (d.t === 'bool') return v === false ? null : 'must be false';
  return v === null ? null : 'must be null';
}
function judge(fa) {
  const fails = [];
  for (const cell of CELLS) {
    const applies = cell.rule ? cell.rule(fa) : true;
    if (applies === null) { fails.push([cell.id, 'rule input unusable']); continue; }
    const cause = applies ? judgeApplies(cell.def, cell.get(fa)) : judgeNA(cell.def, cell.get(fa));
    if (cause) fails.push([cell.id, (applies ? '' : 'n/a: ') + cause]);
  }
  const extra = Object.keys(fa).filter((k) => !ALLOWED.has(k));
  return { fails, strays: extra.filter((k) => !PENDING.has(k)), pending: extra.filter((k) => PENDING.has(k)) };
}

// ── STEP 3: selfProof ──────────────────────────────────────────────
// IN:  a fake headphone that is uniform, and copies of it broken one way each.
// OUT: throws unless the uniform one passes and every broken one fails in exactly the named cell.
// TRUST: a check that cannot fail proves nothing; this shows each kind of failure is caught before the live data is trusted.
function selfProof() {
  const ok = {
    wearingStyle: 'over-ear', connectivity: 'wired', acousticDesign: 'open-back', soundSignature: 'Neutral', anc: 'none', ipxRating: 'none',
    driverConfigBucket: 'single-dynamic', driverType: ['dynamic'], portable: false, microphone: false, foldable: false,
    impedanceOhms: 32, sensitivityDbMw: null, freqResponseHz: { min: 20, max: 20000 },
    bluetoothCodecs: [], cableTermination: ['3.5mm'], detachableCable: true, cableLengthM: 1.5, batteryLifeHours: { ancOff: null, ancOn: null },
  };
  const cases = [
    ['a uniform headphone passes (null sensitivity = no figure)', ok, null],
    ['key missing', (() => { const c = { ...ok }; delete c.wearingStyle; return c; })(), 'wearingStyle'],
    ['illegal value', { ...ok, soundSignature: 'Zesty' }, 'soundSignature'],
    ['empty list where a value is required', { ...ok, driverType: [] }, 'driverType'],
    ['parent object null', { ...ok, freqResponseHz: null }, 'freqResponseHz.min'],
    ['value where the rule says n/a', { ...ok, bluetoothCodecs: ['SBC'] }, 'bluetoothCodecs'],
    ['n/a number holding a figure', { ...ok, batteryLifeHours: { ancOff: 5, ancOn: null } }, 'batteryLifeHours.ancOff'],
    ['string where a number is required', { ...ok, impedanceOhms: '32' }, 'impedanceOhms'],
    ['rule input unusable', { ...ok, connectivity: undefined }, 'connectivity'],
  ];
  for (const [name, fa, cell] of cases) {
    const got = judge(fa).fails.map(([c]) => c);
    if (cell === null ? got.length !== 0 : !got.includes(cell)) throw new Error(`selfProof: "${name}" gave ${JSON.stringify(got)}`);
  }
  if (judge({ ...ok, zzz: 1 }).strays.join() !== 'zzz') throw new Error('selfProof: a new undeclared key was not caught');
  if (judge({ ...ok, brand: ['x'] }).pending.join() !== 'brand' || judge({ ...ok, brand: ['x'] }).strays.length) throw new Error('selfProof: a pending stray was not classed as pending');
}

// ── STEP 4: readLive ───────────────────────────────────────────────
// IN:  the live dataset, published documents only (no drafts, no versions).
// OUT: every product located under the headphones slice, as { name, fa }.
// TRUST: "in the slice" = its catalogueLocationKeys hold the headphones item or any descendant of it, the same unroll the storefront uses.
async function readLive() {
  const base = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data`;
  const q = `{
    "products": *[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(name asc) { name, catalogueLocationKeys, "fa": filterAttributes },
    "catalogue": *[_type == "catalogueItem"] { _id, "slug": slug.current, "parent": parent._ref }
  }`;
  const res = await fetch(`${base}/query/${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}?query=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` },
  });
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const { products, catalogue } = (await res.json()).result;
  const ids = new Set([catalogue.find((c) => c.slug === 'headphones')._id]);
  for (let grew = true; grew;) {
    grew = false;
    for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) { ids.add(c._id); grew = true; }
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k))).map((p) => ({ name: p.name, fa: p.fa ?? {} }));
}

// ── STEP 5: report ─────────────────────────────────────────────────
// IN:  every headphone's verdict.
// OUT: the screen text, and exit code 1 when any cell fails or any new undeclared key sits there.
selfProof();
console.log('self-proof: every kind of failure is caught.\n');
const hp = await readLive();
const bad = [], pending = {};
let failing = 0;
for (const p of hp) {
  const v = judge(p.fa);
  failing += v.fails.length;
  if (v.fails.length || v.strays.length) bad.push({ name: p.name, ...v });
  for (const k of v.pending) pending[k] = (pending[k] ?? 0) + 1;
}
const cells = hp.length * CELLS.length;
console.log(`${hp.length} headphones x ${CELLS.length} cells = ${cells} cells`);
console.log(`pass ${cells - failing}, fail ${failing}\n`);
for (const b of bad) {
  console.log(b.name);
  for (const [cell, cause] of b.fails) console.log(`  ${cell}: ${cause}`);
  for (const k of b.strays) console.log(`  undeclared key: ${k}`);
  console.log('');
}
const pend = Object.entries(pending).map(([k, n]) => `${k} ${n}`).join(', ');
console.log(`known strays still waiting for removal: ${pend || 'none'}\n`);
console.log(bad.length ? `RESULT: FAIL, ${bad.length} of ${hp.length} headphones` : `RESULT: PASS, ${hp.length} of ${hp.length} headphones`);
if (bad.length) process.exitCode = 1;
