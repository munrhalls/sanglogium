import product from "./prod.json";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import SpotlightHero from "../shared-spotlight/SpotlightHero";

export default function ProductSpotlight2() {
  if (!product || !product.name) return null;
  const descriptionText = product.description?.[0]?.children?.[0]?.text || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div className="order-2 lg:order-1">
        <SpotlightDetails
          tag={product.headline || "Acoustic Precision"}
          title={product.name}
          description={descriptionText}
          ctaText="View Stealth"
        />
      </div>
      <div className="order-1 lg:order-2">
        <SpotlightHero gallery={product.gallery} alt={product.name} />
      </div>
    </div>
  );
}
