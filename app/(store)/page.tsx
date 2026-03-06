import Hero from "@/app/components/features/homepage/hero/Hero";
import FeaturedCarousel from "@/app/components/features/homepage/featured-carousel/FeaturedCarousel";
import ProductSpotlight1 from "@/app/components/features/homepage/product-spotlight-1/ProductSpotlight1";
import ProductSpotlight2 from "@/app/components/features/homepage/product-spotlight-2/ProductSpotlight2";
import ProductSpotlight3 from "@/app/components/features/homepage/product-spotlight-3/ProductSpotlight3";
import IemsGallery from "@/app/components/features/homepage/iems-gallery/IemsGallery";
import AccessoriesCarousel from "@/app/components/features/homepage/accessories-carousel/AccessoriesCarousel";
import Shelf from "@/app/components/layout/homepage/Shelf";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Shelf>
        <FeaturedCarousel />
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
        <AccessoriesCarousel />
      </Shelf>
    </div>
  );
}
