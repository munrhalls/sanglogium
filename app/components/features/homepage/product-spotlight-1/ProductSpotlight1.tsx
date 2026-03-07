import product from "./prod.json"; 
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import SpotlightHero from "../shared-spotlight/SpotlightHero";

export default function ProductSpotlight1() {
  if (!product || !product.name) return null;

  const descriptionText = product.description?.[0]?.children?.[0]?.text || "";

  return (
    <section className="py-32 bg-brand-900 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          {/* Visual Block */}
          <div className="order-1">
            <SpotlightHero 
              gallery={product.gallery} 
              alt={product.name} 
            />
          </div>
          
          {/* Details Block */}
          <div className="order-2">
            <SpotlightDetails 
              tag={product.headline || "The New Standard"}
              title={product.name}
              description={descriptionText}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
