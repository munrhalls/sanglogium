import "server-only";

import { sanityFetch } from "@/platform/sanity/client";
import { defineQuery } from "next-sanity";
import type { HeroData } from "@/features/homepage/core/types/homepageTypes";

/**
 * Separate query for hero document (different document type)
 */
const HERO_QUERY = defineQuery(`
  *[_type == "hero"] | order(_updatedAt desc)[0] {
    headline,
    subheadline,
    ctaText,
    ctaLink,
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

/**
 * Fetch hero data from hero document.
 * Separate query because hero is a different document type.
 */
export async function fetchHeroData(): Promise<HeroData | null> {
  const heroData = await sanityFetch<HeroData>({ query: HERO_QUERY });
  return heroData || null;
}
