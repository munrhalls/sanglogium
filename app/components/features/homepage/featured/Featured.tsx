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

interface FeaturedCardProps {
  product: FeaturedProduct;
}

export const FeaturedCard = ({ product }: FeaturedCardProps) => (
  <article className="group flex h-full flex-col bg-transparent p-6 transition-all duration-300 gap-4 max-h-[400px]">
    <figure className="aspect-4/3 rounded-none relative flex w-full items-center justify-center overflow-hidden bg-brand-300 p-8">
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
    </figure>

    <div className="flex flex-grow flex-col h-[3rem]">
      <p className="type-body font-bold transition-colors group-hover:text-accent-400">
        {product.name}
      </p>
    </div>
    <div className="mt-auto flex items-center ">
      <p className="text-cap type-price text-center">${product.displayPrice}</p>
      <button className="btn-cart transition-all active:scale-95 ml-auto">
        <ShoppingCart size={18} weight="bold" />
        <span className="text-cap font-bold">Add</span>
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
        <div className="relative flex flex-col gap-2">
          <div className="flex flex-col gap-4">
            <span className="type-overline uppercase tracking-editorial text-secondary-400">
              Curated Excellence
            </span>
            <h2 className="type-section-hed uppercase">Featured</h2>
          </div>

          <CarouselTrack className="relative mx-0 items-stretch md:-mx-3">
            {finalFeatured.map((p, idx) => (
              <CarouselSlide
              key={p._id || idx}
              className="flex h-full flex-col px-3"
              >
                <FeaturedCard product={p} />
              </CarouselSlide>
            ))}
          </CarouselTrack>


          <div className="flex items-center justify-center md:flex-row md:gap-8">
            <CarouselPrevious
              className="flex md:flex p-3 transition-colors border-none shadow-none h-auto w-auto hover:bg-transparent focus:ring-0 active:scale-110 [&_svg]:w-8 [&_svg]:h-8 text-brand-400"
            />
            <CarouselDots color="brand-400" />
            <CarouselNext
              className="flex md:flex p-3 transition-colors border-none shadow-none h-auto w-auto hover:bg-transparent focus:ring-0 active:scale-110 [&_svg]:w-8 [&_svg]:h-8 text-brand-400"
            />
          </div>
        </div>
      </Carousel>
    </article>
  );
}
