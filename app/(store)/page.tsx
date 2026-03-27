import Hero from "@/app/components/features/homepage/hero/Hero";
import ProductSpotlight2 from "@/app/components/features/homepage/product-spotlight-2/ProductSpotlight2";
import ProductSpotlight3 from "@/app/components/features/homepage/product-spotlight-3/ProductSpotlight3";
import IemsGallery from "@/app/components/features/homepage/iems-gallery/IemsGallery";
import NewestRelease from "@/app/components/features/homepage/newest-release/NewestRelease";
import Dacs from "@/app/components/features/homepage/dacs/Dacs";
import Accessories from "@/app/components/features/homepage/accessories/Accessories";
import Shelf from "@/app/components/layout/general/Shelf";
import Featured from "@/app/components/features/homepage/featured";
import ProductSpotlight1 from "@/app/components/features/homepage/product-spotlight-1";
import { fetchHomepageData } from "./lib/fetchHomepageData";

export const revalidate = 3600;

export default async function HomePage() {
  const data = await fetchHomepageData();

  return (
    <div>
      <Hero heroData={data.hero} />

      <Shelf fullBleed>
        <Featured featuredData={data.featured} />
      </Shelf>

      <Shelf>
        <ProductSpotlight1 spotlightData={data.spotlight1} />

        <ProductSpotlight2 spotlightData={data.spotlight2} />

        <ProductSpotlight3 spotlightData={data.spotlight3} />
      </Shelf>

      <Shelf fullBleed>
        <IemsGallery iemsData={data.iemsGallery} />
      </Shelf>

      <Shelf>
        <NewestRelease newestReleaseData={data.newestRelease} />
      </Shelf>

      <Shelf fullBleed>
        <Dacs dacsData={data.dacs} />
      </Shelf>

      <Shelf fullBleed>
        <Accessories accessoriesData={data.accessories} />
      </Shelf>
    </div>
  );
}
