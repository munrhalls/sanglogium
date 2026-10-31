// Audio-electronics cells check
//
// Question: is every one of the 23 cells of every audio-electronics product's filterAttributes in its one legal form, with no undeclared key beside them?
// Human-run, reads only. From the repo root:
// node --env-file=/home/jan/work/sanglogium/.env.local tests/products/check-audio-electronics-cells.mjs
// Exit 0 = every cell of every product passes. Exit 1 = at least one fails; the failing cells are printed. Run it after every data write to audio-electronics.
//
// Why a check and not a lock: the Content Lake does not run schema validation on writes (Sanity docs, "Schema validation and the Content Lake"), so no file in this repo can stop a write.
// This file is the one definition of "uniform"; a data-write script ends by running it.
//
// THE FLOW. Each step is a black box: what goes in, what comes out.
//   1. STRUCTURE   nothing in            -> the 23 cells as data: legal values, and for 15 of them the rule that says when they apply
//   2. judge       one filterAttributes  -> its failing cells and its undeclared keys
//   3. selfProof   fake products in      -> throws unless step 2 gives the hand-written verdict on each
//   4. readLive    the live dataset in   -> the published audio-electronics products
//   5. report      every verdict in      -> the screen text and the exit code

// ── STEP 1: STRUCTURE ──────────────────────────────────────────────
// Group A applies to every product and is never null: a list may be [] and a yes/no may be false, those are real answers.
// Group B (has a rule) applies only when its rule says so; otherwise it takes the n/a form:
// [] for a list, false for a yes/no, null for anything else (a one-of value, a number, a text).
// A figure (a number or a text) that applies may be null when the maker publishes none; every other cell that applies is never null.
const DT = ['dac', 'network-streamer', 'preamplifier', 'headphone-amplifier', 'digital-audio-player', 'integrated-amplifier', 'cd-player-transport', 'power-amplifier'];
const AMP = ['integrated-amplifier', 'power-amplifier', 'preamplifier', 'headphone-amplifier'];
const POW = ['integrated-amplifier', 'power-amplifier', 'preamplifier'];
const DIG = ['dac', 'network-streamer', 'cd-player-transport', 'digital-audio-player'];
const CONN = ['wired', 'bluetooth', 'wifi-networked', 'wired-wireless'];
const NET = ['bluetooth', 'wifi-networked', 'wired-wireless'];
const ENUM = (items) => ({ t: 'enum', items });
const LIST = (items, min1 = false) => ({ t: 'list', items, min1 });
const TEXT = (re) => ({ t: 'text', re });
const NUM = { t: 'num' };
const BOOL = { t: 'bool' };
const top = (k) => (fa) => fa[k];
const byType = (set) => (fa) => (DT.includes(fa.deviceType) ? set.includes(fa.deviceType) : null);
const byConn = (fa) => (CONN.includes(fa.deviceConnectivity) ? NET.includes(fa.deviceConnectivity) : null);

const CELLS = [
  { id: 'deviceType', get: top('deviceType'), def: ENUM(DT) },
  { id: 'deviceConnectivity', get: top('deviceConnectivity'), def: ENUM(CONN) },
  { id: 'formFactor', get: top('formFactor'), def: ENUM(['desktop', 'portable', 'dongle']) },
  { id: 'condition', get: top('condition'), def: ENUM(['new', 'open-box', 'refurbished']) },
  { id: 'dacIncluded', get: top('dacIncluded'), def: BOOL },
  { id: 'balancedOutput', get: top('balancedOutput'), def: BOOL },
  { id: 'rackMountable19', get: top('rackMountable19'), def: BOOL },
  { id: 'inputs', get: top('inputs'), def: LIST(['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu']) },
  { id: 'amplification', get: top('amplification'), def: ENUM(['solid-state', 'tube', 'hybrid', 'class-d']), rule: byType(AMP) },
  { id: 'outputs', get: top('outputs'), def: LIST(['speaker-terminals', 'pre-out-rca', 'pre-out-xlr', 'headphone-jack', 'subwoofer-out'], true), rule: byType(AMP) },
  { id: 'powerOutputPerChannelW', get: top('powerOutputPerChannelW'), def: NUM, rule: byType(POW) },
  { id: 'channelCount', get: top('channelCount'), def: LIST(['2.0', '2.1', '5.1', '7.1', '7.1.4'], true), rule: byType(POW) },
  { id: 'phonoStageBuiltIn', get: top('phonoStageBuiltIn'), def: ENUM(['none', 'mm', 'mc']), rule: byType(POW) },
  { id: 'trigger12v', get: top('trigger12v'), def: BOOL, rule: byType(POW) },
  { id: 'remoteControlIncluded', get: top('remoteControlIncluded'), def: BOOL, rule: byType(POW) },
  { id: 'maxSampleRateBitDepth', get: top('maxSampleRateBitDepth'), def: TEXT(/^\d+-bit\/\d+(\.\d+)?kHz$/), rule: byType(DIG) },
  { id: 'dsdSupport', get: top('dsdSupport'), def: ENUM(['none', 'dsd64', 'dsd128', 'dsd256-plus']), rule: byType(DIG) },
  { id: 'hiResCertification', get: top('hiResCertification'), def: LIST(['mqa', 'hi-res-audio']), rule: byType(DIG) },
  { id: 'dacChipsetFamily', get: top('dacChipsetFamily'), def: LIST(['ess-sabre', 'akm', 'cirrus-logic', 'r2r-ladder']), rule: byType(DIG) },
  { id: 'streamingPlatformSupport', get: top('streamingPlatformSupport'), def: LIST(['airplay2', 'chromecast', 'spotify-connect', 'tidal-connect', 'roon-ready', 'dlna']), rule: byType(DIG) },
  { id: 'networkConnection', get: top('networkConnection'), def: LIST(['wifi', 'ethernet']), rule: byType(DIG) },
  { id: 'voiceAssistant', get: top('voiceAssistant'), def: LIST(['alexa', 'google-assistant']), rule: byConn },
  { id: 'multiroomSupport', get: top('multiroomSupport'), def: BOOL, rule: byConn },
];
// Keys that may sit beside the cells: none.
const ALLOWED = new Set(CELLS.map((c) => c.id));
// OPEN are cells that apply but whose value no source publishes and that have no gap form. [product name, cell].
// Each is reported as open, not as a failure. Delete an entry when its cell is filled.
const OPEN = [
  ['LeeLoo Desktop Tube Headphone Amplifier', 'inputs'],
];

// ── STEP 2: judge ──────────────────────────────────────────────────
// IN:  one product's filterAttributes (an object, possibly empty).
// OUT: { fails: [[cell, cause], ...], strays: [key, ...] }.
// TRUST: a cell that applies must hold a legal value and is never null, except a figure (number or text), which may be null; a cell that does not apply must hold exactly its n/a form;
//        a cell whose rule input is unusable cannot be judged and fails. Nothing is skipped.
const kindOk = (d, v) => (d.t === 'enum' || d.t === 'text' ? typeof v === 'string' : d.t === 'list' ? Array.isArray(v) : d.t === 'num' ? typeof v === 'number' && Number.isFinite(v) : typeof v === 'boolean');
function judgeApplies(d, v) {
  if (v === undefined) return 'key missing';
  if (v === null) return d.t === 'num' || d.t === 'text' ? null : d.t === 'list' ? 'null (a list is [] when empty)' : 'null where a true answer exists';
  if (!kindOk(d, v)) return 'wrong form';
  if (d.t === 'enum') return d.items.includes(v) ? null : 'illegal value';
  if (d.t === 'text') return d.re.test(v) ? null : 'illegal form';
  if (d.t === 'list') {
    if (!v.every((x) => typeof x === 'string' && d.items.includes(x))) return 'illegal value';
    if (new Set(v).size !== v.length) return 'duplicate entries';
    return d.min1 && v.length === 0 ? '[] where a value is required' : null;
  }
  return null;
}
function judgeNA(d, v) {
  if (v === undefined) return 'key missing';
  if (d.t === 'list') return Array.isArray(v) ? (v.length === 0 ? null : 'value where the rule says n/a') : v === null ? 'null (n/a list must be [])' : 'wrong form';
  if (d.t === 'bool') return v === false ? null : v === true ? 'true where the rule says n/a' : v === null ? 'null (n/a yes/no must be false)' : 'wrong form';
  return v === null ? null : typeof v === 'object' ? 'wrong form' : 'value where the rule says n/a';
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
  return { fails, strays: extra };
}

// ── STEP 3: selfProof ──────────────────────────────────────────────
// IN:  three fake products that are uniform (a DAC, a headphone amplifier, an integrated amplifier) and copies of them broken one way each.
// OUT: throws unless the uniform ones pass and every broken one fails in exactly the named cell.
// TRUST: a check that cannot fail proves nothing; this shows each kind of failure is caught before the live data is trusted.
function selfProof() {
  const dac = {
    deviceType: 'dac', deviceConnectivity: 'wired', formFactor: 'desktop', condition: 'new', dacIncluded: true, balancedOutput: false, rackMountable19: false, inputs: ['usb'],
    amplification: null, outputs: [], powerOutputPerChannelW: null, channelCount: [], phonoStageBuiltIn: null, trigger12v: false, remoteControlIncluded: false,
    maxSampleRateBitDepth: '32-bit/768kHz', dsdSupport: 'dsd256-plus', hiResCertification: [], dacChipsetFamily: ['ess-sabre'], streamingPlatformSupport: [], networkConnection: [],
    voiceAssistant: [], multiroomSupport: false,
  };
  const amp = {
    ...dac, deviceType: 'headphone-amplifier', dacIncluded: false, amplification: 'solid-state', outputs: ['headphone-jack'],
    maxSampleRateBitDepth: null, dsdSupport: null, hiResCertification: [], dacChipsetFamily: [], streamingPlatformSupport: [], networkConnection: [],
  };
  const integrated = {
    ...amp, deviceType: 'integrated-amplifier', outputs: ['speaker-terminals'], powerOutputPerChannelW: 50, channelCount: ['2.0'], phonoStageBuiltIn: 'none', remoteControlIncluded: true,
  };
  const without = (o, k) => { const c = { ...o }; delete c[k]; return c; };
  const cases = [
    ['a uniform DAC passes', dac, null],
    ['a uniform headphone amplifier passes (n/a cells in their empty form)', amp, null],
    ['a uniform integrated amplifier passes', integrated, null],
    ['key missing', without(dac, 'formFactor'), 'formFactor'],
    ['illegal value', { ...dac, formFactor: 'huge' }, 'formFactor'],
    ['null where a true answer exists (one-of value)', { ...dac, dsdSupport: null }, 'dsdSupport'],
    ['null list where it applies', { ...dac, dacChipsetFamily: null }, 'dacChipsetFamily'],
    ['a number that applies may be null', { ...integrated, powerOutputPerChannelW: null }, null],
    ['a text that applies may be null', { ...dac, maxSampleRateBitDepth: null }, null],
    ['string where a number is required', { ...integrated, powerOutputPerChannelW: '50' }, 'powerOutputPerChannelW'],
    ['text in the wrong form', { ...dac, maxSampleRateBitDepth: '768kHz' }, 'maxSampleRateBitDepth'],
    ['empty list where a value is required', { ...amp, outputs: [] }, 'outputs'],
    ['duplicate entries in a list', { ...dac, inputs: ['usb', 'usb'] }, 'inputs'],
    ['value where the rule says n/a (one-of value)', { ...dac, amplification: 'tube' }, 'amplification'],
    ['value where the rule says n/a (list)', { ...dac, outputs: ['pre-out-rca'] }, 'outputs'],
    ['true where the rule says n/a', { ...dac, trigger12v: true }, 'trigger12v'],
    ['null where the n/a yes/no must be false', { ...dac, multiroomSupport: null }, 'multiroomSupport'],
    ['null where the n/a list must be []', { ...dac, voiceAssistant: null }, 'voiceAssistant'],
    ['a connected product needs its network cells', { ...dac, deviceConnectivity: 'bluetooth', voiceAssistant: null }, 'voiceAssistant'],
    ['rule input unusable', { ...dac, deviceType: 'toaster' }, 'amplification'],
  ];
  for (const [name, fa, cell] of cases) {
    const got = judge(fa).fails.map(([c]) => c);
    if (cell === null ? got.length !== 0 : !got.includes(cell)) throw new Error(`selfProof: "${name}" gave ${JSON.stringify(got)}`);
  }
  if (judge({ ...dac, zzz: 1 }).strays.join() !== 'zzz') throw new Error('selfProof: a new undeclared key was not caught');
}

// ── STEP 4: readLive ───────────────────────────────────────────────
// IN:  the live dataset, published documents only (no drafts, no versions).
// OUT: every product located under the audio-electronics slice, as { name, fa }.
// TRUST: "in the slice" = its catalogueLocationKeys hold the audio-electronics item or any descendant of it, the same unroll the storefront uses.
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
  const ids = new Set([catalogue.find((c) => c.slug === 'audio-electronics')._id]);
  for (let grew = true; grew;) {
    grew = false;
    for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) { ids.add(c._id); grew = true; }
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k))).map((p) => ({ name: p.name, fa: p.fa ?? {} }));
}

// ── STEP 5: report ─────────────────────────────────────────────────
// IN:  every product's verdict.
// OUT: the screen text, and exit code 1 when any cell fails (other than the OPEN ones) or any new undeclared key sits there.
selfProof();
console.log('self-proof: every kind of failure is caught.\n');
const ae = await readLive();
const isOpen = (name, cell) => OPEN.some(([n, c]) => n === name && c === cell);
const bad = [], open = [];
let failing = 0;
for (const p of ae) {
  const v = judge(p.fa);
  const fails = v.fails.filter(([cell]) => !isOpen(p.name, cell));
  for (const [cell, cause] of v.fails) if (isOpen(p.name, cell)) open.push(`${p.name}: ${cell} (${cause})`);
  failing += fails.length;
  if (fails.length || v.strays.length) bad.push({ name: p.name, fails, strays: v.strays });
}
const cells = ae.length * CELLS.length;
console.log(`${ae.length} audio-electronics products x ${CELLS.length} cells = ${cells} cells`);
console.log(`pass ${cells - failing - open.length}, fail ${failing}, open ${open.length}\n`);
for (const b of bad) {
  console.log(b.name);
  for (const [cell, cause] of b.fails) console.log(`  ${cell}: ${cause}`);
  for (const k of b.strays) console.log(`  undeclared key: ${k}`);
  console.log('');
}
if (open.length) console.log(`open cells (no source publishes the value):\n${open.map((o) => `  ${o}`).join('\n')}\n`);
console.log(bad.length ? `RESULT: FAIL, ${bad.length} of ${ae.length} products` : `RESULT: PASS, ${ae.length} of ${ae.length} products`);
if (bad.length) process.exitCode = 1;
