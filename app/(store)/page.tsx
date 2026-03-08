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

      {/* The Featured section now correctly triggers the Platinum Slab physics */}
      <Shelf variant="platinum">
        <Featured />
      </Shelf>

      <Shelf>
        <ProductSpotlight1 />
      </Shelf>

      <Shelf>
        <ProductSpotlight2 />
      </Shelf>

      <Shelf>
        <ProductSpotlight3 />
      </Shelf>

      <Shelf>
        <IemsGallery />
      </Shelf>

      <Shelf>
        <NewestRelease />
      </Shelf>

      <Shelf>
        <Dacs />
      </Shelf>

      <Shelf>
        <Accessories />
      </Shelf>
    </div>
  );
}
