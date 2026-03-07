import Spotlight from "@/app/components/layout/spotlight/Spotlight";
import { Carousel, CarouselTrack, CarouselSlide, CarouselDots } from "@/app/components/layout/carousel/Carousel";
import product from "./prod.json";
import copyData from "./copy.json";

export default function ProductSpotlight2() {
  const copy = copyData as any;
  const images = (product as any).images || [product.mainImage];

  return (
    <section className="py-20 bg-transparent">
      <Spotlight isReversed={true}>
        <div className="lg:col-span-7 order-2 flex flex-col justify-center">
          <p className="text-brand-400 font-mono text-[10px] uppercase tracking-widest text-cap mb-4">
            {product.brand}
          </p>
          <h2 className="text-display-2 font-bold uppercase italic text-brand-100 text-cap mb-6 leading-[1.1]">
            {product.name}
          </h2>
          {product.isGold && (
            <div className="mb-6">
              <span className="bg-brand-400 text-black text-[10px] font-bold px-3 py-1 rounded">GOLD STATUS</span>
            </div>
          )}
          <div className="text-brand-200 text-body leading-relaxed max-w-xl mb-8">
            {typeof copy.text === 'string' ? copy.text : "Content pending..."}
          </div>
          <p className="text-h2 font-bold text-brand-100 italic">${product.displayPrice}</p>
        </div>

        <div className="lg:col-span-5 order-1">
          <div className="bg-brand-800/10 relative group overflow-hidden">
            <Carousel itemsCount={images.length}>
              <CarouselTrack className="flex h-80 lg:h-[450px]">
                {images.map((img: any, idx: number) => (
                  <CarouselSlide key={idx} className="basis-full flex-shrink-0 flex items-center justify-center p-8">
                    <img
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                    />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <CarouselDots />
              </div>
            </Carousel>
          </div>
        </div>
      </Spotlight>
    </section>
  );
}