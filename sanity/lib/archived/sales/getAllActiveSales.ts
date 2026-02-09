import { defineQuery } from "next-sanity";
import { client } from "../client";

export const getAllActiveSales = async () => {
  const GET_ACTIVE_SALES_QUERY = defineQuery(`
      *[_type == "sale" && isActive == true] {
        _id,
        title,
        "slug": slug.current,
        discount,
        validFrom,
        validUntil,
        isActive
      }
    `);

  try {
    const sales = await client.fetch(GET_ACTIVE_SALES_QUERY);

    return sales || [];
  } catch (err) {
    console.error("Error fetching active sales: ", err);
  }
};
