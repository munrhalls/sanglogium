import Spotlight from "@/app/components/layout/spotlight/Spotlight";
import { Carousel, CarouselTrack, CarouselSlide, CarouselDots } from "@/app/components/layout/carousel/Carousel";
import SpotlightMediaBox from "@/app/components/layout/spotlight/SpotlightMediaBox";
import data from "./data.json";

export default function NewestRelease() {
  const images = (data as any).images || [data.imageUrl];

  return (
    <Spotlight isReversed={false}>
      <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
        <div className="flex items-center gap-3 mb-8">
          <span className="h-px w-8 bg-brand-400"></span>
          <span className="text-small text-cap font-bold uppercase text-brand-500">
            {data.tag}
          </span>
        </div>
        <p className="text-small text-cap font-mono text-zinc-400 uppercase mb-3">
          {data.brand}
        </p>
        <h2 className="text-display-2 font-light leading-none mb-8 tracking-tighter lowercase italic text-cap">
          {data.name}
        </h2>
        <p className="text-body text-zinc-500 leading-relaxed mb-10 font-light max-w-sm italic">      
          "{data.description}"
        </p>
        <div className="flex flex-col gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-small font-bold text-zinc-400 uppercase">MSRP</span>
            <span className="text-display-2 font-light tracking-tighter text-brand-100">
              ${data.displayPrice}
            </span>
          </div>
          <button className="w-fit bg-brand-400 text-brand-900 px-10 py-5 text-small text-cap font-bold uppercase hover:bg-brand-200 transition-all">
            Discover the Series
          </button>
        </div>
      </div>

      <div className="lg:col-span-5 flex items-center justify-center order-1 lg:order-2">
        <div className="relative group w-full overflow-hidden">
          <Carousel itemsCount={images.length}>
            <CarouselTrack className="flex h-80 lg:h-[450px]"> // @coherence-bypass
              {images.map((img: any, idx: number) => (
                <CarouselSlide key={idx} className="basis-full flex-shrink-0">
                   <SpotlightMediaBox src={img} alt={data.name} />
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
  );
}
