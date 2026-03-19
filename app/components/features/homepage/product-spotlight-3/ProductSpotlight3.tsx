import React from "react";
import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import { getSpotlight3Product } from "./getSpotlight3Product";

export default async function ProductSpotlight3() {
  const data = await getSpotlight3Product();

  if (!data?.productRef) return null;
  const product = data.productRef;

  const mappedData = {
    id: product._id,
    brand: product.brand,
    name: product.name,
    headline: data.promoTitle || product.name,
    subheadline: data.promoSubtitle || product.overviewFields?.[0]?.value || product.name,
    description: data.promoText || product.overviewFields?.[0]?.information || "Unrivaled acoustic engineering and clarity.",
    mainImage: product.image?.asset?.url || ""
  };

  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        <div className="order-2 lg:order-2">
          <SpotlightDetails
            data={mappedData as any}
            accentColor="text-accent-500"
          />
        </div>
        <div className="order-1 lg:order-1">
          <SpotlightHero image={mappedData.mainImage} tier="gold" />
        </div>
      </div>
    </section>
  );
}
