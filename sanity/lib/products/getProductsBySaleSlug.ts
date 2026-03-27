import { defineQuery } from "next-sanity";
import { client } from "../client";

const getProductsBySaleSlug = async (slug: string) => {
  const PRODUCTS_BY_SALE_SLUG = await defineQuery(`
        *[_type == "product" && (
          _id in *[_type == "sale" && slug.current == $slug].products[]._ref
        )] | order(name asc)
      `);

  try {
    const products = await client.fetch(PRODUCTS_BY_SALE_SLUG, {
      slug,
    });
    return products || [];
  } catch (err) {
    console.error("Error fetching products by category: ", err);
    return [];
  }
};

export default getProductsBySaleSlug;
