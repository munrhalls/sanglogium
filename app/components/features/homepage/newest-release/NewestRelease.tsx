import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NewestReleaseData } from "@/sanity-cms/lib/homepage/getHomepageData";
import { formatPrice } from "@/lib/utils/price";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import {
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
} from "@/app/components/layout/carousel/CarouselControls";

interface NewestReleaseProps {
  newestReleaseData: NewestReleaseData | null;
}

export default async function NewestRelease({ newestReleaseData }: NewestReleaseProps) {
  if (!newestReleaseData || !newestReleaseData.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle } = newestReleaseData;
  const images = product.images ?? (product.image ? [product.image] : []);
  const hasMultiple = images.length > 1;

  return (
    <article className="w-full overflow-hidden">
      <div className="max-w-content mx-auto">
        <div className="flex flex-col-reverse lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[260px] xl:min-h-[360px] gap-0 border border-border-secondary">

        {/* Image column */}
        <div className="w-full lg:w-[45%] min-h-[280px] lg:min-h-[260px] xl:min-h-[360px] lg:aspect-[4/3] xl:aspect-auto bg-brand-700 relative overflow-hidden">
          <Carousel
            itemsCount={images.length || 1}
            breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }}
            className="w-full h-full overflow-visible"
          >
            <CarouselTrack className="w-full h-full">
              {images.map((image, idx) => (
                <CarouselSlide
                  key={`${product._id}-${idx}`}
                  className="h-full w-full flex items-center justify-center p-6 lg:p-10
                             opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out
                             data-[active=true]:opacity-100 data-[active=true]:scale-100"
                >
                  <Image
                    src={image?.asset?._id ?? ""}
                    alt={image?.alt ?? product.name}
                    width={800}
                    height={800}
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 640px"
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                  />
                </CarouselSlide>
              ))}
            </CarouselTrack>

            {hasMultiple && (
              <>
                {/* Dots and Arrows: bottom center, adjacent */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 pointer-events-none">
                  <CarouselPrevious iconStyle="chevron" className="pointer-events-auto rounded-sm border-border-primary bg-transparent text-secondary-300 hover:bg-transparent hover:text-brand-100" />
                  <CarouselDots truncate />
                  <CarouselNext iconStyle="chevron" className="pointer-events-auto rounded-sm border-border-primary bg-transparent text-secondary-300 hover:bg-transparent hover:text-brand-100" />
                </div>
              </>
            )}
          </Carousel>
        </div>

        {/* Text column */}
        <div className="w-full lg:w-[55%] bg-brand-200 flex flex-col justify-center">
          <div className="w-full py-12 lg:py-8 px-8 lg:px-10 xl:px-12">
            <div className="max-w-2xl">
              <div className="flex flex-col gap-8 lg:gap-4">

                <div className="flex flex-col gap-2">
                  <span className="type-overline text-accent-800">New Release</span>
                  <span className="type-caption text-accent-800">
                    {product.brand.name} {product.name}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <h2 className="type-section-hed text-secondary-900">
                    {promoTitle || product.name}
                  </h2>
                  <p className="text-lg lg:text-xl font-medium leading-snug text-secondary-800">
                    {promoSubtitle || ""}
                  </p>
                </div>

                {product.price_data?.unit_amount != null && (
                  <p className="type-price text-secondary-900">
                    {formatPrice(product.price_data.unit_amount)}
                  </p>
                )}

                <Link
                  href={`/product/${product.slug}`}
                  className="self-start px-8 py-3 uppercase tracking-editorial text-center border border-accent-600 bg-accent-600 text-secondary-900 rounded-md transition-all duration-200 hover:bg-transparent hover:text-secondary-900"
                >
                  View Product
                </Link>

              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </article>
  );
}
