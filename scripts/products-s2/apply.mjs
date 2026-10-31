// Products definition of done, step S2 (rules 2, 3 and 7): one write that makes the published products agree with themselves.
//   1. Text that rule 7 reads: literal HTML entities become their characters, the mojibake sequences are repaired, and the typo corrections
//      in CORRECTIONS are applied to whole words, keeping the case.
//   4. The two picks in the filterPicklist document that name the fields S1 removed are unpicked.
//   2. Rule 2: where a place writes "no value" more than one way, every explicit way (null, empty text, empty list, empty object) becomes a missing key.
//   3. Rule 3: where a place holds one value in more than one spelling (case, spaces), every spelling becomes the most common one. A tie takes the first in code-point order.
// overviewFields and filterAttributes.sourcing are not read by the checks, so steps 2 and 3 do not touch them. Step 1 skips the keys rule 7 skips.
// Delete this folder once it has run (git history is the archive).
// Without --apply it only reads and prints the plan. --apply writes ONE transaction, each patch guarded by the document's revision,
// then re-reads and checks that every product document is exactly what the plan said.
// Refused (nothing written): an entity with no mapping is left, the result would still break rule 2 or 3, a filter list would hold a value twice, or two names would become one.
const apply = process.argv.includes('--apply')
const e = process.env
const ds = e.NEXT_PUBLIC_SANITY_DATASET || 'production'
const base = `https://${e.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v${e.NEXT_PUBLIC_SANITY_API_VERSION || '2024-11-14'}/data`

// Typos found by reading the 242 words that are neither in a product name, nor written with a capital inside, nor a short acronym (2026-10-31).
// "Sang-Logiumbining" in the Focal Celestee description is a broken sentence, not a typo, and is left for a person to rewrite.
const CORRECTIONS = [['adaptative', 'adaptive'], ['controled', 'controlled'], ['dymanic', 'dynamic'], ['reponse', 'response'], ['vaccum', 'vacuum'], ['transciever', 'transceiver'], ['uo', 'up'], ['beyreuth', 'Bayreuth']] // [typo, correction]
// Picks in the filterPicklist document that name fields S1 removed. A pick with no data draws nothing, so these are only stale.
const STALE_PICKS = { headphones: ['driverConfigBucket'], audioElectronics: ['dacIncluded'] }

const ENTITIES = { amp: '&', lt: '<', gt: '>', le: '≤', ge: '≥', ndash: '–', Omega: 'Ω', pi: 'π', plusmn: '±', times: '×', reg: '®', trade: '™', lArr: '⇐', nbsp: ' ' }
const MOJIBAKE = [[/â‰¤/g, '≤'], [/â€¡/g, '‡'], [/Â(?=\s|$)/g, '']]
const TEXT_SKIP = /^(_.*|sku|slug|url|href|sourcing|sourcedAt|catalogueLocationKeys|overviewFields|marks|style|listItem|level|markDefs)$/
const EXCLUDED = new Set(['overviewFields', 'filterAttributes.sourcing'])

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
const spelling = (s) => s.toLowerCase().replace(/\s/g, '')
const isNone = (v) => v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0) || (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
const noneKind = (v) => (v === null ? 'null' : typeof v === 'string' ? 'empty text' : Array.isArray(v) ? 'empty list' : 'empty object')
const stable = (v) => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : 1))) : x))
const bare = ({ _rev, _updatedAt, ...rest }) => rest
const at = (place, k) => (place ? `${place}.${k}` : k)

async function read(query) {
  const res = await fetch(`${base}/query/${ds}?query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${e.SANITY_API_READ_TOKEN}` } })
  if (!res.ok) throw new Error(`read failed: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`)
  return (await res.json()).result
}
const readProducts = () => read('*[_type == "product" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_id asc)')

// STEP 1: text cleanup, only in the cells rule 7 reads
const count = { entity: {}, mojibake: 0, corrected: {} }
const unmapped = new Set()
function cleanText(s) {
  let t = s.replace(/&(\w+);/g, (m, n) => {
    if (!(n in ENTITIES)) { unmapped.add(m); return m }
    count.entity[n] = (count.entity[n] ?? 0) + 1
    return ENTITIES[n]
  })
  if (/&nbsp;/.test(s)) t = t.trim()
  for (const [bad, good] of MOJIBAKE) t = t.replace(bad, () => (count.mojibake++, good))
  for (const [typo, fix] of CORRECTIONS) {
    const re = new RegExp(`(?<![\\p{L}])${typo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}])`, 'giu')
    t = t.replace(re, (m) => { count.corrected[typo] = (count.corrected[typo] ?? 0) + 1; return m === m.toUpperCase() && m.length > 1 ? fix.toUpperCase() : m[0] === m[0].toUpperCase() ? fix[0].toUpperCase() + fix.slice(1) : fix })
  }
  return t
}
function cleanDoc(v) {
  if (typeof v === 'string') return cleanText(v)
  if (Array.isArray(v)) return v.map(cleanDoc)
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, TEXT_SKIP.test(k) ? x : cleanDoc(x)]))
  return v
}

// STEPS 2 and 3: the same places the walk looks at (check-products.mjs): a place is the path of keys, an array step is []
function walk(v, place, visit) {
  if (EXCLUDED.has(place)) return
  visit(v, place)
  if (Array.isArray(v)) v.forEach((x) => walk(x, `${place}[]`, visit))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, at(place, k), visit)
}
function analyze(docs) {
  const nones = new Map(), spells = new Map(), objects = new Map()
  const put = (m, k, v) => { if (!m.has(k)) m.set(k, new Set()); m.get(k).add(v) }
  for (const d of docs) walk(d, '', (v, place) => {
    if (isNone(v)) put(nones, place, noneKind(v))
    if (typeof v === 'string') { const g = spells.get(place) ?? new Map(); const s = g.get(spelling(v)) ?? new Map(); s.set(v, (s.get(v) ?? 0) + 1); g.set(spelling(v), s); spells.set(place, g) }
    else if (v && typeof v === 'object' && !Array.isArray(v)) { const o = objects.get(place) ?? []; o.push(new Set(Object.keys(v).filter((k) => !EXCLUDED.has(at(place, k))))); objects.set(place, o) }
  })
  for (const [place, list] of objects) {
    const all = new Set(list.flatMap((s) => [...s]))
    for (const s of list) for (const k of all) if (!s.has(k)) put(nones, at(place, k), 'missing key')
  }
  const broken2 = new Set([...nones].filter(([, kinds]) => kinds.size > 1).map(([place]) => place))
  const canon = new Map(); const groups = []; let ties = 0
  for (const [place, g] of spells) for (const [key, forms] of g) if (forms.size > 1) {
    const ranked = [...forms].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    if (ranked[0][1] === ranked[1][1]) ties++
    canon.set(`${place}\0${key}`, ranked[0][0])
    groups.push(place)
  }
  return { broken2, canon, groups, ties }
}
function normalize(v, place, A) {
  if (EXCLUDED.has(place)) return v
  if (typeof v === 'string') return A.canon.get(`${place}\0${spelling(v)}`) ?? v
  if (Array.isArray(v)) return v.map((x) => normalize(x, `${place}[]`, A))
  if (v && typeof v === 'object') {
    const out = {}
    for (const [k, x] of Object.entries(v)) {
      const p = at(place, k)
      if (A.broken2.has(p) && isNone(x)) continue
      out[k] = normalize(x, p, A)
    }
    return out
  }
  return v
}

// the patch that turns one document into the other: keyed array items by _key, other items by index
function diff(a, b, path, out) {
  if (a === b) return
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) a.forEach((x, i) => diff(x, b[i], `${path}[${x && x._key ? `_key=="${x._key}"` : i}]`, out))
  else if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    for (const k of Object.keys(a)) { if (!(k in b)) out.unset.push(at(path, k)); else diff(a[k], b[k], at(path, k), out) }
    for (const k of Object.keys(b)) if (!(k in a)) throw new Error(`refused: a key would be added at ${at(path, k)}`)
  } else out.set[path] = b
}

// 1. plan
const before = await readProducts()
const cleaned = before.map(cleanDoc)
if (unmapped.size) throw new Error(`refused: entities with no mapping: ${[...unmapped].join(' ')}`)
const A = analyze(cleaned)
const fixed = cleaned.map((d) => normalize(d, '', A))
const B = analyze(fixed)
if (B.broken2.size || B.groups.length) throw new Error(`refused: the result would still break rule 2 at [${[...B.broken2].join(', ')}] or rule 3 at [${B.groups.join(', ')}]`)
const doubled = []
for (const d of fixed) walk(d, '', (v, place) => { if (place.startsWith('filterAttributes') && Array.isArray(v) && v.every((x) => typeof x === 'string') && new Set(v.map(norm)).size !== v.length) doubled.push(`${d.name}: ${place}`) })
if (doubled.length) throw new Error(`refused: a filter list would hold a value twice: ${doubled.slice(0, 5).join('; ')}`)
const names = fixed.map((d) => norm(d.name ?? '')).filter(Boolean)
if (new Set(names).size !== names.length) throw new Error('refused: two product names would become one')

const writes = []
for (let i = 0; i < before.length; i++) {
  const out = { set: {}, unset: [] }
  diff(bare(before[i]), bare(fixed[i]), '', out)
  if (Object.keys(out.set).length || out.unset.length) writes.push({ p: before[i], ...out })
}

const picklist = (await read('*[_id == "filterPicklist"]'))[0]
if (!picklist) throw new Error('refused: the filterPicklist document was not found')
const picks = Object.fromEntries(Object.entries(STALE_PICKS).map(([slice, gone]) => [slice, (picklist[slice] ?? []).filter((x) => !gone.includes(x))]))
const unpicked = Object.entries(picks).reduce((a, [slice, v]) => a + (picklist[slice] ?? []).length - v.length, 0)

// 2. report
const sum =(o) => Object.values(o).reduce((a, b) => a + b, 0)
console.log(`${apply ? 'APPLY' : 'PLAN'}: ${before.length} published products read; ${writes.length} documents to patch (${writes.reduce((a, w) => a + Object.keys(w.set).length + w.unset.length, 0)} changes)`)
console.log(`text: entities decoded ${sum(count.entity)} ${JSON.stringify(count.entity)}; mojibake repaired ${count.mojibake}; typo corrections applied ${sum(count.corrected)} ${JSON.stringify(count.corrected)} (${CORRECTIONS.length} given)`)
console.log(`rule 2: ${A.broken2.size} places write "no value" more than one way; each becomes a missing key`)
console.log(`rule 3: ${A.groups.length} groups hold one value in more than one spelling; each becomes its most common spelling (${A.ties} ties)`)
console.log(`picklist: ${unpicked} stale picks removed (${Object.values(STALE_PICKS).flat().join(', ')})`)
console.log('re-check on the result: 0 places break rule 2, 0 groups break rule 3, 0 filter lists hold a value twice, 0 names collide')
if (!apply) { console.log('\nNothing was written. To apply, run the same command with --apply.'); process.exit(0) }

// 3. ONE transaction, each patch guarded by the revision read above
const mutations = [
  ...writes.map(({ p, set, unset }) => ({ patch: { id: p._id, ifRevisionID: p._rev, ...(Object.keys(set).length ? { set } : {}), ...(unset.length ? { unset } : {}) } })),
  ...(unpicked ? [{ patch: { id: picklist._id, ifRevisionID: picklist._rev, set: picks } }] : []),
]
const res = await fetch(`${base}/mutate/${ds}?returnIds=true&visibility=sync`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${e.SANITY_STUDIO_READ_WRITE}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ mutations }),
})
const body = await res.text()
if (!res.ok) throw new Error(`transaction refused: HTTP ${res.status} ${body.slice(0, 600)}`)
console.log(`transaction committed: ${mutations.length} patches`)

// 4. re-read and compare every product document with the plan
const after = await readProducts()
const want = new Map(fixed.map((d) => [d._id, bare(d)]))
const bad = []
for (const a of after) { if (!want.has(a._id)) bad.push(`${a._id}: should not exist`); else if (stable(bare(a)) !== stable(want.get(a._id))) bad.push(`${a._id}: differs from the plan`) }
for (const id of want.keys()) if (!after.some((a) => a._id === id)) bad.push(`${id}: missing`)
const picklistAfter = (await read('*[_id == "filterPicklist"]'))[0]
for (const [slice, v] of Object.entries(picks)) if (stable(picklistAfter?.[slice]) !== stable(v)) bad.push(`filterPicklist.${slice}: differs from the plan`)
console.log(bad.length ? `VERIFY FAILED:\n  ${bad.join('\n  ')}` : `verified: ${after.length} product documents, each exactly as planned.`)
if (bad.length) process.exit(1)
