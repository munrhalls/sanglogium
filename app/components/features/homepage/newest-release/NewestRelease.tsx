import SpotlightHero from "../shared-spotlight/SpotlightHero";
import SpotlightDetails from "../shared-spotlight/SpotlightDetails";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselDots } from "@/app/components/layout/carousel/CarouselControls";
import releaseSource from "./data.json";
import { SpotlightRelease } from "./types";

const data = releaseSource as SpotlightRelease;

export default function NewestRelease() {
  const images = data.images || [data.imageUrl];

  console.log(`[SRIP Trace] Newest Release Contract validated: "${data.name}" with ${images.length} assets.`);

  return (
    <section className="w-full bg-brand-950 py-24 px-4 sm:px-8">
      <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
        
        <div className="order-2 lg:order-1">
          <SpotlightDetails
            data={{
              ...data,
              headline: data.tag,
              subheadline: data.description
            }}
            accentColor="text-brand-400"
            buttonClass="bg-brand-400 text-brand-900 hover:bg-brand-300"
          />
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative h-feature-media w-full overflow-hidden bg-brand-800 rounded-lg">
            <Carousel itemsCount={images.length}>
              <CarouselTrack className="h-full">
                {images.map((img, idx) => (
                  <CarouselSlide key={idx} className="h-full basis-full flex-shrink-0">
                    <SpotlightHero image={img} tier="standard" />
                  </CarouselSlide>
                ))}
              </CarouselTrack>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <CarouselDots color="brand-400" />
              </div>
            </Carousel>
          </div>
        </div>

      </div>
    </section>
  );
}
