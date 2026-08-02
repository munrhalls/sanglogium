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

const getModelName = (productName: string, brandName: string): string => {
  // Escape special regex characters in brand name (handles spaces, ampersands, etc.)
  const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Case-insensitive regex to remove brand name from product name
  const regex = new RegExp(`^${escapedBrand}\\s+`, 'i');
  const modelName = productName.replace(regex, '').trim();
  // Return model name, or full name if empty
  return modelName || productName;
};

export const FeaturedCard = ({ product, idx }: FeaturedCardProps) => {
  const modelName = getModelName(product.name, product.brand.name);

  return (
    <article className="card-product-dark flex h-full flex-col gap-4 lg-touch:gap-3 lg-touch:p-4">
      <Link href={`/product/${product.slug}`} className="flex flex-grow flex-col">
        <figure className="relative flex aspect-[4/3] lg-touch:aspect-[3/2] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-productImage p-6 lg-touch:p-4">
          <span className="absolute left-4 top-2 z-10 text-tiny xs:text-small tracking-tight text-brand-900">
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

      <div className="flex flex-grow flex-col px-4 pt-2 mt-3 lg-touch:px-2 lg-touch:pt-1">
        <h3 className="text-small">{modelName}</h3>
        <p className="type-price mt-2">
          ${centsToDisplay(product.price_data.unit_amount)}
        </p>
      </div>
    </Link>

    <div className="px-4 pb-4 pt-2 mt-auto">
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
  };


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
        <div className="mx-auto max-w-content px-6 py-10 md:py-12 lg-touch:py-6 lg:px-8">
          <Carousel
            itemsCount={featuredData.length}
            breakpointMap={featuredBreakpointMap}
          >
            <div className="flex flex-col gap-2 md:gap-3">
              <div className="w-full lg:max-w-[1200px] lg:px-20 lg-touch:max-w-[1000px] lg-touch:px-14 lg:mx-auto flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-4">
                <FeaturedHeader />
                <Link
                  href="/products/headphones"
                  className="inline-flex items-center gap-1 self-end py-3.5 px-3 -ml-3 type-caption text-brand-400 transition-colors hover:text-brand-100 md:py-0 md:px-0 md:ml-0"
                >
                  View All <span aria-hidden="true">&rsaquo;</span>
                </Link>
              </div>

              <div className="relative lg:px-20 lg:max-w-[1200px] lg-touch:px-14 lg-touch:max-w-[1000px] lg:mx-auto">
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

                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between lg:flex">
                  <CarouselPrevious
                    iconStyle="chevron"
                    size={48}
                    weight="bold"
                    className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9"
                  />
                  <CarouselNext
                    iconStyle="chevron"
                    size={48}
                    weight="bold"
                    className="pointer-events-auto bg-transparent text-brand-400 hover:bg-transparent hover:text-brand-100 max-lg:static max-lg:h-9 max-lg:w-9"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-3">
                <CarouselPrevious
                  iconStyle="chevron"
                  size={14}
                  weight="bold"
                  className="pointer-events-auto h-4 w-4 bg-transparent p-0 text-brand-400 hover:bg-transparent hover:text-brand-100 lg:hidden"
                />
                <CarouselDots truncate />
                <CarouselNext
                  iconStyle="chevron"
                  size={14}
                  weight="bold"
                  className="pointer-events-auto h-4 w-4 bg-transparent p-0 text-brand-400 hover:bg-transparent hover:text-brand-100 lg:hidden"
                />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </article>
  );
}
