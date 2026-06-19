import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";

interface NewestReleaseProps {
  newestReleaseData: Spotlight1Data | null;
}

export default async function NewestRelease({ newestReleaseData }: NewestReleaseProps) {
  if (!newestReleaseData || !newestReleaseData.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle } = newestReleaseData;

  const backgroundImage = product.image ?? product.gallery?.[0];

  return (
    <article className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
        {/* Image column */}
        <div className="w-full lg:flex-hero min-h-[280px] lg:min-h-[560px] bg-surface-productImage flex items-center justify-center p-6 lg:p-8">
          {backgroundImage?.asset?._id && (
            <Image
              src={backgroundImage.asset._id}
              alt={product.name}
              width={1024}
              height={1024}
              priority
              className="object-contain w-full h-auto"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          )}
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
                  className="btn-cart-large self-start"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
