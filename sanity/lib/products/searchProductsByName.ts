import { defineQuery } from "next-sanity";
import { client } from "../client";

type Query = string | string[];

export const searchProductsByName = async (
  searchParam: Query,
  catalogueKeys?: string[]
) => {
  const catalogueKeyFilter = catalogueKeys && catalogueKeys.length > 0
    ? `&& count(catalogueLocationKeys[@ in $catalogueKeys]) > 0`
    : "";

  const SEARCH_FOR_PRODUCTS_QUERY = defineQuery(`*[
        _type == "product"
        && name match $searchParam
        ${catalogueKeyFilter}
    ] | order(name asc)`);

  try {
    const products = await client.fetch(SEARCH_FOR_PRODUCTS_QUERY, {
      searchParam: `${searchParam}*`,
      catalogueKeys: catalogueKeys || [],
    });
    return products || [];
  } catch (err) {
    console.error("Products search resulted in error: ", err);
    return [];
  }
};
