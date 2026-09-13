import fs from 'node:fs'
const d = JSON.parse(fs.readFileSync('app/(test)/poc/filter-sort/headphones/dataset.json', 'utf8'))
const ids = ['Y7l1IhzX2fnyiano4irsdl','ZuUKzmkqDyQwdcwhxl8p4E','ZuUKzmkqDyQwdcwhxl8saP','dLGDVDmEEI2lV8CArAdTYq']
const rows = Array.isArray(d) ? d : d.products
for (const id of ids) {
  const p = rows.find(r => r._id === id)
  const keep = ['_id','name','slug']
  const out = {}
  for (const k of Object.keys(p)) {
    if (keep.includes(k) || /^(productCategory|wearingStyle|acousticDesign|fitType|connectivity|portable|microphone|cableTermination|detachableCable|foldable|ipxRating|bluetoothCodecs|anc|batteryLifeHours|driverType|driverConfigBucket|driverConfigDetail|cableLengthM|impedanceOhms|sensitivityDbMw|bassExtensionHz|freqResponseHz|requiresAmplifier|soundSignature|awards|rating|ratingCount|condition|deals|availability|inStockOnly|isNewArrival|discountPercent)$/.test(k)) out[k] = p[k]
  }
  console.log(JSON.stringify(out))
  console.log('---')
}
