import React from "react";
import { sanityFetch } from "@/sanity/lib/client";
import Grid from "@/app/components/layout/grid/Grid";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";

export default async function IemsGallery() {
  const iems = await sanityFetch<any[]>({
    query: `*[_type == "homepage"][0].iemsGallery[]->{
      _id,
      name,
      brand,
      displayPrice,
      image{asset->{url}}
    }`
  });

  if (!iems || iems.length === 0) return null;

  return (
    <>
      <IemsGalleryHeader />
      <Grid cols={4}>
        {iems.map((iem) => (
          <IemCard key={iem._id} product={iem} />
        ))}
      </Grid>
    </>
  );
}
