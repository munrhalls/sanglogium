import product from "./prod.json";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import SpotlightHero from "../shared-spotlight/SpotlightHero";

export default function ProductSpotlight3() {
  if (!product || !product.name) return null;
  const descriptionText = typeof product.description === "string"
    ? product.description
    : product.description?.[0]?.children?.[0]?.text || "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div className="order-1">
        <SpotlightHero gallery={product.gallery} alt={product.name} />
      </div>
      <div className="order-2">
        <SpotlightDetails
          tag={product.headline || "The Golden Standard"}
          title={product.name}
          description={descriptionText}
          ctaText="Experience Utopia"
        />
      </div>
    </div>
  );
}
