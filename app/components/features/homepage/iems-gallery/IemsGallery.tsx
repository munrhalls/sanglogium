import React from "react";
import Grid from "@/app/components/layout/grid/Grid";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";
import { getIemProducts } from "./getIemProducts";

export default async function IemsGallery() {
  const products = await getIemProducts();

  if (!products.length) return null;

  return (
    <div className="flex flex-col gap-4">
      <IemsGalleryHeader />
      <Grid cols={4}>
        {products.map((iem, idx) => (
          <IemCard key={iem._id} product={iem as any} idx={idx} />
        ))}
      </Grid>
    </div>
  );
}
