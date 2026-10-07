import Shelf from "@/platform/design/ui/Shelf";
import Hero from "./hero/Hero";
import TrustBar from "@/features/homepage/ui/trust-bar/TrustBar";
import Featured from "./featured/Featured";
import ProductSpotlightMediaLeft from "./product-spotlight-media-left/ProductSpotlightMediaLeft";
import ProductSpotlightMediaRight from "./product-spotlight-media-right/ProductSpotlightMediaRight";
import ProductSpotlightFractal from "@/features/homepage/ui/product-spotlight-fractal/ProductSpotlightFractal";
import IemsGallery from "@/features/homepage/ui/iems-gallery/IemsGallery";
import NewestRelease from "./newest-release/NewestRelease";
import Dacs from "./dacs/Dacs";
import Accessories from "./accessories/Accessories";
import type { HomepageData, IemProduct } from "@/features/homepage/core/rules/homepageTypes";

interface HomePageProps {
  data: HomepageData;
  iemsData: IemProduct[];
}

export default function HomePage({ data, iemsData }: HomePageProps) {
  return (
    <div>
      <Hero heroData={data.hero} />
      <TrustBar />

      <Shelf fullBleed spacing="loose" className="pt-0 md:pt-0 lg:pt-0 lg-touch:pt-0">
        <Featured featuredData={data.featured} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlightMediaLeft spotlightData={data.spotlight1} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlightMediaRight spotlightData={data.spotlight2} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlightFractal spotlightData={data.spotlight3} />
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
