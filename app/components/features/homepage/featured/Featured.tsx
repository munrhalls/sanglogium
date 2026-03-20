import Image from "next/image";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/layout/carousel/CarouselControls";
import featuredImg from "./featured_transparent.png";
import { getFeaturedProducts, FeaturedProduct } from "./getFeaturedProducts";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";

// --- ATOM 1: THE FEATURED CARD ---
interface FeaturedCardProps {
  product: FeaturedProduct;
}

const FeaturedCard = ({ product }: FeaturedCardProps) => (
  <article className="group flex h-full flex-col gap-6 bg-transparent p-6 transition-all duration-300">
    <div className="aspect-4/3 rounded-none relative flex w-full items-center justify-center overflow-hidden bg-brand-300 p-8">
      <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
        {product.brand}
      </span>
      <Image
        src={product.image?.asset?.url || featuredImg.src}
        alt={product.name}
        width={300}
        height={300}
        className="h-auto max-h-[85%] w-auto max-w-[85%] transform object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
      />
    </div>
    <div className="flex flex-grow flex-col gap-2">
      <p className="type-body transition-colors group-hover:text-accent-400">
        {product.name}
      </p>
    </div>
    <div className="mt-auto flex items-center justify-between">
      <div className="flex flex-col justify-center">
        <span className="type-price">${product.displayPrice}</span>
      </div>
      <button className="btn-cart transition-all active:scale-95">
        <ShoppingCart size={18} weight="regular" />
        <span className="type-caption font-bold uppercase">Add</span>
      </button>
    </div>
  </article>
);

export default async function Featured() {
  const finalFeatured = await getFeaturedProducts();

  if (!finalFeatured || finalFeatured?.length === 0) return null;

  return (
    <article className="bg-brand-950 w-full px-4 md:px-8">
      <Carousel
        itemsCount={finalFeatured?.length || 0}
        breakpointMap={{ lgDesktop: 3, mdPortrait: 2, mobilePortrait: 1 }}
      >
        <div className="relative flex flex-col lg-touch:gap-6 lg-desktop:gap-6">
          <div className="flex flex-col gap-2">
            <span className="type-overline uppercase tracking-editorial text-secondary-400">
              Curated Excellence
            </span>
            <h2 className="type-section-hed uppercase">Featured</h2>
          </div>
          <CarouselTrack className="relative mx-0 mt-4 items-stretch md:-mx-3">
            <CarouselPrevious className="absolute left-2 top-1/2 z-10 -translate-y-1/2 p-3 text-brand-400 transition-colors hover:text-accent-500" />
            <CarouselNext className="absolute right-2 top-1/2 z-10 -translate-y-1/2 p-3 text-brand-400 transition-colors hover:text-accent-500" />
            {finalFeatured.map((p, idx) => (
              <CarouselSlide
                key={p._id || idx}
                className="flex h-full flex-col px-3"
              >
                <FeaturedCard product={p} />
              </CarouselSlide>
            ))}
          </CarouselTrack>
          <div className="mt-4 flex flex-col items-center justify-center md:flex-row md:gap-12 lg-desktop:mt-4">
            <CarouselDots color="brand-400" className="order-1 md:order-2" />
          </div>
        </div>
      </Carousel>
    </article>
  );
}
