import product from "./prod.json";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import SpotlightHero from "../shared-spotlight/SpotlightHero";

export default function ProductSpotlight3() {
  if (!product || !product.name) return null;

  // Handle both string description (Spotlight 3) and Array description (Spotlight 1 & 2)
  const descriptionText = typeof product.description === "string" 
    ? product.description 
    : product.description?.[0]?.children?.[0]?.text || "";

  return (
    <section className="py-32 bg-brand-900 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          
          {/* Visual Column: First on Mobile, First on Desktop */}
          <div className="order-1">
            <SpotlightHero 
              gallery={product.gallery} 
              alt={product.name} 
            />
          </div>

          {/* Content Column: Second on Mobile, Second on Desktop */}
          <div className="order-2">
            <SpotlightDetails 
              tag={product.headline || "The Golden Standard"}
              title={product.name}
              description={descriptionText}
              ctaText="Experience Utopia"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
