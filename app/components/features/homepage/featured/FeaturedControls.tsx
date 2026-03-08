import { CarouselNext, CarouselPrevious, CarouselDots } from "@/app/components/layout/carousel/Carousel";

export default function FeaturedControls() {
  return (
    <div className="mt-16 flex flex-col gap-8">
      <div className="flex justify-center"><CarouselDots /></div>
      <div className="flex justify-center gap-4">
        <CarouselPrevious className="static translate-y-0" />
        <CarouselNext className="static translate-y-0" />
      </div>
    </div>
  );
}
