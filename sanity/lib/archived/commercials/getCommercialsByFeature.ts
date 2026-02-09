import { defineQuery } from "next-sanity";
import { client } from "../client";

const GET_COMMERCIALS_BY_FEATURE_QUERY =
  defineQuery(`*[_type == "commercial" && feature == $feature] | order(displayOrder asc) {
    _id,
    title,
    "image": image.asset->url,
    variant,
    displayOrder,
    text,
    ctaLink,
    "products": products[]-> {
      _id,
      brand,
      name,
      description,
      price,
      "image": image.asset->url,
    },
    sale-> {
      discount,
      validUntil,
      _id
    }
  }`);

export const getCommercialsByFeature = async (feature: string) => {
  try {
    const commercials = await client.fetch(
      GET_COMMERCIALS_BY_FEATURE_QUERY,
      { feature },
      {
        cache: "force-cache",
        next: { revalidate: 300 },
      }
    );

    return commercials || [];
  } catch (err) {
    console.error("Error fetching commercials by feature: ", err);
    return [];
  }
};
