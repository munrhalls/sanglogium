import Image from "next/image";
import {
  Carousel,
  CarouselTrack,
  CarouselSlide,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "@/app/components/layout/carousel/Carousel";

interface SpotlightHeroProps {
  gallery: string[];
  alt: string;
}

export default function SpotlightHero({ gallery, alt }: SpotlightHeroProps) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="relative aspect-square w-full max-w-xl mx-auto group">
      {/* Background Aura */}
      <div className="absolute inset-0 bg-brand-400/10 blur-[120px] rounded-full pointer-events-none" />
      
      <Carousel itemsCount={gallery.length}>
        {/* Added overflow-hidden and snap-mandatory to the track */}
        <CarouselTrack className="flex h-full overflow-hidden snap-x snap-mandatory scrollbar-none">
          {gallery.map((image, index) => (
            <CarouselSlide 
              key={index} 
              className="basis-full w-full h-full flex-shrink-0 snap-start flex items-center justify-center p-8 lg:p-12"
            >
              <div className="relative w-full h-full">
                <Image 
                  src={image} 
                  alt={`${alt} - view ${index + 1}`} 
                  fill 
                  className="object-contain drop-shadow-2xl select-none" 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={index === 0}
                />
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>

        {/* Improved Navigation Overlays */}
        <div className="absolute inset-0 flex items-center justify-between px-2 lg:px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <CarouselPrevious className="pointer-events-auto h-12 w-12 bg-brand-900/80 border-brand-800/50 text-brand-400 hover:border-brand-400 hover:text-brand-100" />
          <CarouselNext className="pointer-events-auto h-12 w-12 bg-brand-900/80 border-brand-800/50 text-brand-400 hover:border-brand-400 hover:text-brand-100" />
        </div>

        {/* Dots Positioning - Lifted slightly to avoid clipping */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20">
          <CarouselDots />
        </div>
      </Carousel>
    </div>
  );
}
