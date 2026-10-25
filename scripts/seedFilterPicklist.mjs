// One-off seed script: writes the `filterPicklist` document from today's
// selector membership (minus brand and in stock). Delete this file after it
// has been applied.
//
// Dry-run (prints the document, writes nothing):
//   node --env-file=/home/jan/work/sanglogium/.env.local scripts/seedFilterPicklist.mjs
// Apply:
//   node --env-file=/home/jan/work/sanglogium/.env.local scripts/seedFilterPicklist.mjs --apply

import { createClient } from "@sanity/client";

const doc = {
  _id: "filterPicklist",
  _type: "filterPicklist",
  headphones: [
    "acousticDesign",
    "connectivity",
    "soundSignature",
    "impedanceOhms",
    "sensitivityDbMw",
    "freqResponseHz.min",
    "microphone",
    "cableTermination",
    "foldable",
    "cableLengthM",
    "ipxRating",
    "requiresAmplifier",
    "portable",
    "bluetoothCodecs",
    "anc",
    "batteryLifeHours.ancOff",
    "driverType",
    "driverConfigBucket",
  ],
  audioElectronics: [
    "deviceType",
    "formFactor",
    "deviceConnectivity",
    "inputs",
    "balancedOutput",
    "amplification",
    "dacIncluded",
    "dsdSupport",
    "dacChipsetFamily",
    "streamingPlatformSupport",
  ],
  accessories: [
    "accessoryType",
    "compatibleProductType",
    "cableFunction",
    "connectorTermination",
    "lengthM",
    "conductorMaterial",
    "balancedUnbalanced",
    "partType",
  ],
};

if (!process.argv.includes("--apply")) {
  console.log(JSON.stringify(doc, null, 2));
  console.log(
    "\nNothing was written. To apply, run:\n  node --env-file=/home/jan/work/sanglogium/.env.local scripts/seedFilterPicklist.mjs --apply"
  );
  process.exit(0);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_STUDIO_READ_WRITE;

if (!projectId || !token) {
  console.error(
    "Missing env: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_STUDIO_READ_WRITE are required for --apply."
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-11-14",
  useCdn: false,
  token,
});

const result = await client.createOrReplace(doc);
console.log(`Wrote ${result._id} (rev ${result._rev})`);
