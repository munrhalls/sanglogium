import { client } from "../client";

export const getProductsByVfsKeys = async (keys: string[]) => {
  const PRODUCTS_BY_VFS_KEYS_QUERY = `*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] | order(name asc)`;

  try {
    const products = await client.fetch(PRODUCTS_BY_VFS_KEYS_QUERY, { keys });
    return products || [];
  } catch (err) {
    console.error("Error fetching products by VFS keys:", err);
    return [];
  }
};
