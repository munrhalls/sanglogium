import Image from "next/image";
import Spotlight from "@/app/components/layout/spotlight/Spotlight";
import { Carousel, CarouselTrack, CarouselSlide, CarouselDots } from "@/app/components/layout/carousel/Carousel";
import data from "./data.json";

export default function NewestRelease() {
  const images = (data as any).images || [data.imageUrl];

  return (
    <div className="w-full">
      <Spotlight isReversed={false}>
        {/* Content Column (L) */}
        <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-8 bg-brand-400"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-500 text-cap">
              {data.tag}
            </span>
          </div>

          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3 text-cap">
            {data.brand}
          </p>
          <h2 className="text-display-2 font-light leading-none mb-8 tracking-tighter lowercase italic text-cap">
            {data.name}
          </h2>

          <p className="text-zinc-500 text-lg leading-relaxed mb-10 font-light max-w-sm italic">
            "{data.description}"
          </p>

          <div className="flex flex-col gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-zinc-400 uppercase font-bold">MSRP</span>
              <span className="text-4xl font-light tracking-tighter text-black">
                ${data.displayPrice}
              </span>
            </div>

            <button className="w-full lg:w-fit bg-black text-white px-10 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all active:scale-95 text-cap">
              Discover the Series
            </button>
          </div>
        </div>

        {/* Image Column (R) */}
        <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
          <div className="relative group w-full bg-zinc-50 overflow-hidden">
            <Carousel itemsCount={images.length}>
              <CarouselTrack className="flex h-80 lg:h-[450px]">
                {images.map((img: any, idx: number) => (
                  <CarouselSlide key={idx} className="basis-full flex-shrink-0 flex items-center justify-center p-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="absolute -inset-4 bg-zinc-200/50 rounded-full blur-3xl group-hover:bg-brand-400/20 transition-colors duration-1000"></div>
                      <img
                        src={img}
                        alt={`${data.name} view ${idx + 1}`}
                        className="relative max-h-full w-auto object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
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
    </div>
  );
}



