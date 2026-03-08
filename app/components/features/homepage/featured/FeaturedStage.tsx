import { CarouselTrack, CarouselSlide } from "@/app/components/layout/carousel/Carousel";
import FeaturedCard from "./FeaturedCard";

export default function FeaturedStage({ products }: { products: any[] }) {
  return (
    <CarouselTrack className="flex gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none">
      {products.map((product) => (
        <CarouselSlide
          key={product._id}
          className="basis-full md:basis-1/3 flex-shrink-0 snap-start"
        >
          <FeaturedCard product={product} />
        </CarouselSlide>
      ))}
    </CarouselTrack>
  );
}

