// Step 6 of the audio-electronics-attrs sequence (sanglogium-todo.md): writes the group A cells (they apply to every product) that hold no legal value,
// from the fills-*.json files next to this script.
// Delete this folder once it has run (git history is the archive).
// Default is a DRY RUN (reads only). --apply writes: ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// Refused (nothing written) when a fill is illegal, has no source URL, targets a cell that already holds a legal value or is not a group A cell,
// or when a product in a fill leaves a gap neither set nor marked in unresolvedCells.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const ENUM = (items) => ({ t: 'enum', items }), LIST = (items, min1 = false) => ({ t: 'list', items, min1 }), BOOL = { t: 'bool' }
// the group A cells that can be gaps (deviceType, deviceConnectivity and condition are complete); same legal values as audio-electronics-cellcheck.mjs
const A = {
  formFactor: ENUM(['desktop', 'portable', 'dongle']),
  dacIncluded: BOOL,
  balancedOutput: BOOL,
  rackMountable19: BOOL,
  inputs: LIST(['usb', 'optical', 'coaxial', 'rca', 'bluetooth', 'xlr-balanced', 'phono-mm-mc', 'hdmi-earc', 'ethernet-lan', 'i2s-iis', 'aes-ebu']),
}
const kindOk = (d, v) => (d.t === 'enum' ? typeof v === 'string' : d.t === 'list' ? Array.isArray(v) : typeof v === 'boolean')
// null when v is a legal answer, else the reason it is not (a gap)
function judge(d, v) {
  if (v === undefined) return 'key missing'
  if (v === null) return 'null'
  if (!kindOk(d, v)) return 'wrong form'
  if (d.t === 'enum') return d.items.includes(v) ? null : 'illegal value'
  if (d.t === 'list') {
    if (!v.every((x) => typeof x === 'string' && d.items.includes(x))) return 'illegal value'
    if (new Set(v).size !== v.length) return 'duplicate entries'
    return d.min1 && v.length === 0 ? '[] where a value is required' : null
  }
  return null
}
const gapsOf = (fa) => Object.entries(A).filter(([cell, d]) => judge(d, fa[cell]) !== null).map(([cell]) => cell)
const canon = (v) => (Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v))
const without = (fa, cells) => canon(Object.fromEntries(Object.entries(fa ?? {}).filter(([k]) => !cells.includes(k))))

// 1. the fills
const files = fs.readdirSync(here).filter((f) => /^fills-.+\.json$/.test(f)).sort()
if (!files.length) throw new Error('no fills-*.json next to this script')
const fills = []
for (const f of files) for (const x of JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')).fills) fills.push({ ...x, file: f })

// 2. the live data
const query = `{
  "products": *[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id asc) { _id, _rev, name, catalogueLocationKeys, "fa": filterAttributes },
  "catalogue": *[_type == "catalogueItem"] { _id, "slug": slug.current, "parent": parent._ref }
}`
async function read() {
  const res = await fetch(`${base}/query/${ds}?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` } })
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${await res.text()}`)
  return (await res.json()).result
}
function aeOf({ products, catalogue }) {
  const ids = new Set([catalogue.find((c) => c.slug === 'audio-electronics')._id])
  let grew = true
  while (grew) {
    grew = false
    for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) (ids.add(c._id), (grew = true))
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k)))
}
const ae = aeOf(await read())
const byId = new Map(ae.map((p) => [p._id, p]))

// 3. check every fill
const errors = [], unresolved = [], plan = []
const seen = new Set()
for (const fill of fills) {
  const tag = `${fill.file} ${fill.name ?? fill.id}`
  const p = byId.get(fill.id)
  if (!p) { errors.push(`${tag}: not an audio-electronics product id`); continue }
  if (seen.has(fill.id)) errors.push(`${tag}: appears in two fills`)
  seen.add(fill.id)
  const gaps = gapsOf(p.fa ?? {})
  const set = fill.set ?? {}, open = fill.unresolvedCells ?? {}
  for (const cell of Object.keys(set)) {
    const d = A[cell]
    if (!d) { errors.push(`${tag}: ${cell} is not a group A cell that can be filled`); continue }
    if (!gaps.includes(cell)) { errors.push(`${tag}: ${cell} is not a gap (it already holds a legal value)`); continue }
    const bad = judge(d, set[cell])
    if (bad) { errors.push(`${tag}: ${cell} illegal value ${JSON.stringify(set[cell])} (${bad})`); continue }
    const src = (fill.sources ?? []).find((s) => s.cell === cell)
    if (!src || !/^https?:\/\//.test(src.url ?? '')) errors.push(`${tag}: ${cell} has no source URL`)
  }
  for (const [cell, why] of Object.entries(open)) {
    if (!gaps.includes(cell)) errors.push(`${tag}: ${cell} is marked unresolved but is not a gap`)
    else if (cell in set) errors.push(`${tag}: ${cell} is both set and unresolved`)
    else if (!String(why ?? '').trim()) errors.push(`${tag}: ${cell} unresolved without a reason`)
    else unresolved.push(`${p.name}: ${cell}: ${why}`)
  }
  for (const cell of gaps) if (!(cell in set) && !(cell in open)) errors.push(`${tag}: ${cell} is a gap, neither set nor marked unresolved`)
  if (Object.keys(set).length) plan.push({ p, set })
}
const covered = new Set(fills.map((f) => f.id))
const notCovered = ae.filter((p) => !covered.has(p._id) && gapsOf(p.fa ?? {}).length)

// 4. report
const nCells = plan.reduce((a, x) => a + Object.keys(x.set).length, 0)
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${files.length} fills file(s), ${fills.length} products, ${nCells} cells set on ${plan.length} products`)
const byField = {}
for (const { set } of plan) for (const [cell, v] of Object.entries(set)) { const k = JSON.stringify(v).slice(0, 40); ((byField[cell] ??= {})[k] = (byField[cell][k] ?? 0) + 1) }
console.log(`\nSET (value: products)`)
for (const [cell, vs] of Object.entries(byField)) console.log(`  ${cell.padEnd(18)} ${Object.entries(vs).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v, n]) => `${v}: ${n}`).join(' | ')}`)
console.log(`\nleft open by the executors: ${unresolved.length}${unresolved.map((e) => `\n  ${e}`).join('')}`)
console.log(`\nproducts with gaps that no fill covers: ${notCovered.length}${notCovered.map((p) => `\n  ${p.name}: ${gapsOf(p.fa ?? {}).join(', ')}`).join('')}`)
console.log(`\nfill errors: ${errors.length}${errors.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: fix the fills first.'); process.exit(1) }
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }

// 5. ONE transaction guarded by the revisions read above
const mutations = plan.map(({ p, set }) => ({ patch: { id: p._id, ifRevisionID: p._rev, set: Object.fromEntries(Object.entries(set).map(([cell, v]) => [`filterAttributes.${cell}`, v])) } }))
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} patches`)

// 6. re-read and check, on audio-electronics only (other slices' steps may be writing at the same time)
const reAe = aeOf(await read())
const reById = new Map(reAe.map((p) => [p._id, p]))
const bad = []
const touched = new Set(plan.map((x) => x.p._id))
for (const { p, set } of plan) {
  const a = reById.get(p._id)
  for (const [cell, v] of Object.entries(set)) if (canon(a?.fa?.[cell]) !== canon(v)) bad.push(`${p._id}: ${cell} is ${canon(a?.fa?.[cell])}, wanted ${canon(v)}`)
  if (without(p.fa, Object.keys(set)) !== without(a?.fa, Object.keys(set))) bad.push(`${p._id}: other filterAttributes changed`)
}
for (const p of ae) if (!touched.has(p._id) && canon(p.fa) !== canon(reById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
if (reAe.length !== ae.length) bad.push('audio-electronics product count changed')
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${plan.length} products changed exactly as planned; every other filterAttributes value identical; ${reAe.length} audio-electronics products.`)
