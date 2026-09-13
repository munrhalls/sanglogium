import { readClient } from "./getClient.mjs";
const ids = ["moXlkADK7m1DHgGwWtbmis", "moXlkADK7m1DHgGwWtbnF3"];
const r = await readClient.fetch(`*[_id in $ids]{ _id, name, price, filterAttributes }`, { ids });
console.log(JSON.stringify(r, null, 2));
