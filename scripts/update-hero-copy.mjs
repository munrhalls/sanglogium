#!/usr/bin/env node
/**
 * One-off: update the live Sanity `hero` document copy.
 * Headline / subheadline / CTA text per decision; ctaLink intentionally untouched.
 */
import { createClient } from "next-sanity";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-11-14";
const token =
  process.env.SANITY_STUDIO_READ_WRITE_CREATE ||
  process.env.SANITY_STUDIO_READ_WRITE ||
  process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing Sanity env vars (projectId/dataset/token)");
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token });

const NEW_COPY = {
  headline: "Premium Headphones",
  subheadline: "Curated by audio engineers",
  ctaText: "Shop the Collection",
  ctaLink: "/products",
};

async function main() {
  const hero = await client.fetch(
    `*[_type == "hero"] | order(_updatedAt desc)[0] {
      _id, headline, subheadline, ctaText, ctaLink
    }`
  );
  if (!hero) throw new Error("No hero document found in dataset");

  console.log("Current hero document:");
  console.log(
    JSON.stringify(
      { _id: hero._id, headline: hero.headline, subheadline: hero.subheadline, ctaText: hero.ctaText, ctaLink: hero.ctaLink },
      null,
      2
    )
  );

  await client.patch(hero._id).set(NEW_COPY).commit();
  console.log("Patched:", JSON.stringify(NEW_COPY));

  const after = await client.fetch(
    `*[_type == "hero"] | order(_updatedAt desc)[0] {
      headline, subheadline, ctaText, ctaLink
    }`
  );
  console.log("Verified hero document now:");
  console.log(JSON.stringify(after, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
