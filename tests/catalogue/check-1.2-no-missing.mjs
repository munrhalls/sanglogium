// Check 1.2 — zero missing products: nothing outside the slice should belong in it.
// Prints the full out-of-slice list for human verdict. Run: node check-1.2-no-missing.mjs
import { client, keysFor, SLICES, OUT } from './_shared.mjs';

for (const slice of SLICES) {
  const outside = await client.fetch(OUT, { keys: keysFor(slice) });
  console.log(`\n=== [1.2] ${slice} — ${outside.length} products NOT in slice ===`);
  for (const p of outside) console.log(`${p.name} — ${p.brand ?? '(no brand)'}`);
  if (outside.length >= 1000) console.log(`!! outside list hit the 1000 cap — may be truncated`);
}
