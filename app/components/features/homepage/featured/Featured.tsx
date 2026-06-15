import Image from "next/image";
import Link from "next/link";
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
import { BasketControls } from "@/app/components/features/basket/BasketControls";
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
  mobilePortrait: 1,
};

export const FeaturedCard = ({ product, idx }: FeaturedCardProps) => (
  <article className="card-product-dark flex h-full flex-col gap-4">
    <Link href={`/product/${product.slug}`} className="block">
      <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
        <span className="absolute left-4 top-4 z-10 type-caption text-brand-900">
          {product.brand.name}
        </span>
        <Image
          src={product.image?.asset?._id ?? ""}
          alt={product.name}
          width={450}
          height={450}
          priority={idx === 0}
          loading={idx === 0 ? "eager" : "lazy"}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
      </figure>

      <div className="flex flex-grow flex-col px-4 pt-2">
        <p className="type-overline mb-1">Headphones</p>
        <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
        <p className="type-price mt-2">
          ${centsToDisplay(product.price_data.unit_amount)}
        </p>
      </div>
    </Link>

    <div className="mt-auto px-4 pb-4 pt-2">
      <BasketControls
        productId={product._id}
        isBasketPage={false}
        addClassName="btn-cart w-full justify-center"
        wrapperClassName="flex items-center gap-1"
        decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
        incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
        quantityClassName="w-7 text-center type-body text-primary tabular-nums"
      />
    </div>
  </article>
);

export default async function Featured({ featuredData }: FeaturedProps) {
  if (!featuredData || featuredData?.length === 0) return null;

  return (
    <article className="relative w-full bg-brand-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        <div className="absolute -right-[10%] -top-[10%] h-[120%] w-[120%] bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-5" />
        <div className="absolute -left-[5%] top-[5%] h-[60%] w-[60%] bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10" />
        <div className="absolute bottom-[2.5%] right-[2.5%] h-[30%] w-[30%] bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10" />
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content py-16">
          <Carousel
            itemsCount={featuredData.length}
            breakpointMap={featuredBreakpointMap}
          >
            <div className="flex flex-col gap-6">
              <FeaturedHeader />

              <div className="relative">
                <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3">
                  {featuredData.map((p, idx) => (
                    <CarouselSlide
                      key={p._id || idx}
                      className="flex h-full flex-col px-3"
                    >
                      <FeaturedCard product={p} idx={idx} />
                    </CarouselSlide>
                  ))}
                </CarouselTrack>

                <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 md:-left-5">
                  <CarouselPrevious />
                </div>
                <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 md:-right-5">
                  <CarouselNext />
                </div>
              </div>

              <CarouselDots className="mt-2" />
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
