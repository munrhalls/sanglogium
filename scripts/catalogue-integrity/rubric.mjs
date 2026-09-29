// Field -> slice map derived from categories: gates in
// sanity-cms/schemaTypes/productType.ts (filterAttributes fields).
// Only EXCLUSIVE fields (categories == exactly one slice) are usable as votes.
//
// headphones-exclusive: productCategory, wearingStyle, acousticDesign, fitType,
//   connectivity, portable, soundSignature, impedanceOhms, sensitivityDbMw,
//   freqResponseHz, requiresAmplifier, microphone, detachableCable,
//   cableLengthM, foldable, ipxRating, anc, batteryLifeHours, driverType,
//   driverConfigBucket, driverConfigDetail
// audio-electronics-exclusive: deviceConnectivity, formFactor, amplification,
//   dacIncluded, balancedOutput, powerOutputPerChannelW, channelCount,
//   phonoStageBuiltIn, trigger12v, remoteControlIncluded, outputs,
//   maxSampleRateBitDepth, dsdSupport, hiResCertification, dacChipsetFamily,
//   streamingPlatformSupport, networkConnection, driveType,
//   turntableOperation, speedsSupported, phonoPreampBuiltIn,
//   cartridgeIncluded, usbDigitalOutput, voiceAssistant, multiroomSupport,
//   finishColor, rackMountable19, countryOfManufacture
// accessories-exclusive: compatibleProductType, cableFunction, lengthM,
//   conductorMaterial, balancedUnbalanced, furnitureType, material,
//   adjustableHeight, weightCapacityKg, powerProductType, outletCount,
//   powerConnectorType, cleaningProductType, formatCompatibility, partType,
//   compatibility, adapterFunction, treatmentType, mounting
// Excluded (multi-slice or universal gates, no single-slice signal):
//   price/brand/inStock (*), category (all-products),
//   awards/field (all 3), bluetoothCodecs (headphones+audio-electronics),
//   customerRating/condition/dealsDiscount/newArrival (accessories+audio-electronics)

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const EXCLUSIVE = {
  'headphones': new Set(['productCategory','wearingStyle','acousticDesign','fitType','connectivity','portable','soundSignature','impedanceOhms','sensitivityDbMw','freqResponseHz','requiresAmplifier','microphone','detachableCable','cableLengthM','foldable','ipxRating','anc','batteryLifeHours','driverType','driverConfigBucket','driverConfigDetail']),
  'audio-electronics': new Set(['deviceConnectivity','formFactor','amplification','dacIncluded','balancedOutput','powerOutputPerChannelW','channelCount','phonoStageBuiltIn','trigger12v','remoteControlIncluded','outputs','maxSampleRateBitDepth','dsdSupport','hiResCertification','dacChipsetFamily','streamingPlatformSupport','networkConnection','driveType','turntableOperation','speedsSupported','phonoPreampBuiltIn','cartridgeIncluded','usbDigitalOutput','voiceAssistant','multiroomSupport','finishColor','rackMountable19','countryOfManufacture']),
  'accessories': new Set(['compatibleProductType','cableFunction','lengthM','conductorMaterial','balancedUnbalanced','furnitureType','material','adjustableHeight','weightCapacityKg','powerProductType','outletCount','powerConnectorType','cleaningProductType','formatCompatibility','partType','compatibility','adapterFunction','treatmentType','mounting']),
};

const populated = (v) =>
  v !== null && v !== undefined && v !== '' &&
  (!Array.isArray(v) || v.length > 0);

export const fieldVote = (product) => {
  const fa = product.filterAttributes || {};
  const hit = [];
  for (const [slice, fields] of Object.entries(EXCLUSIVE)) {
    if ([...fields].some((f) => populated(fa[f]))) hit.push(slice);
  }
  return hit.length === 1 ? hit[0] : null;
};

// datasetVote: build product_id -> slice map from data/<slice>/<brand>/*.md
let datasetMap = null;
export const buildDatasetMap = () => {
  if (datasetMap) return datasetMap;
  datasetMap = new Map();
  let skipped = 0;
  for (const slice of Object.keys(EXCLUSIVE)) {
    const sliceDir = join(repoRoot, 'data', slice);
    if (!existsSync(sliceDir)) continue;
    for (const brand of readdirSync(sliceDir)) {
      const brandDir = join(sliceDir, brand);
      if (!statSync(brandDir).isDirectory()) continue;
      for (const file of readdirSync(brandDir, { withFileTypes: true })) {
        if (!file.isFile() || !file.name.endsWith('.md')) continue;
        const src = readFileSync(join(brandDir, file.name), 'utf8');
        const m = src.match(/^product_id:\s*(?:"([^"]*)"|'([^']*)'|([^\n]*))\s*$/m);
        const id = m ? (m[1] ?? m[2] ?? (m[3] || '').trim()) : null;
        if (!id || id === 'null') { skipped++; continue; }
        datasetMap.set(id, slice);
      }
    }
  }
  console.log(`datasetVote: ${datasetMap.size} product_ids mapped, ${skipped} md files skipped (null/missing product_id)`);
  return datasetMap;
};

export const datasetVote = (product) => buildDatasetMap().get(product._id) ?? null;

const SLICES = ['headphones', 'audio-electronics', 'accessories'];
export const categoryVote = (product) => {
  const cat = product.filterAttributes?.category;
  if (!Array.isArray(cat)) return null;
  const slices = cat.filter((c) => SLICES.includes(c));
  return slices.length === 1 ? slices[0] : null;
};

const KEYWORDS = {
  'headphones': ['headphone', 'earphone', 'iem', 'earbud', 'in-ear', 'over-ear', 'on-ear'],
  'audio-electronics': ['dac', 'amp', 'amplifier', 'streamer', 'digital audio player', 'dap', 'preamp'],
  'accessories': ['cable', 'interconnect', 'adapter', 'case', 'stand', 'earpad', 'ear pad', 'eartip', 'ear tip', 'cleaning', 'isolator', 'bracket', 'mount'],
};

export const nameVote = (product) => {
  const name = (product.name || '').toLowerCase();
  const hit = SLICES.filter((s) => KEYWORDS[s].some((k) => name.includes(k)));
  return hit.length === 1 ? hit[0] : null;
};
