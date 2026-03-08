import { cn } from "@/lib/utils/tailwind";
import CarouselMediaBox from "@/app/components/layout/carousel/CarouselMediaBox";

export default function FeaturedProduct({ product }: { product: any }) {
  return (
    <div className="group flex flex-col h-full bg-white transition-all duration-500 hover:shadow-xl">
      {/* Product Image Layer: Whiter Platinum (Secondary-50) container */}
      <div className="bg-white p-6">
        <CarouselMediaBox 
          src={product.imageUrl} 
          alt={product.name} 
        />
      </div>
      
      {/* Content Layer: Absolute Void (Brand-900) */}
      <div className="flex flex-col flex-grow p-6 bg-brand-900 text-brand-100">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-400 mb-2">
          {product.brand}
        </span>
        <h4 className="text-body font-bold leading-tight mb-6 line-clamp-2 h-12">
          {product.name}
        </h4>
        
        <div className="mt-auto flex items-center justify-between">
          <span className="text-h4 font-bold tracking-tighter">
            ${product.displayPrice}
          </span>
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-brand-100 text-brand-900">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
