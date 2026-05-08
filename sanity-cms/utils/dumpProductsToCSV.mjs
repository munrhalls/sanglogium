import { createWriteStream } from "fs";
import client from "./getClient.mjs";

async function dumpProductsToCsv() {
  try {
    const allProducts = await client.fetch(
      `*[_type == "product"]{_id, title, brand, categoryPath, description, specifications}`
    );
    const stream = createWriteStream("all_products.csv");
    stream.write("ID,Title,Brand,Category,Description,Specifications\n");

    allProducts.forEach((product) => {
      const desc = product.description
        ? product.description
            .map((b) => b.children?.map((c) => c.text).join(" "))
            .join(" ")
            .replace(/"/g, '""')
        : "";
      const specs = product.specifications
        ? product.specifications
            .map((s) => `${s.title}: ${s.value}`)
            .join("; ")
            .replace(/"/g, '""')
        : "";

      const row = [
        product._id,
        `"${(product.title || "").replace(/"/g, '""')}"`,
        `"${(product.brand || "").replace(/"/g, '""')}"`,
        `"${(Array.isArray(product.categoryPath) ? product.categoryPath.join(" | ") : product.categoryPath || "").replace(/"/g, '""')}"`,
        `"${desc}"`,
        `"${specs}"`,
      ].join(",");

      stream.write(row + "\n");
    });

    stream.end();
    console.log(`Exported ${allProducts.length} products to all_products.csv`);
  } catch (error) {
    console.error(error);
  }
}

dumpProductsToCsv();
