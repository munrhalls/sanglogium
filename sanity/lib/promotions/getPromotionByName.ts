import { defineQuery } from "next-sanity";
import { client } from "../client";

export const getPromotionByName = async (name: string) => {
  const PROMOTION_BY_NAME_QUERY = defineQuery(`
    *[_type == "promotion" && internalTitle == $name][0]  {
      _id,
     promotion_text,
        cta_text,
        cta_background,
      "image_background": {
        "src": image_background.asset->url,
        "alt": image_background.alt,
        "width": image_background.asset->metadata.dimensions.width,
        "height": image_background.asset->metadata.dimensions.height,
        "blurDataURL": image_background.asset->metadata.lqip
      }
    }
  `);

  try {
    const promotion = await client.fetch(PROMOTION_BY_NAME_QUERY, { name });
    return promotion || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
