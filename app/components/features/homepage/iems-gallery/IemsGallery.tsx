import React from "react";
import Grid from "@/app/components/layout/grid/Grid";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";
import { getIemProducts } from "./getIemProducts";

export default async function IemsGallery() {
  const products = await getIemProducts();

  if (!products.length) return null;

  return (
    <article className="w-full relative overflow-hidden bg-brand-900">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[5%] -left-[5%] w-[60%] h-[60%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-20" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content">
          <div className="flex flex-col gap-4">
            <IemsGalleryHeader />
            <Grid cols={4}>
              {products.map((iem, idx) => (
                <IemCard key={iem._id} product={iem as any} idx={idx} />
              ))}
            </Grid>
          </div>
        </div>
      </div>
    </article>
  );
}
