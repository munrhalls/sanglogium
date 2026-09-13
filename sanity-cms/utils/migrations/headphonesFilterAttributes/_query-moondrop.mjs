import { readClient } from './getClient.mjs';
const id = 'n10eAegrGspodtsQw13THU';
const d = await readClient.fetch('*[_id == $id][0]{_id,name,brand,price,_type,filterAttributes}', { id });
console.log('===', id, d ? `${d.name} | ${JSON.stringify(d.brand)} | ${d.price} | ${d._type}` : 'NOT FOUND');
if (d?.filterAttributes) console.log(JSON.stringify(d.filterAttributes, null, 2));
