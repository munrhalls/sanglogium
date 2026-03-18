import React from "react";
import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import { sanityFetch } from "@/sanity/lib/client";
import { SpotlightProduct as SanitySpotlightProduct } from "../spotlightTypes";

export default async function ProductSpotlight2() {
  const product = await sanityFetch<SanitySpotlightProduct | null>({
    query: `*[_type == "homepage"][0].spotlight2->{
      _id,
      name,
      brand,
      displayPrice,
      image{asset->{url}},
      overviewFields
    }`
  });

  if (!product) return null;

  const mappedData = {
    id: product._id,
    brand: product.brand,
    name: product.name,
    headline: product.name,
    subheadline: product.overviewFields?.[0]?.value || product.name,
    description: product.overviewFields?.[0]?.information || "Unrivaled acoustic engineering and clarity.",
    mainImage: product.image?.asset?.url || ""
  };

  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="order-2 lg:order-1">
          <SpotlightDetails
            data={mappedData as any}
            accentColor="text-secondary-400"
          />
        </div>
        <div className="order-1 lg:order-2">
          <SpotlightHero image={mappedData.mainImage} tier="standard" />
        </div>
      </div>
    </section>
  );
}
