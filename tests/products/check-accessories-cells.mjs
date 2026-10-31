// Accessories cells check
//
// Question: is every one of the 13 cells of every accessory's filterAttributes in its one legal form, with no undeclared key beside them?
// Human-run, reads only. From the repo root:
// node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-accessories-cells.mjs
// Exit 0 = every cell of every accessory passes. Exit 1 = at least one fails; the failing cells are printed. Run it after every data write to accessories.
//
// Why a check and not a lock: the Content Lake does not run schema validation on writes (Sanity docs, "Schema validation and the Content Lake"), so no file in this repo can stop a write.
// This file is the one definition of "uniform"; a data-write script ends by running it.
//
// THE FLOW. Each step is a black box: what goes in, what comes out.
//   1. STRUCTURE   nothing in            -> the 13 cells as data: legal values, and for 11 of them the rule that says when they apply
//   2. judge       one filterAttributes  -> its failing cells and its undeclared keys
//   3. selfProof   fake accessories in   -> throws unless step 2 gives the hand-written verdict on each
//   4. readLive    the live dataset in   -> the published accessories
//   5. report      every verdict in      -> the screen text and the exit code

// ── STEP 1: STRUCTURE ──────────────────────────────────────────────
// Group A applies to every accessory. Group B (has a rule) applies only when its rule says so; otherwise it takes the n/a form:
// [] for a list, false for a yes/no, null for a number or a one-of value. A number that applies may be null: null = "no source publishes this figure".
const TYPES = ['cables-interconnects', 'replacement-parts', 'cases-storage-transport', 'adapters-converters', 'cleaning-maintenance', 'stands-isolation'];
const ANALOG = ['headphone-cable', 'interconnect-rca-xlr'];
const ENUM = (items) => ({ t: 'enum', items });
const LIST = (items) => ({ t: 'list', items });
const NLIST = { t: 'list', num: true };
const NUM = { t: 'num' };
const BOOL = { t: 'bool' };
const top = (k) => (fa) => fa[k];
const gate = (...types) => (fa) => (TYPES.includes(fa.accessoryType) ? types.includes(fa.accessoryType) : null);
// balanced/unbalanced is a property of an analog signal path: it applies to cables whose cableFunction names an analog function.
const analogCable = (fa) => {
  if (!TYPES.includes(fa.accessoryType)) return null;
  if (fa.accessoryType !== 'cables-interconnects') return false;
  return !Array.isArray(fa.cableFunction) || !fa.cableFunction.length ? null : fa.cableFunction.some((x) => ANALOG.includes(x));
};

const CELLS = [
  { id: 'accessoryType', get: top('accessoryType'), def: ENUM(TYPES) },
  { id: 'compatibleProductType', get: top('compatibleProductType'), def: LIST(['headphone', 'speaker', 'amplifier-source', 'universal-any']) },
  { id: 'cableFunction', get: top('cableFunction'), def: LIST(['headphone-cable', 'interconnect-rca-xlr', 'digital-usb-coaxial-optical-aes-ebu-ethernet']), rule: gate('cables-interconnects') },
  { id: 'connectorTermination', get: top('connectorTermination'), def: LIST(['rca', 'xlr', '3.5mm', '2.5mm', '4.4mm', '6.35mm', '4-pin-mini-xlr', 'mini-to-rca', 'usb-a', 'usb-b', 'usb-micro', 'usb-c']), rule: gate('cables-interconnects') },
  { id: 'lengthM', get: top('lengthM'), def: NLIST, rule: gate('cables-interconnects') },
  { id: 'conductorMaterial', get: top('conductorMaterial'), def: LIST(['copper-ofc', 'silver', 'silver-plated-copper']), rule: gate('cables-interconnects') },
  { id: 'balancedUnbalanced', get: top('balancedUnbalanced'), def: LIST(['balanced', 'unbalanced']), rule: analogCable },
  { id: 'material', get: top('material'), def: LIST(['wood', 'metal', 'acrylic', 'composite-mdf']), rule: gate('stands-isolation') },
  { id: 'adjustableHeight', get: top('adjustableHeight'), def: BOOL, rule: gate('stands-isolation') },
  { id: 'weightCapacityKg', get: top('weightCapacityKg'), def: NUM, rule: gate('stands-isolation') },
  { id: 'partType', get: top('partType'), def: ENUM(['ear-pads-cushions', 'ear-tips']), rule: gate('replacement-parts') },
  { id: 'compatibility', get: top('compatibility'), def: LIST(null), rule: gate('replacement-parts') },
  { id: 'adapterFunction', get: top('adapterFunction'), def: LIST(['bluetooth-transmitter-receiver', 'headphone-impedance-attenuator-adapter', 'connector-adapter', 'standalone-phono-preamp', 'usb-dac-dongle', 'usb-noise-filter']), rule: gate('adapters-converters') },
];
// Keys that may sit beside the cells: none. PENDING are known strays whose removal waits for a production deploy; delete them from this list when they are gone from the data.
const ALLOWED = new Set(CELLS.map((c) => c.id));
const PENDING = new Set([]);
// OPEN are cells that apply but whose value no source publishes and whose form is a list (a number may be null, a list may not). [accessory name, cell].
// Each is reported as open, not as a failure. Delete an entry when its cell is filled.
const OPEN = [
  ['ALO audio Reference 8 | Mini to Mini Cable', 'lengthM'],
  ['Dekoni Audio Ensemble Post-Split Nylon Wrapped Cable with Single 3-pin Mini XLR', 'lengthM'],
  ['Etched Headphone Cable', 'conductorMaterial'],
  ['Etched Headphone Cable for Sennheiser HD 600 Series', 'conductorMaterial'],
];

// ── STEP 2: judge ──────────────────────────────────────────────────
// IN:  one product's filterAttributes (an object, possibly empty).
// OUT: { fails: [[cell, cause], ...], strays: [key, ...], pending: [key, ...] }.
// TRUST: a cell that applies must hold a legal value (a number may be null); a cell that does not apply must hold exactly its n/a form;
//        a cell whose rule input is unusable cannot be judged and fails. Nothing is skipped.
const kindOk = (d, v) => (d.t === 'enum' ? typeof v === 'string' : d.t === 'list' ? Array.isArray(v) : d.t === 'num' ? typeof v === 'number' && Number.isFinite(v) : typeof v === 'boolean');
function judgeApplies(d, v) {
  if (v === undefined) return 'key missing';
  if (v === null) return d.t === 'num' ? null : d.t === 'list' ? 'null (a list is [] when empty)' : 'null where a value is required';
  if (!kindOk(d, v)) return 'wrong form';
  if (d.t === 'enum') return d.items.includes(v) ? null : 'illegal value';
  if (d.t === 'list') return v.length === 0 ? '[] where a value is required' : v.every((x) => (d.num ? typeof x === 'number' && Number.isFinite(x) : typeof x === 'string' && (!d.items || d.items.includes(x)))) ? null : 'illegal value';
  return null;
}
function judgeNA(d, v) {
  if (v === undefined) return 'key missing';
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
// IN:  fake accessories that are uniform, and copies of them broken one way each.
// OUT: throws unless each uniform one passes and every broken one fails in exactly the named cell.
// TRUST: a check that cannot fail proves nothing; this shows each kind of failure is caught before the live data is trusted.
function selfProof() {
  const cable = {
    accessoryType: 'cables-interconnects', compatibleProductType: ['headphone'], cableFunction: ['headphone-cable'], connectorTermination: ['3.5mm'],
    lengthM: [1.2, 2], conductorMaterial: ['copper-ofc'], balancedUnbalanced: ['unbalanced'], material: [], adjustableHeight: false, weightCapacityKg: null,
    partType: null, compatibility: [], adapterFunction: [],
  };
  const stand = {
    ...cable, accessoryType: 'stands-isolation', cableFunction: [], connectorTermination: [], lengthM: [], conductorMaterial: [], balancedUnbalanced: [],
    material: ['wood'], adjustableHeight: true, weightCapacityKg: null,
  };
  const digital = { ...cable, cableFunction: ['digital-usb-coaxial-optical-aes-ebu-ethernet'], connectorTermination: ['usb-a', 'usb-b'], balancedUnbalanced: [] };
  const cases = [
    ['a uniform cable passes', cable, null],
    ['a uniform stand passes (null capacity = no figure)', stand, null],
    ['a uniform digital cable passes (no balanced/unbalanced)', digital, null],
    ['key missing', (() => { const c = { ...cable }; delete c.cableFunction; return c; })(), 'cableFunction'],
    ['illegal value', { ...cable, connectorTermination: ['bnc'] }, 'connectorTermination'],
    ['empty list where a value is required', { ...cable, cableFunction: [] }, 'cableFunction'],
    ['null where a list is required', { ...cable, lengthM: null }, 'lengthM'],
    ['string where a number is required', { ...cable, lengthM: ['1.5'] }, 'lengthM'],
    ['value where the rule says n/a', { ...cable, compatibility: ['VAC Pro'] }, 'compatibility'],
    ['n/a yes/no holding true', { ...cable, adjustableHeight: true }, 'adjustableHeight'],
    ['n/a number holding a figure', { ...cable, weightCapacityKg: 2 }, 'weightCapacityKg'],
    ['balanced/unbalanced on a digital cable', { ...digital, balancedUnbalanced: ['balanced'] }, 'balancedUnbalanced'],
    ['balanced/unbalanced empty on an analog cable', { ...cable, balancedUnbalanced: [] }, 'balancedUnbalanced'],
    ['rule input unusable', { ...cable, accessoryType: 'gadget' }, 'accessoryType'],
  ];
  for (const [name, fa, cell] of cases) {
    const got = judge(fa).fails.map(([c]) => c);
    if (cell === null ? got.length !== 0 : !got.includes(cell)) throw new Error(`selfProof: "${name}" gave ${JSON.stringify(got)}`);
  }
  if (judge({ ...cable, zzz: 1 }).strays.join() !== 'zzz') throw new Error('selfProof: a new undeclared key was not caught');
  if (judge({ ...cable, brand: ['x'] }).strays.join() !== 'brand') throw new Error('selfProof: a returning brand copy was not caught');
}

// ── STEP 4: readLive ───────────────────────────────────────────────
// IN:  the live dataset, published documents only (no drafts, no versions).
// OUT: every product located under the accessories slice, as { name, fa }.
// TRUST: "in the slice" = its catalogueLocationKeys hold the accessories item or any descendant of it, the same unroll the storefront uses.
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
  const ids = new Set([catalogue.find((c) => c.slug === 'accessories')._id]);
  for (let grew = true; grew;) {
    grew = false;
    for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) { ids.add(c._id); grew = true; }
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k))).map((p) => ({ name: p.name, fa: p.fa ?? {} }));
}

// ── STEP 5: report ─────────────────────────────────────────────────
// IN:  every accessory's verdict.
// OUT: the screen text, and exit code 1 when any cell fails (other than the OPEN ones) or any new undeclared key sits there.
selfProof();
console.log('self-proof: every kind of failure is caught.\n');
const acc = await readLive();
const isOpen = (name, cell) => OPEN.some(([n, c]) => n === name && c === cell);
const bad = [], open = [], pending = {};
let failing = 0;
for (const p of acc) {
  const v = judge(p.fa);
  const fails = v.fails.filter(([cell]) => !isOpen(p.name, cell));
  for (const [cell, cause] of v.fails) if (isOpen(p.name, cell)) open.push(`${p.name}: ${cell} (${cause})`);
  failing += fails.length;
  if (fails.length || v.strays.length) bad.push({ name: p.name, fails, strays: v.strays });
  for (const k of v.pending) pending[k] = (pending[k] ?? 0) + 1;
}
const cells = acc.length * CELLS.length;
console.log(`${acc.length} accessories x ${CELLS.length} cells = ${cells} cells`);
console.log(`pass ${cells - failing - open.length}, fail ${failing}, open ${open.length}\n`);
for (const b of bad) {
  console.log(b.name);
  for (const [cell, cause] of b.fails) console.log(`  ${cell}: ${cause}`);
  for (const k of b.strays) console.log(`  undeclared key: ${k}`);
  console.log('');
}
if (open.length) console.log(`open cells (no source publishes the value):\n${open.map((o) => `  ${o}`).join('\n')}\n`);
const pend = Object.entries(pending).map(([k, n]) => `${k} ${n}`).join(', ');
console.log(`known strays still waiting for removal: ${pend || 'none'}\n`);
console.log(bad.length ? `RESULT: FAIL, ${bad.length} of ${acc.length} accessories` : `RESULT: PASS, ${acc.length} of ${acc.length} accessories`);
if (bad.length) process.exitCode = 1;
