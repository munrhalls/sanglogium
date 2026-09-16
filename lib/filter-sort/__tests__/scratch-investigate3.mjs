import { readFileSync } from 'node:fs';
const inv = JSON.parse(readFileSync('./lib/filter-sort/__tests__/data/headphones-inventory.json', 'utf8'));
const usbc = inv.filter(p => (Array.isArray(p.cableTermination) ? p.cableTermination : p.cableTermination ? [p.cableTermination] : []).map(v=>v.toLowerCase()).includes('usb-c'));
console.log(`Total: ${usbc.length}`);
for (const p of usbc) {
  console.log(`${p.name} | connectivity=${p.connectivity} | cableTermination=${JSON.stringify(p.cableTermination)} | productCategory=${JSON.stringify(p.productCategory)}`);
}
