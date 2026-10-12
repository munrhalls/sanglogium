// Check 1.3 — zero duplicates: returned count equals distinct product IDs.
// Run: node check-1.3-no-duplicates.mjs
import { client, keysFor, SLICES, IN } from './_shared.mjs';

for (const slice of SLICES) {
  const inside = await client.fetch(IN, { keys: keysFor(slice) });
  const distinct = new Set(inside.map((p) => p._id)).size;
  console.log(`=== [1.3] ${slice} — returned: ${inside.length}, distinct: ${distinct}, equal: ${inside.length === distinct}`);
}
