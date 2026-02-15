import { Carousel, CarouselTrack } from "@/app/components/ui/carousel/Carousel";
import { CarouselBtn } from "@/app/components/ui/carouselBtn/CarouselBtn";
import { CatalogueMenu } from "@/app/components/layout/catalogue/CatalogueMenu";
import { CATALOGUE_DATA } from "@/app/components/layout/catalogue/data";

export default function MobileCatalogue() {
  return (
    <nav aria-label="Catalogue Navigation" className="w-full text-white">
      <Carousel>
        <div className="mb-2 flex justify-between">
          <CarouselBtn direction="left" className="rounded bg-gray-100 p-2">
            Prev
          </CarouselBtn>
          <CarouselBtn direction="right" className="rounded bg-gray-100 p-2">
            Next
          </CarouselBtn>
        </div>

        <CarouselTrack>
          {CATALOGUE_DATA.map((item) => (
            <CatalogueMenu key={item.id} data={item} />
          ))}
        </CarouselTrack>
      </Carousel>
    </nav>
  );
}
