import Shelf from "@/platform/design/ui/Shelf";
import HeroView from "./HeroView";
import TrustBar from "@/features/homepage/ui/TrustBar";
import FeaturedView from "./FeaturedView";
import ProductSpotlightMediaLeftView from "./ProductSpotlightMediaLeftView";
import ProductSpotlightMediaRightView from "./ProductSpotlightMediaRightView";
import ProductSpotlightFractal from "@/features/homepage/ui/ProductSpotlightFractal";
import IemsGallery from "@/features/homepage/ui/iems-gallery/IemsGallery";
import NewestReleaseView from "./NewestReleaseView";
import DacsView from "./DacsView";
import AccessoriesView from "./AccessoriesView";
import type { HomepageData, IemProduct } from "@/features/homepage/core/types/homepageTypes";

interface HomePageProps {
  data: HomepageData;
  iemsData: IemProduct[];
}

export default function HomepageView({ data, iemsData }: HomePageProps) {
  return (
    <div>
      <HeroView heroData={data.hero} />
      <TrustBar />

      <Shelf fullBleed spacing="loose" className="pt-0 md:pt-0 lg:pt-0 lg-touch:pt-0">
        <FeaturedView featuredData={data.featured} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlightMediaLeftView spotlightData={data.spotlight1} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlightMediaRightView spotlightData={data.spotlight2} />
      </Shelf>

      <Shelf spacing="loose">
        <ProductSpotlightFractal spotlightData={data.spotlight3} />
      </Shelf>

      <Shelf fullBleed spacing="loose">
        <IemsGallery iemsData={iemsData} />
      </Shelf>

      <Shelf fullBleed spacing="tight">
        <NewestReleaseView newestReleaseData={data.newestRelease} />
      </Shelf>

      <Shelf fullBleed spacing="default">
        <DacsView dacsData={data.dacs as any} />
      </Shelf>

      <Shelf fullBleed spacing="default" className="bg-brand-700">
        <AccessoriesView accessoriesData={data.accessories} />
      </Shelf>
    </div>
  );
}
