import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Spotlight1Data } from "../product-spotlight-1/getSpotlight1Data";

interface NewestReleaseProps {
  newestReleaseData: Spotlight1Data | null;
}

export default async function NewestRelease({ newestReleaseData }: NewestReleaseProps) {
  if (!newestReleaseData || !newestReleaseData.productRef) return null;

  const { productRef: product, promoTitle, promoSubtitle, promoText } = newestReleaseData;

  const backgroundImage = product.image ?? product.gallery?.[0];

  return (
    <article className="w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[400px] lg:min-h-[560px]">
        {/* Image column */}
        <div className="w-full lg:flex-hero min-h-[280px] lg:min-h-[560px] flex items-center justify-center p-4 md:p-8">
          {backgroundImage?.asset?._id && (
            <div className="aspect-square w-full bg-surface-productImage rounded-lg flex items-center justify-center overflow-hidden p-8 lg:p-12">
              <Image
                src={backgroundImage.asset._id}
                alt={product.name}
                width={1024}
                height={1024}
                priority
                className="object-contain w-full h-full"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          )}
        </div>

        {/* Text column */}
        <div className="w-full lg:flex-details bg-brand-800 flex flex-col justify-center">
          <div className="mx-auto max-w-content w-full py-12 lg:py-24 px-4 md:px-8">
            <div className="max-w-2xl">
              <div className="flex flex-col gap-6">
                <span className="type-overline text-accent-500">
                  {product.brand.name}
                </span>

                <div className="flex flex-col gap-2">
                  <h2 className="type-hero-headline text-brand-400">
                    {promoTitle || product.name}
                  </h2>
                  <h3 className="type-hero-sub text-brand-400">
                    {promoSubtitle || product.name}
                  </h3>
                </div>

                <p className="type-body text-brand-200 max-w-prose leading-relaxed">
                  {promoText || "Unrivaled acoustic engineering and clarity."}
                </p>
                <ul className="flex flex-col gap-3 list-disc list-inside">
                  <li className="type-body text-brand-200 max-w-prose leading-relaxed">
                    <strong>Studio-Grade Lineage:</strong> Uncovers the original master tape hidden within your files, devoid of clinical coldness.
                  </li>
                  <li className="type-body text-brand-200 max-w-prose leading-relaxed">
                    <strong>Bit-Perfect Timing:</strong> Proprietary jitter-reduction system that redefines digital accuracy.
                  </li>
                  <li className="type-body text-brand-200 max-w-prose leading-relaxed">
                    <strong>Multi-Config Output:</strong> Effortlessly drives any high-end amplifier or serious headphone setup.
                  </li>
                </ul>
              </div>

              <Link
                href="/product/weiss-dac204-desktop-dac"
                className="btn-ghost mt-6 inline-block"
              >
                View DAC204 Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
