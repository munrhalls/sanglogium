import React from "react";
import Link from "next/link";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";
import { IemProduct } from "./getIemProducts";

interface IemsGalleryProps {
  iemsData: IemProduct[];
}

export default async function IemsGallery({ iemsData }: IemsGalleryProps) {
  if (!iemsData.length) return null;

  const displayed = iemsData.slice(0, 6);

  return (
    <article className="w-full relative overflow-hidden border-y border-border-secondary bg-brand-900">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[5%] -left-[5%] w-[60%] h-[60%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content px-6 py-16 lg:px-8">
          <div className="flex flex-col gap-6 md:gap-8">
            <IemsGalleryHeader href="/products/headphones/monitors-iems" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {displayed.map((iem, idx) => (
                <IemCard key={iem._id} product={iem} idx={idx} />
              ))}
            </div>
            {iemsData.length > 6 && (
              <div className="flex justify-center pt-4">
                <Link
                  href="/products/headphones/monitors-iems"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border border-brand-400 hover:border-brand-100 text-brand-400 hover:text-brand-100 text-xs tracking-widest uppercase font-light whitespace-nowrap transition-colors duration-200 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-100 sm:btn-ghost sm:w-auto sm:border-none sm:p-0 sm:text-sm sm:tracking-editorial"
                >
                  View All In-Ear Monitors →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
