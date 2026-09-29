// Restores catalogueLocationKeys from a backup file.
// Default = dry-run. Usage: node --env-file=.env.local scripts/catalogue-integrity/rollback.mjs --file=<backup path> [--write]
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')),
);
const WRITE = 'write' in args;
if (!args.file) { console.error('--file=<backup path> required'); process.exit(1); }

const backup = JSON.parse(readFileSync(resolve(args.file), 'utf8'));
console.log(`${backup.length} record(s) in backup`);

for (const item of backup) {
  console.log(`${item._id} -> ${JSON.stringify(item.catalogueLocationKeys ?? null)}`);
}

if (!WRITE) {
  console.log('\nDRY-RUN: nothing written. Re-run with --write to apply.');
  process.exit(0);
}

const { default: client } = await import('../../sanity-cms/utils/getClient.mjs');
let n = 0;
for (let i = 0; i < backup.length; i += 100) {
  const tx = client.transaction();
  for (const item of backup.slice(i, i + 100)) {
    tx.patch(item._id, (p) =>
      item.catalogueLocationKeys?.length
        ? p.set({ catalogueLocationKeys: item.catalogueLocationKeys })
        : p.unset(['catalogueLocationKeys']),
    );
  }
  await tx.commit();
  n += Math.min(100, backup.length - i);
  console.log(`restored ${n}/${backup.length}`);
}
console.log('ROLLBACK DONE');
