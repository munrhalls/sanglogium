import React from "react";
import Grid from "@/app/components/layout/grid/Grid";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";
import { getIemProducts } from "./getIemProducts";

export default async function IemsGallery() {
  const products = await getIemProducts();

  if (!products.length) return null;

  return (
    <>
      <IemsGalleryHeader />
      <Grid cols={4}>
        {products.map((iem) => (
          <IemCard key={iem._id} product={iem as any} />
        ))}
      </Grid>
    </>
  );
}
