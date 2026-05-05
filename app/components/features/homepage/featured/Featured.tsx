import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity-config/lib/image";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/layout/carousel/CarouselControls";
import FeaturedHeader from "./FeaturedHeader";
import { FeaturedProduct } from "./getFeaturedProducts";
import { BasketControls } from "@/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

interface FeaturedProps {
  featuredData: FeaturedProduct[];
}

interface FeaturedCardProps {
  product: FeaturedProduct;
  idx: number;
}

const featuredBreakpointMap = {
  xl: 3,
  lgDesktop: 3,
  mdLandscape: 2,
  mdPortrait: 2,
  smLandscape: 2,
  smPortrait: 2,
  xsPortrait: 1,
  mobileLandscape: 1,
  mobilePortrait: 1
};

export const FeaturedCard = ({ product, idx }: FeaturedCardProps) => (
  <a href={`/products/${product.slug}`} className="block group">
    <article className="card-product flex h-full flex-col gap-4 group-hover:shadow-cardHover group-hover:-translate-y-1 transition-all duration-300">
      <figure className="aspect-[4/3] relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
        <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900 z-10">
          {product.brand.name}
        </span>
        <Image
          src={urlFor(product.image).width(450).auto('format').quality(75).url()}
          alt={product.name}
          width={450}
          height={450}
          priority={idx === 0}
          loading={idx === 0 ? "eager" : "lazy"}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
      </figure>

      <div className="flex flex-col flex-grow gap-3">
        <h3 className="type-body font-medium line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="type-price">${centsToDisplay(product.price_data.unit_amount)}</p>
          <BasketControls
            productId={product._id}
            displayPriceAtAdd={centsToDisplay(product.price_data.unit_amount)}
            availableStockAtAdd={product.stock ?? 99}
            isBasketPage={false}
            addClassName="btn-cart"
            wrapperClassName="flex items-center gap-1"
            decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
            incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
            quantityClassName="w-7 text-center type-body text-primary tabular-nums"
          />
        </div>
      </div>
    </article>
  </a>
);

export default async function Featured({ featuredData }: FeaturedProps) {
  if (!featuredData || featuredData?.length === 0) return null;

  return (
    <article className="w-full relative bg-brand-900">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[120%] h-[120%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-5" />
        <div className="absolute top-[5%] -left-[5%] w-[60%] h-[60%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
        <div className="absolute bottom-[2.5%] right-[2.5%] w-[30%] h-[30%] bg-fractal-ring bg-no-repeat bg-[length:100%] opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content">
          <Carousel
            itemsCount={featuredData.length}
            breakpointMap={featuredBreakpointMap}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <div className="flex flex-col gap-4 md:col-start-1 md:row-start-1">
                <FeaturedHeader />
              </div>

              <CarouselTrack className="w-full items-stretch mx-0 md:-mx-3 md:col-span-full md:row-start-2">
                {featuredData.map((p, idx) => (
                  <CarouselSlide
                    key={p._id || idx}
                    className="flex h-full flex-col px-3"
                  >
                    <FeaturedCard product={p} idx={idx} />
                  </CarouselSlide>
                ))}
              </CarouselTrack>

              <div className="flex items-center justify-center md:flex-row gap-4 md:gap-8 md:col-start-2 md:row-start-1 md:justify-self-end md:pr-16">
                <CarouselPrevious
                  className="transition-colors border-none shadow-none hover:bg-transparent active:scale-110 text-brand-400"
                />
                <CarouselDots color="brand-400" />
                <CarouselNext
                  className="transition-colors border-none shadow-none hover:bg-transparent active:scale-105 text-brand-400"
                />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
