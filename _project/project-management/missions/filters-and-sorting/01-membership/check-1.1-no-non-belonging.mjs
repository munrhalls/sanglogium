// Check 1.1 — zero non-belonging products in each slice.
// Prints the full in-slice list for human verdict. Run: node check-1.1-no-non-belonging.mjs
import { client, keysFor, SLICES, IN } from './_shared.mjs';

for (const slice of SLICES) {
  const inside = await client.fetch(IN, { keys: keysFor(slice) });
  console.log(`\n=== [1.1] ${slice} — ${inside.length} products in slice ===`);
  for (const p of inside) console.log(`${p.name} — ${p.brand ?? '(no brand)'}`);
  if (inside.length >= 1000) console.log(`!! slice hit the 1000 cap — list may be truncated`);
}
