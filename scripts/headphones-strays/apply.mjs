// Step 7, first part, of the headphones-attrs sequence (sanglogium-todo.md): deletes the keys outside the structure that no reader can miss.
// Deleted: `driverConfigDetail` (no reader in any code), and every undeclared key whose value is null (a null key and a missing key read the same).
// Kept for now, because the code production still runs reads them: `brand`, `requiresAmplifier`, `condition`. They go once production serves the current main.
// Skips products with a `deviceType` (CrinEar Protocol Max, moved out in step 7a).
// Delete this folder once it has run (git history is the archive).
// Without --apply it only reads and prints the plan. --apply writes: ONE transaction, each patch guarded by the document's revision, then a re-read that checks the result.
// Refused (nothing written) if a headphone holds an undeclared key that is neither deleted here nor kept on purpose.
const apply = process.argv.includes('--apply')
const pid = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const ds = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const ver = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'
const base = `https://${pid}.api.sanity.io/v${ver}/data`

const DECLARED = new Set(['wearingStyle', 'connectivity', 'acousticDesign', 'soundSignature', 'anc', 'ipxRating', 'driverConfigBucket', 'driverType', 'portable', 'microphone', 'foldable', 'impedanceOhms', 'sensitivityDbMw', 'freqResponseHz', 'bluetoothCodecs', 'cableTermination', 'detachableCable', 'cableLengthM', 'batteryLifeHours', 'sourcing'])
const KEPT = new Set(['brand', 'requiresAmplifier', 'condition'])
const ALWAYS = new Set(['driverConfigDetail'])

const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x))
const without = (fa, keys) => stable(Object.fromEntries(Object.entries(fa ?? {}).filter(([k]) => !keys.includes(k))))

async function read() {
  const q = `{
    "products": *[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id asc) { _id, _rev, name, catalogueLocationKeys, "fa": filterAttributes },
    "catalogue": *[_type == "catalogueItem"] { _id, "slug": slug.current, "parent": parent._ref }
  }`
  const res = await fetch(`${base}/query/${ds}?query=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` } })
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  const { products, catalogue } = (await res.json()).result
  const ids = new Set([catalogue.find((c) => c.slug === 'headphones')._id])
  for (let grew = true; grew;) { grew = false; for (const c of catalogue) if (c.parent && ids.has(c.parent) && !ids.has(c._id)) (ids.add(c._id), (grew = true)) }
  return { products, hp: products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k))) }
}

// 1. plan
const before = await read()
const writes = [], unhandled = [], skipped = []
for (const p of before.hp) {
  const fa = p.fa ?? {}
  if (fa.deviceType !== undefined) { skipped.push(p.name); continue }
  const unset = []
  for (const [k, v] of Object.entries(fa)) {
    if (DECLARED.has(k) || KEPT.has(k)) continue
    if (ALWAYS.has(k) || v === null) unset.push(k)
    else unhandled.push(`${p.name}: ${k} = ${JSON.stringify(v)}`)
  }
  if (unset.length) writes.push({ p, unset })
}

// 2. report
const perKey = {}
for (const w of writes) for (const k of w.unset) perKey[k] = (perKey[k] ?? 0) + 1
console.log(`${apply ? 'APPLY' : 'PLAN'}: ${before.hp.length} headphones read, ${skipped.length} skipped (${skipped.join('; ')}), ${writes.length} products to change, ${Object.values(perKey).reduce((a, b) => a + b, 0)} keys to delete`)
console.log(`by key: ${JSON.stringify(perKey)}`)
console.log(`undeclared keys with a value, neither deleted nor kept: ${unhandled.length}${unhandled.map((e) => `\n  ${e}`).join('')}`)
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }
if (unhandled.length) throw new Error('refused: some undeclared keys hold a value and are not handled here')

// 3. ONE transaction guarded by the revisions read above
const mutations = writes.map(({ p, unset }) => ({ patch: { id: p._id, ifRevisionID: p._rev, unset: unset.map((k) => `filterAttributes.${k}`) } }))
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} patches`)

// 4. re-read and check
const after = await read()
const reById = new Map(after.products.map((p) => [p._id, p]))
const bad = []
for (const { p, unset } of writes) {
  const a = reById.get(p._id)
  for (const k of unset) if (a?.fa && k in a.fa) bad.push(`${p._id}: ${k} still there`)
  if (without(p.fa, unset) !== without(a?.fa, unset)) bad.push(`${p._id}: other filterAttributes changed`)
}
for (const p of before.products) if (!writes.some((w) => w.p._id === p._id) && stable(p.fa) !== stable(reById.get(p._id)?.fa)) bad.push(`${p._id}: untouched product changed`)
if (after.products.length !== before.products.length) bad.push('product count changed')
const left = {}
for (const p of after.hp.filter((x) => x.fa?.deviceType === undefined)) for (const k of Object.keys(p.fa ?? {})) if (!DECLARED.has(k)) left[k] = (left[k] ?? 0) + 1
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${writes.length} products changed; every other filterAttributes value identical; undeclared keys left (kept on purpose): ${JSON.stringify(left)}; ${after.products.length} products.`)
if (bad.length) process.exit(1)
