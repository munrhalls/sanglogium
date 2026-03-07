import Spotlight from "@/app/components/layout/spotlight/Spotlight";
import product from "./prod.json";
import copyData from "./copy.json";

export default function ProductSpotlight2() {
  const copy = copyData as any;

  return (
    <Spotlight isReversed={true}>
      <div className="lg:col-span-7 order-2">
        <p className="text-brand-400 font-mono text-sm uppercase tracking-widest">{product.brand}</p>
        <h2 className="text-display-2 font-bold my-4 uppercase italic leading-[1.1]">{product.name}</h2>
        {product.isGold && (
          <div className="mb-6">
            <span className="bg-brand-400 text-black text-[10px] font-bold px-3 py-1 rounded">GOLD STATUS</span>
          </div>
        )}
        <div className="text-brand-200 text-body leading-relaxed max-w-xl">
          {typeof copy.text === 'string' ? copy.text : "Content pending..."}
        </div>
        <p className="text-2xl text-brand-100 mt-8">${product.displayPrice}</p>
      </div>

      <div className="lg:col-span-5 order-1">
        <div className="bg-brand-800/10 p-8 flex items-center justify-center aspect-square md:aspect-[4/5]">
          <img src={product.mainImage} alt={product.name} className="w-full h-full object-contain" />
        </div>
      </div>
    </Spotlight>
  );
}