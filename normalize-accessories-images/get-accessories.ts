import { fetchHomepageData } from "../app/(store)/lib/fetchHomepageData";

async function main() {
  const data = await fetchHomepageData();
  console.log(JSON.stringify({
    earpads: data.accessories.earpads.map(p => p.name),
    eartips: data.accessories.eartips.map(p => p.name),
    storage: data.accessories.storage.map(p => p.name),
  }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
