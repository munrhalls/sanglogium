import Hero from "@/app/components/features/homepage/hero/Hero";
import Featured from "@/app/components/features/homepage/featured/Featured";
import ProductSpotlight1 from "@/app/components/features/homepage/product-spotlight-1/ProductSpotlight1";
import ProductSpotlight2 from "@/app/components/features/homepage/product-spotlight-2/ProductSpotlight2";
import ProductSpotlight3 from "@/app/components/features/homepage/product-spotlight-3/ProductSpotlight3";
import IemsGallery from "@/app/components/features/homepage/iems-gallery/IemsGallery";
import NewestRelease from "@/app/components/features/homepage/newest-release/NewestRelease";
import Dacs from "@/app/components/features/homepage/dacs/Dacs";
import Accessories from "@/app/components/features/homepage/accessories/Accessories";
import Shelf from "@/app/components/layout/general/Shelf";

export default function HomePage() {
  return (
    <div>
      <Hero />

      <Shelf>
        <Featured />
        {/* CAROUSEL */}
      </Shelf>

      <Shelf>
        <ProductSpotlight1 />
        {/* A 50/50 or 60/40 grid split. Vertically stacks on mobile. */}
      </Shelf>

      <Shelf>
        <ProductSpotlight2 />
        {/* A 50/50 or 60/40 grid split. Vertically stacks on mobile. */}
      </Shelf>

      <Shelf>
        <ProductSpotlight3 />
        {/* A 50/50 or 60/40 grid split. Vertically stacks on mobile. */}
      </Shelf>


      <Shelf>
        <IemsGallery />
        {/* A 4X4 grid (16 ITEMS) for non-sliding content */}
      </Shelf>

      <Shelf>
        <NewestRelease />
        {/* A 50/50 or 60/40 grid split. Vertically stacks on mobile. */}

      </Shelf>

      <Shelf>
        <Dacs />
        {/* CAROUSEL */}
      </Shelf>

      <Shelf>
        <Accessories />
        {/* CAROUSEL HOUSING GRID PER SLIDE */}
      </Shelf>
    </div>
  );
}
