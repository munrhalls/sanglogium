import { writeFileSync } from "fs";
import client from "./getClient.mjs";

async function saveInventoryJson() {
  try {
    const inventoryData = await client.fetch(`*[_type == "product"]{
      title,
      brand,
      categoryPath,
    }`);

    writeFileSync(
      "inventory_export.json",
      JSON.stringify(inventoryData, null, 2)
    );
    console.log("Data saved to inventory_export.json");
  } catch (error) {
    console.error(error);
  }
}

saveInventoryJson();
