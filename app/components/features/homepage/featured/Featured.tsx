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
    <Link href={`/product/${product.slug}`} className="flex flex-grow flex-col">
      <figure className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-productImage p-6">
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.04) 100%)",
          }}
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

    <div className="px-4 pb-4 pt-2">
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
    <article className="relative w-full overflow-hidden bg-brand-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
      >
        {/* Far plane — deepest, recessed back-plane (rendered first = painted behind).
            Encompassing + smallest feature scale + dimmest opacity + slowest spin so it
            reads as distant ambient texture and never competes with the foreground. */}
        <div className="fractal-spin-far absolute inset-[-25%] will-change-transform">
          <div className="fractal-depth-far h-full w-full bg-fractal-ring bg-center bg-no-repeat bg-[length:70%] opacity-[0.04] will-change-transform" />
        </div>
        {/* Layer 1 — large ring, CW 43s spin / 17s depth-pulse */}
        <div className="fractal-spin-L1 absolute -right-[10%] -top-[10%] h-[120%] w-[120%] will-change-transform">
          <div className="fractal-depth-L1 h-full w-full bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-5 will-change-transform" />
        </div>
        {/* Layer 2 — medium ring, CCW 37s spin / 13s depth-pulse */}
        <div className="fractal-spin-L2 absolute -left-[5%] top-[5%] h-[60%] w-[60%] will-change-transform">
          <div className="fractal-depth-L2 h-full w-full bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10 will-change-transform" />
        </div>
        {/* Layer 3 — small ring, CW 31s spin (−7s phase) / 11s depth-pulse */}
        <div className="fractal-spin-L3 absolute bottom-[2.5%] right-[2.5%] h-[30%] w-[30%] will-change-transform">
          <div className="fractal-depth-L3 h-full w-full bg-fractal-ring bg-[length:100%] bg-no-repeat opacity-10 will-change-transform" />
        </div>
      </div>
      <div className="relative z-10">
        <div className="mx-auto max-w-content px-6 py-10 md:py-16 lg:px-8">
          <Carousel
            itemsCount={featuredData.length}
            breakpointMap={featuredBreakpointMap}
          >
            <div className="flex flex-col gap-4 md:gap-6">
              <FeaturedHeader />

              <Link
                href="/products/headphones"
                className="type-overline text-brand-400 transition-colors hover:text-brand-100"
              >
                View All <span aria-hidden="true">&rsaquo;</span>
              </Link>

              <div className="relative">
                <CarouselTrack className="mx-0 w-full items-stretch md:-mx-3 md:w-[calc(100%+1.5rem)]">
                  {featuredData.map((p, idx) => (
                    <CarouselSlide
                      key={p._id || idx}
                      className="flex flex-col px-3"
                    >
                      <FeaturedCard product={p} idx={idx} />
                    </CarouselSlide>
                  ))}
                </CarouselTrack>

              </div>

              <div className="flex items-center justify-center gap-6">
                <CarouselPrevious />
                <CarouselDots />
                <CarouselNext />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
