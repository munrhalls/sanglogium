// Step 5b: sets the 7 headphones cells that needed a new option-list member.
//   6 electrostatic / Lemo headphones: cableTermination = ['pro-bias'] or ['lemo'] (new list members).
//   Sennheiser RS 175 (digital RF, not Bluetooth): connectivity = 'rf-wireless' (new list member), bluetoothCodecs = [].
// Refuses (writes nothing) if a product is not what this script expects. Without --apply it only prints the plan.
// --apply: ONE transaction, each patch guarded by the revision read here, then a re-read that checks the result.
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const TERMINATIONS = ['3.5mm', '2.5mm-balanced', '4.4mm-balanced', '4-pin-xlr', '6.35mm', 'usb-c', 'mmcx', '2-pin', 'fixed-cable', 'pro-bias', 'lemo']
const CONNECTIVITY = ['wired', 'wireless', 'true-wireless', 'hybrid', 'rf-wireless']

const CABLE = [
  ['DZc43yHr6ydfgE7zB460aC', 'Audeze CRBN2 Electrostatic Headphones (Case Included)', ['pro-bias']],
  ['xMEqvkRBbdrlJXyFG8kmvh', 'ES Lab ES-2a 90mm Electrostatic Headphones', ['pro-bias']],
  ['xMEqvkRBbdrlJXyFG8ko41', 'ES Lab EX-1a Electrostatic Headphones', ['pro-bias']],
  ['GPjMdcfFWZVrKyR2PB9jN4', 'ES Lab EX-1a Electrostatic Headphones (Apos Certified)', ['pro-bias']],
  ['MrEMtYwMtrFDGWmRnTDDVo', 'Warwick Acoustics Bravura Headphones', ['lemo']],
  ['PHPYj28HJdPDHAaIBDrPvO', 'Warwick Acoustics Bravura Headphones - Open Box', ['lemo']],
]
const RS175 = ['MrEMtYwMtrFDGWmRnQTeER', 'Sennheiser RS 175 Headphones']

async function read() {
  const q = '*[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id asc) { _id, _rev, name, "fa": filterAttributes }'
  const res = await fetch(`${base}/query/${ds}?query=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` } })
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${await res.text()}`)
  return (await res.json()).result
}
const isEmpty = (v) => v === undefined || v === null || (Array.isArray(v) && v.length === 0)

const before = await read()
const byId = new Map(before.map((p) => [p._id, p]))
const plan = [] // { p, sets }
const errors = []

for (const [id, name, term] of CABLE) {
  const p = byId.get(id)
  if (!p) { errors.push(`${id}: not found`); continue }
  if (p.name !== name) errors.push(`${id}: name is "${p.name}", expected "${name}"`)
  if (!['wired', 'hybrid'].includes(p.fa?.connectivity)) errors.push(`${name}: connectivity is ${JSON.stringify(p.fa?.connectivity)}, the cable rule needs wired or hybrid`)
  if (!isEmpty(p.fa?.cableTermination)) errors.push(`${name}: cableTermination already holds ${JSON.stringify(p.fa.cableTermination)}`)
  if (!term.every((t) => TERMINATIONS.includes(t))) errors.push(`${name}: ${JSON.stringify(term)} is not in the option list`)
  plan.push({ p, sets: { 'filterAttributes.cableTermination': term } })
}
{
  const [id, name] = RS175
  const p = byId.get(id)
  if (!p) errors.push(`${id}: not found`)
  else {
    if (p.name !== name) errors.push(`${id}: name is "${p.name}", expected "${name}"`)
    if (p.fa?.connectivity !== 'wireless') errors.push(`${name}: connectivity is ${JSON.stringify(p.fa?.connectivity)}, expected "wireless"`)
    if (!isEmpty(p.fa?.bluetoothCodecs)) errors.push(`${name}: bluetoothCodecs already holds ${JSON.stringify(p.fa.bluetoothCodecs)}`)
    if (!CONNECTIVITY.includes('rf-wireless')) errors.push('rf-wireless is not in the option list')
    plan.push({ p, sets: { 'filterAttributes.connectivity': 'rf-wireless', 'filterAttributes.bluetoothCodecs': [] } })
  }
}

console.log(`${apply ? 'APPLY' : 'PLAN'}: ${plan.length} products, ${before.length} products read`)
for (const { p, sets } of plan) console.log(`  ${p.name}: ${JSON.stringify(sets)}`)
console.log(`errors: ${errors.length}${errors.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: nothing was written.'); process.exit(1) }
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }

const mutations = plan.map(({ p, sets }) => ({ patch: { id: p._id, ifRevisionID: p._rev, set: sets } }))
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} patches`)

const after = await read()
const afterById = new Map(after.map((p) => [p._id, p]))
const bad = []
for (const { p, sets } of plan) {
  const a = afterById.get(p._id)
  const keys = Object.keys(sets).map((k) => k.replace('filterAttributes.', ''))
  for (const k of keys) if (JSON.stringify(a?.fa?.[k]) !== JSON.stringify(sets[`filterAttributes.${k}`])) bad.push(`${p.name}: ${k} is ${JSON.stringify(a?.fa?.[k])}`)
  const rest = (fa) => JSON.stringify(Object.fromEntries(Object.entries(fa ?? {}).filter(([k]) => !keys.includes(k))))
  if (rest(p.fa) !== rest(a?.fa)) bad.push(`${p.name}: other filterAttributes changed`)
}
for (const p of before) if (!plan.some((x) => x.p._id === p._id) && JSON.stringify(p.fa) !== JSON.stringify(afterById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
if (after.length !== before.length) bad.push('product count changed')
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${plan.length} products set; every other filterAttributes value identical; ${after.length} products.`)
