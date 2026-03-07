import iems from "./data.json";
import Grid from "@/app/components/layout/grid/Grid";
import IemsGalleryHeader from "./IemsGalleryHeader";
import IemCard from "./IemCard";

export default function IemsGallery() {
  return (
    <section className="w-full">
      <IemsGalleryHeader />

      <Grid cols={4}>
        {iems.map((iem) => (
          <IemCard key={iem._id} iem={iem} />
        ))}
      </Grid>
    </section>
  );
}
