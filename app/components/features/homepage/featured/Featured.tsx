import Image from "next/image";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";
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
  <article className="card-product flex h-full flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-cardHover">
    <Link href={`/product/${product.slug}`} className="block">
      <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6">
        <span className="absolute left-4 top-4 z-10 text-small font-bold uppercase tracking-editorial text-brand-900">
          {product.brand.name}
        </span>
        <Image
          src={product.image?.asset?._id ? sanityImageLoader({ src: product.image?.asset?._id, width: 450, quality: 75 }) : ""}
          alt={product.name}
          width={450}
          height={450}
          priority={idx === 0}
          loading={idx === 0 ? "eager" : "lazy"}
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
      </figure>

      <div className="flex flex-grow flex-col gap-3 px-4">
        <h3 className="type-body line-clamp-2 font-medium">{product.name}</h3>
      </div>
    </Link>

    <div className="flex items-center justify-between px-4 pb-4 pt-2">
      <p className="type-price">
        ${centsToDisplay(product.price_data.unit_amount)}
      </p>
      <BasketControls
        productId={product._id}
        isBasketPage={false}
        addClassName="btn-cart"
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
        <div className="mx-auto max-w-content py-12 md:py-16 lg:py-20">
          <Carousel
            itemsCount={featuredData.length}
            breakpointMap={featuredBreakpointMap}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
              <div className="flex flex-col gap-4 md:col-start-1 md:row-start-1">
                <FeaturedHeader />
              </div>

              <CarouselTrack className="mx-0 w-full items-stretch md:col-span-full md:row-start-2 md:-mx-3">
                {featuredData.map((p, idx) => (
                  <CarouselSlide
                    key={p._id || idx}
                    className="flex h-full flex-col px-3"
                  >
                    <FeaturedCard product={p} idx={idx} />
                  </CarouselSlide>
                ))}
              </CarouselTrack>

              <div className="flex items-center justify-center gap-4 md:col-start-2 md:row-start-1 md:flex-row md:gap-8 md:justify-self-end md:pr-16">
                <CarouselPrevious className="border-none text-brand-400 shadow-none transition-colors hover:bg-transparent active:scale-110" />
                <CarouselDots color="brand-400" />
                <CarouselNext className="border-none text-brand-400 shadow-none transition-colors hover:bg-transparent active:scale-105" />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
