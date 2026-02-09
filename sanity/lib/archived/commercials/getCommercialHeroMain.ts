import { defineQuery } from "next-sanity";
import { client } from "../client";

const GET_COMMERCIALS_HERO_MAIN =
  defineQuery(`*[_type == "commercial" && feature == "hero-main" && defined(image.asset)]
  | order(displayOrder asc) [0]
  {
    _id,
    "image": image.asset->url + "?fm=webp&w=1200&q=55",
    "blurDataURL": image.asset->url + "?w=20&h=20&blur=10&q=20",
    text,
    ctaLink,
    sale-> {
      discount,
      validUntil,
      _id
    }
  }`);

export const getCommercialHeroMain = async () => {
  try {
    const commercial = await client.fetch(
      GET_COMMERCIALS_HERO_MAIN,
      { feature: "hero-main" },
      {
        cache: "force-cache",
        next: { revalidate: 300 },
      }
    );

    return commercial || null;
  } catch (err) {
    console.error("Error fetching commercials by feature: ", err);
    return [];
  }
};
