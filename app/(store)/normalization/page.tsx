import Shelf from "@/app/components/layout/general/Shelf";
import { getIemProductsBySlugs, HOME_12 } from "@/app/components/features/homepage/iems-gallery/getIemProducts";
import IemsGallery from "@/app/components/features/homepage/iems-gallery/IemsGallery";

export const revalidate = 3600;

export default async function NormalizationPage() {
  const iemsData = await getIemProductsBySlugs(HOME_12);

  return (
    <Shelf fullBleed spacing="loose">
      <IemsGallery iemsData={iemsData} />
    </Shelf>
  );
}
