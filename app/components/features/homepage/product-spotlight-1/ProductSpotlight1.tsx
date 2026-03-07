import Spotlight from "@/app/components/layout/spotlight/Spotlight";
import product from "./prod.json";
import copyData from "./copy.json";

export default function ProductSpotlight1() {
  const copy = copyData as any;

  return (
    <Spotlight isReversed={false}>
      {/* CONTENT SLOT (order-2 on mobile for image-first stack) */}
      <div className="lg:col-span-7 order-2 lg:order-1">
        <p className="text-brand-400 font-mono text-sm uppercase tracking-widest">
          {product.brand}
        </p>

        <h2 className="text-display-2 font-bold my-4 uppercase italic">
          {product.name}
        </h2>

        {product.isGold && (
          <div className="mb-6">
            <span className="bg-brand-400 text-black text-[10px] font-bold px-3 py-1 rounded">
              GOLD STATUS
            </span>
          </div>
        )}

        <div className="text-brand-200 leading-relaxed text-body max-w-xl">
          {typeof copy.text === 'string' ? copy.text : "Content pending..."}
        </div>

        <p className="text-2xl text-brand-100 mt-8">${product.displayPrice}</p>
      </div>

      {/* IMAGE SLOT (order-1 on mobile) */}
      <div className="lg:col-span-5 order-1 lg:order-2">
        <div className="bg-brand-800/10 p-8 flex items-center justify-center aspect-square md:aspect-[4/5]">
          <img
            src={product.mainImage}
            alt={product.name}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-700"
          />
        </div>
      </div>
    </Spotlight>
  );
}