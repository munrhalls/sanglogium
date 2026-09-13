import fs from 'node:fs'
const d = JSON.parse(fs.readFileSync('app/(test)/poc/filter-sort/headphones/dataset.json', 'utf8'))
const ids = ['n10eAegrGspodtsQw13THU']
const rows = Array.isArray(d) ? d : d.products
for (const id of ids) {
  const p = rows.find(r => r._id === id)
  if (!p) { console.log('NOT FOUND', id); continue }
  console.log(id, p.name)
  for (const k of Object.keys(p)) {
    if (/^(productCategory|wearingStyle|acousticDesign|fitType|connectivity|portable|microphone|cableTermination|detachableCable|foldable|ipxRating|bluetoothCodecs|anc|batteryLifeHours|driverType|driverConfigBucket|driverConfigDetail|cableLengthM|impedanceOhms|sensitivityDbMw|bassExtensionHz|freqResponseHz|requiresAmplifier|soundSignature|awards)$/.test(k)) console.log('  ', k, '=', JSON.stringify(p[k]))
  }
}
