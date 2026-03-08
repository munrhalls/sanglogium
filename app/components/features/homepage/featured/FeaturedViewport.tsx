import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import Card from "./card/Card";

export default function FeaturedViewport({ products }: { products: any[] }) {
  return (
    <CarouselTrack className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none">
      {products.map((product) => (
        <CarouselSlide key={product._id} className="basis-full md:basis-1/3 flex-shrink-0 snap-start">
          <Card product={product} />
        </CarouselSlide>
      ))}
    </CarouselTrack>
  );
}
