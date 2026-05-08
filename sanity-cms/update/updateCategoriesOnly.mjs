import fs from "fs";
import path from "path";
import client from "../utils/getClient.mjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFilePath = path.join(__dirname, "./sanityProducts.json");

const getExistingProduct = async (slug) => {
  const query = `*[_type == "product" && slug.current == $slug][0]`;
  const params = { slug };
  return await client.fetch(query, params);
};

const updateCategoryPath = async (existingProduct, newCategoryPath) => {
  try {
    const updatedProduct = {
      ...existingProduct,
      categoryPath: newCategoryPath,
    };

    await client.createOrReplace(updatedProduct);
    return true;
  } catch (error) {
    console.error(
      `Error updating categoryPath for product ${existingProduct.name}:`,
      error.message,
    );
    return false;
  }
};

const upload = async () => {
  try {
    const data = await fs.promises.readFile(inputFilePath, "utf8");
    const products = JSON.parse(data);
    let productsUpdated = 0;
    let productsSkipped = 0;

    for (const product of products) {
      try {
        if (!product.slug || !product.slug.current) {
          console.error(`Product is missing slug: ${product.name}`);
          productsSkipped++;
          continue;
        }

        const existingProduct = await getExistingProduct(product.slug.current);

        if (existingProduct) {
          console.log(`Updating categoryPath for: ${product.slug.current}`);
          console.log(`Old categoryPath:`, existingProduct.categoryPath);
          console.log(`New categoryPath:`, product.categoryPath);

          const success = await updateCategoryPath(
            existingProduct,
            product.categoryPath,
          );
          if (success) {
            productsUpdated++;
          } else {
            productsSkipped++;
          }
        } else {
          console.log(`Product not found: ${product.slug.current}`);
          productsSkipped++;
        }
      } catch (error) {
        console.error(
          `Error processing product ${product.name}:`,
          error.message,
        );
        productsSkipped++;
      }
    }

    console.log(`\nUpdate completed:`);
    console.log(`Products updated: ${productsUpdated}`);
    console.log(`Products skipped: ${productsSkipped}`);
  } catch (error) {
    console.error("Error during update:", error.message);
  }
};

upload();
