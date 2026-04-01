import React from "react";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";
import { IemProduct } from "./getIemProducts";

interface IemsGalleryProps {
  iemsData: IemProduct[];
}

export default async function IemsGallery({ iemsData }: IemsGalleryProps) {
  if (!iemsData.length) return null;

  return (
    <article className="w-full relative overflow-hidden bg-brand-900">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[5%] -left-[5%] w-[60%] h-[60%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content">
          <div className="flex flex-col gap-4">
            <IemsGalleryHeader />
            <div className="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg-desktop:grid-cols-4 lg-touch:grid-cols-3">
              {iemsData.map((iem, idx) => (
                <IemCard key={iem._id} product={iem as any} idx={idx} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
