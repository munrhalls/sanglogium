import IemsGallery from "@/app/components/features/homepage/iems-gallery/IemsGallery";
import { getIemProductsBySlugs } from "@/sanity-cms/lib/homepage/getIemProductsBySlugs";
import { Hero, TrustBar, Featured, ProductSpotlight1, ProductSpotlight2, ProductSpotlight3, HOME_12 } from "@/features/homepage";
import NewestRelease from "@/app/components/features/homepage/newest-release/NewestRelease";
import Dacs from "@/app/components/features/homepage/dacs/Dacs";
import Accessories from "@/app/components/features/homepage/accessories/Accessories";
import Shelf from "@/app/components/layout/general/Shelf";
import { fetchHomepageData } from "./lib/fetchHomepageData";

export const revalidate = 3600;

export default async function HomePage() {
  const data = await fetchHomepageData();
  const iemsData = await getIemProductsBySlugs(HOME_12);

  return (
    <div>
      <Hero heroData={data.hero} />
      <TrustBar />

      <Shelf fullBleed spacing="loose" className="pt-0 md:pt-0 lg:pt-0 lg-touch:pt-0">
        <Featured featuredData={data.featured} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlight1 spotlightData={data.spotlight1} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlight2 spotlightData={data.spotlight2} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlight3 spotlightData={data.spotlight3} />
      </Shelf>

      <Shelf fullBleed spacing="loose">
        <IemsGallery iemsData={iemsData} />
      </Shelf>

      <Shelf fullBleed spacing="tight">
        <NewestRelease newestReleaseData={data.newestRelease} />
      </Shelf>

      <Shelf fullBleed spacing="default">
        <Dacs dacsData={data.dacs as any} />
      </Shelf>

      <Shelf fullBleed spacing="default" className="bg-brand-700">
        <Accessories accessoriesData={data.accessories} />
      </Shelf>
    </div>
  );
}
