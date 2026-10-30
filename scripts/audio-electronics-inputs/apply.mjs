// Step 4 of the audio-electronics-attrs sequence (sanglogium-todo.md): writes the sourced `deviceType` / `deviceConnectivity` fills from the
// fills-*.json files next to this script, then empties every gated cell whose gate says "doesn't apply" but that holds a value.
// Delete this folder once it has run (git history is the archive).
// Default is a DRY RUN (reads only). --apply writes: ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// --apply is refused while any audio-electronics product still has an unusable rule input (the step 4 done condition).
// A product the executors marked "unresolved" is reported and does not block: it needs a decision that is not a fill.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const DT = ['dac', 'network-streamer', 'preamplifier', 'headphone-amplifier', 'digital-audio-player', 'integrated-amplifier', 'cd-player-transport', 'power-amplifier']
const AMP = ['integrated-amplifier', 'power-amplifier', 'preamplifier', 'headphone-amplifier'], POW = ['integrated-amplifier', 'power-amplifier', 'preamplifier'], DIG = ['dac', 'network-streamer', 'cd-player-transport', 'digital-audio-player']
const CONN = ['wired', 'bluetooth', 'wifi-networked', 'wired-wireless'], NET = ['bluetooth', 'wifi-networked', 'wired-wireless']
// the only cells a step 4 fill may touch, and what a legal value looks like
const LEGAL = { deviceType: (v) => DT.includes(v), deviceConnectivity: (v) => CONN.includes(v) }
// the gated cells: which rule input gates them, the values it lets through, and the form of "doesn't apply"
const GATED = {
  amplification: ['deviceType', AMP, null], outputs: ['deviceType', AMP, []],
  powerOutputPerChannelW: ['deviceType', POW, null], channelCount: ['deviceType', POW, []], phonoStageBuiltIn: ['deviceType', POW, null], trigger12v: ['deviceType', POW, false], remoteControlIncluded: ['deviceType', POW, false],
  maxSampleRateBitDepth: ['deviceType', DIG, null], dsdSupport: ['deviceType', DIG, null], hiResCertification: ['deviceType', DIG, []], dacChipsetFamily: ['deviceType', DIG, []], streamingPlatformSupport: ['deviceType', DIG, []], networkConnection: ['deviceType', DIG, []],
  voiceAssistant: ['deviceConnectivity', NET, []], multiroomSupport: ['deviceConnectivity', NET, false],
}
const usable = (fa) => ({ deviceType: DT.includes(fa.deviceType), deviceConnectivity: CONN.includes(fa.deviceConnectivity) })
const holdsValue = (na, v) => (Array.isArray(na) ? Array.isArray(v) && v.length > 0 : na === false ? v === true : v !== null && v !== undefined)
// the cells that hold a value although the gate says "doesn't apply"
function contradictions(fa) {
  const ok = usable(fa)
  return Object.entries(GATED).filter(([cell, [by, set, na]]) => ok[by] && !set.includes(fa[by]) && holdsValue(na, fa[cell])).map(([cell, [, , na]]) => ({ cell, old: fa[cell], to: na }))
}
const unusable = (fa) => Object.entries(usable(fa)).filter(([, ok]) => !ok).map(([k]) => `${k} unusable: ${JSON.stringify(fa[k])}`)
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
const before = await read()
const ae = aeOf(before)
const byId = new Map(ae.map((p) => [p._id, p]))

// 3. check every fill, compute the state after it
const errors = []
const seen = new Set()
const after = new Map(ae.map((p) => [p._id, structuredClone(p.fa ?? {})]))
const planned = new Map() // _id -> { p, cells: { cell -> { old, v, url? } } }
const cellsOf = (p) => (planned.has(p._id) ? planned.get(p._id) : (planned.set(p._id, { p, cells: {} }), planned.get(p._id)))
const unresolved = []
for (const fill of fills) {
  const tag = `${fill.file} ${fill.name ?? fill.id}`
  const p = byId.get(fill.id)
  if (!p) { errors.push(`${tag}: not an audio-electronics product id`); continue }
  if (seen.has(fill.id)) errors.push(`${tag}: appears in two fills`)
  seen.add(fill.id)
  if (fill.unresolved) { unresolved.push(`${tag}: ${fill.unresolved}`); continue }
  const names = Object.keys(fill.set ?? {})
  if (!names.length) errors.push(`${tag}: empty set`)
  for (const cell of names) {
    const v = fill.set[cell]
    if (!LEGAL[cell]) { errors.push(`${tag}: ${cell} is not a step 4 cell`); continue }
    if (!LEGAL[cell](v)) { errors.push(`${tag}: ${cell} illegal value ${JSON.stringify(v)}`); continue }
    const src = (fill.sources ?? []).find((s) => s.cell === cell)
    if (!src || !/^https?:\/\//.test(src.url ?? '') || !String(src.quote ?? '').trim()) { errors.push(`${tag}: ${cell} has no source (url + quote)`); continue }
    cellsOf(p).cells[cell] = { old: after.get(p._id)[cell], v, url: src.url }
    after.get(p._id)[cell] = v
  }
}
// the gated cells that hold a value although the gate says "doesn't apply", judged on the state after the fills
for (const p of ae) for (const c of contradictions(after.get(p._id))) { cellsOf(p).cells[c.cell] = { old: c.old, v: c.to, empty: true }; after.get(p._id)[c.cell] = c.to }
const plan = [...planned.values()].filter((x) => Object.keys(x.cells).length)
const unresolvedIds = new Set(fills.filter((x) => x.unresolved).map((x) => x.id))
const remaining = [], remainingAccepted = []
for (const p of ae) for (const m of unusable(after.get(p._id))) (unresolvedIds.has(p._id) ? remainingAccepted : remaining).push(`${p.name}: ${m}`)

// 4. report
const filled = plan.flatMap((x) => Object.entries(x.cells).filter(([, c]) => !c.empty).map(([cell, c]) => ({ p: x.p, cell, ...c })))
const emptied = plan.flatMap((x) => Object.entries(x.cells).filter(([, c]) => c.empty).map(([cell, c]) => ({ p: x.p, cell, ...c })))
console.log(`${apply ? 'APPLY' : 'DRY RUN'}: ${files.length} fills file(s), ${fills.length} products, ${filled.length} cells filled, ${emptied.length} cells emptied on ${new Set(emptied.map((e) => e.p._id)).size} products`)
console.log(`\nFILLED`)
for (const f of filled) console.log(`  ${f.p.name}\n    ${f.cell}: ${f.old === undefined ? '(missing)' : JSON.stringify(f.old)} -> ${JSON.stringify(f.v)}   ${f.url}`)
console.log(`\nEMPTIED (gate says "doesn't apply", the cell held a value)`)
const group = {}
for (const e of emptied) { const k = `${e.cell} on ${after.get(e.p._id).deviceType ?? '?'}`; (group[k] ??= []).push(JSON.stringify(e.old).slice(0, 36)) }
for (const [k, vs] of Object.entries(group).sort()) { const t = {}; for (const v of vs) t[v] = (t[v] ?? 0) + 1; console.log(`  ${String(vs.length).padStart(3)}  ${k.padEnd(48)} ${JSON.stringify(Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 3))}`) }
console.log(`\nunresolved by the executors: ${unresolved.length}${unresolved.map((e) => `\n  ${e}`).join('')}`)
console.log(`\nfill errors: ${errors.length}${errors.map((e) => `\n  ${e}`).join('')}`)
console.log(`left on purpose (marked unresolved by the executors, reported above): ${remainingAccepted.length}${remainingAccepted.map((e) => `\n  ${e}`).join('')}`)
console.log(`audio-electronics products with an unusable rule input after these fills: ${remaining.length}${remaining.map((e) => `\n  ${e}`).join('')}`)
if (errors.length) { console.log('\nRefused: fix the fills first.'); process.exit(1) }
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }
if (remaining.length) throw new Error('refused: the step 4 done condition is not met by these fills')

// 5. ONE transaction guarded by the revisions read above
const mutations = plan.map(({ p, cells }) => ({ patch: { id: p._id, ifRevisionID: p._rev, set: Object.fromEntries(Object.entries(cells).map(([cell, c]) => [`filterAttributes.${cell}`, c.v])) } }))
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
for (const { p, cells } of plan) {
  const a = reById.get(p._id)
  for (const [cell, c] of Object.entries(cells)) if (canon(a?.fa?.[cell]) !== canon(c.v)) bad.push(`${p._id}: ${cell} is ${canon(a?.fa?.[cell])}, wanted ${canon(c.v)}`)
  if (without(p.fa, Object.keys(cells)) !== without(a?.fa, Object.keys(cells))) bad.push(`${p._id}: other filterAttributes changed`)
}
for (const p of ae) if (!touched.has(p._id) && canon(p.fa) !== canon(reById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
if (reAe.length !== ae.length) bad.push('audio-electronics product count changed')
const left = reAe.filter((p) => !unresolvedIds.has(p._id)).flatMap((p) => [...unusable(p.fa ?? {}), ...contradictions(p.fa ?? {}).map((c) => `${c.cell} still holds a value`)])
if (left.length) bad.push(`${left.length} unusable inputs or contradictions remain`)
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${plan.length} products changed exactly as planned; every other filterAttributes value identical; 0 unusable inputs, 0 contradictions; ${reAe.length} audio-electronics products.`)
