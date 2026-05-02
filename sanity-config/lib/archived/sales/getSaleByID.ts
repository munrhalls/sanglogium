import { defineQuery } from "next-sanity";
import { client } from "../client";

export const getSaleById = async (saleId: string) => {
  const SALE_BY_ID_QUERY = defineQuery(`
    *[_type == "sale" && _id == $saleId]{
      name,
      "slug": slug.current,
      validFrom,
      validUntil,
      isActive,
      description,
      "image": image.asset->url,
      category->{
        name,
        "slug": slug.current,
        "products": *[_type=='product' && categoryPath == ^.metadata.path]{
          name,
          "slug": slug.current,
          image,
          defaultPrice
        }
      }
    }
  `);

  try {
    const sale = await client.fetch(SALE_BY_ID_QUERY, {
      saleId,
    });

    return sale || [];
  } catch (err) {
    console.error("Fetching sale by ID failed: ", err);
    return [];
  }
};
