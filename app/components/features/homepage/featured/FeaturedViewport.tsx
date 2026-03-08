import { CarouselTrack } from '@/app/components/layout/carousel/CarouselTrack';
import { CarouselSlide } from '@/app/components/layout/carousel/CarouselSlide';
import Card from "./card/Card";

export default function FeaturedViewport({ products }: { products: any[] }) {
  return (
    <CarouselTrack className="gap-8 pb-4">
      {products.map((product) => (
        <CarouselSlide 
          key={product._id} 
          className="min-w-0 shrink-0 grow-0 basis-full md:basis-[calc(33.333%-21.33px)]"
        >
          <Card product={product} />
        </CarouselSlide>
      ))}
    </CarouselTrack>
  );
}
