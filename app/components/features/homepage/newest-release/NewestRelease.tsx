import React from "react";
import Image from "next/image";
import Link from "next/link";
import { NewestReleaseData } from "@/app/lib/data/homepageBatch";
import { Carousel } from "@/app/components/layout/carousel/CarouselRoot";
import { CarouselTrack } from "@/app/components/layout/carousel/CarouselTrack";
import { CarouselSlide } from "@/app/components/layout/carousel/CarouselSlide";
import { CarouselPrevious, CarouselNext, CarouselDots } from "@/app/components/layout/carousel/CarouselControls";

interface NewestReleaseProps {
  newestReleaseData: NewestReleaseData | null;
}

export default async function NewestRelease({ newestReleaseData }: NewestReleaseProps) {
  if (!newestReleaseData || !newestReleaseData.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle } = newestReleaseData;

  return (
    <article className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
        {/* Image column */}
        <div className="w-full lg:flex-hero min-h-[280px] lg:min-h-[560px] bg-surface-productImage flex items-center justify-center relative overflow-hidden border border-border-secondary">
          <Carousel itemsCount={product.images?.length || 1} breakpointMap={{ lgDesktop: 1, mdPortrait: 1, mobilePortrait: 1 }} className="w-full h-full overflow-visible">
            <CarouselTrack className="w-full h-full">
              {product.images?.map((image, idx) => (
                <CarouselSlide
                  key={`${product._id}-${idx}`}
                  className="aspect-square w-full flex items-center justify-center pb-4 opacity-0 scale-95 transition-[opacity,transform] duration-500 ease-out data-[active=true]:opacity-100 data-[active=true]:scale-100"
                >
                  <Image
                    src={image?.asset?._id ?? ""}
                    alt={product.name}
                    width={800}
                    height={800}
                    priority={idx === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="max-w-full max-h-[80%] w-auto h-auto object-contain mix-blend-multiply"
                  />
                </CarouselSlide>
              ))}
            </CarouselTrack>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
              <div className="flex gap-2">
                <CarouselPrevious />
                <CarouselNext />
              </div>
              <CarouselDots />
            </div>
          </Carousel>
        </div>

        {/* Text column */}
        <div className="w-full lg:flex-details bg-brand-800 flex flex-col justify-center">
          <div className="w-full py-12 lg:py-24 px-8 lg:px-16">
            <div className="max-w-2xl">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="type-overline text-accent-500">New Release</span>
                  <span className="type-section-caption">{product.brand.name}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="type-hero-headline text-brand-400">
                    {promoTitle || product.name}
                  </h2>
                  <h3 className="type-hero-sub">
                    {promoSubtitle || product.name}
                  </h3>
                </div>

                {product.price_data?.unit_amount && (
                  <p className="type-price">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.price_data.currency?.toUpperCase() ?? "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(product.price_data.unit_amount / 100)}
                  </p>
                )}

                <Link
                  href={`/product/${product.slug}`}
                  className="btn-ghost self-start"
                >
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
