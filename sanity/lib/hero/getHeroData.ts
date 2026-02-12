import { defineQuery } from "next-sanity";
import { client } from "../client";

export const getHeroData = async () => {
  // CRITICAL "WHY":
  // - Now fetching TWO separate assets for true Art Direction.
  // - "mobileImage" takes priority on small screens.
  // - "backgroundImage" is reserved for desktop.

  const HERO_QUERY = defineQuery(`
    *[_type == "hero"] | order(_updatedAt desc)[0] {
      headline,
      subheadline,
      ctaText,

      backgroundImage {
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        hotspot,
        crop,
        alt
      },

      mobileBackgroundImage {
        asset->{
          _id,
          url,
          metadata {
            dimensions,
            lqip
          }
        },
        hotspot,
        crop,
        alt
      }
    }
  `);

  try {
    const heroData = await client.fetch(HERO_QUERY);
    return heroData || null;
  } catch (error) {
    console.error("Error fetching hero data:", error);
    return null;
  }
};
