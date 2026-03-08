import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import Card from "./card/Card";

export default function FeaturedViewport({ products }: { products: any[] }) {
  // Deduplicate products by _id
  const uniqueProducts = Array.from(
    new Map(products.map((p) => [p._id, p])).values()
  );

  return (
    <CarouselTrack className="flex -mx-4 overflow-x-auto snap-x snap-mandatory scrollbar-none">
      {uniqueProducts.map((product) => (
        <CarouselSlide 
          key={product._id} 
          className="px-4 basis-full md:basis-1/3 flex-shrink-0 snap-start"
        >
          <Card product={product} />
        </CarouselSlide>
      ))}
    </CarouselTrack>
  );
}
