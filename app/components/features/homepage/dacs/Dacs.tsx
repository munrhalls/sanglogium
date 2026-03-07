"use client";
import Image from "next/image";


import dacs from "./data.json";
import {
  Carousel,
  CarouselTrack,
  CarouselSlide,
  CarouselNext,
  CarouselPrevious,
  CarouselDots
} from "@/app/components/layout/carousel/Carousel";
import { cn } from "@/lib/utils/tailwind";

export default function DACs() {
  return (
    <div className="w-full">
      <Carousel itemsCount={dacs.length}>
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-display-2 font-bold uppercase italic text-brand-100 text-cap">
              Signal <span className="text-brand-400 font-bold not-italic">&</span> Power
            </h2>
            <p className="text-brand-400 font-mono text-[10px] uppercase tracking-widest mt-2">
              Premium DACs, Amps, and Receivers
            </p>
          </div>
        </div>

        <CarouselTrack className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory">
          {dacs.map((item) => (
            <CarouselSlide
              key={item._id}
              className="basis-full 2xs:basis-1/2 md:basis-1/3 lg:basis-1/3 flex-shrink-0 snap-start"
            >
              <div className="group relative border-l border-brand-800/30 pl-6 py-4 hover:border-brand-400 transition-colors duration-500">
                <div className="aspect-video mb-6 overflow-hidden bg-brand-800/10 flex items-center justify-center p-4">
                  <div className="relative w-full h-full"><Image src={item.imageUrl} alt={item.name} fill className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" /></div>
                </div>
                <span className="text-[10px] font-bold text-brand-400 tracking-widest uppercase text-cap">
                  {item.brand}
                </span>
                <h3 className="text-body font-medium text-brand-100 mt-1 mb-4 line-clamp-1 group-hover:text-white transition-colors">
                  {item.name}
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-brand-50">
                    ${item.displayPrice.toLocaleString()}
                  </span>
                  <button className="text-[10px] uppercase tracking-widest text-brand-400 border border-brand-800/50 px-3 py-1 group-hover:border-brand-400 group-hover:text-brand-100 transition-all">
                    Specs
                  </button>
                </div>
              </div>
            </CarouselSlide>
          ))}
        </CarouselTrack>

        <div className="mt-12 flex items-center justify-between">
          <CarouselDots />
          <div className="flex gap-2">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 border-brand-800/50 bg-brand-900/50" />
            <CarouselNext className="static translate-y-0 h-10 w-10 border-brand-800/50 bg-brand-900/50" />
          </div>
        </div>
      </Carousel>
    </div>
  );
}

