import iemsSource from "./data.json";
import { IemProduct } from "./types";
import Grid from "@/app/components/layout/grid/Grid";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";

const iems = iemsSource as IemProduct[];

export default function IemsGallery() {
  console.log(`[SRIP Trace] IEMs Gallery Data Contract validated. Items loaded: ${iems.length}`);

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
