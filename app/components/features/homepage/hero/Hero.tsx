import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";
import { cn } from "@/lib/utils/tailwind";
import { HeroData, SanityImage } from "./types";

export default async function Hero() {
  const data = await getHeroData() as HeroData | null;

  if (!data?.backgroundImage || !data?.headline) {
    return null;
  }

  const mobileBackgroundImage = data.mobileBackgroundImage || data.backgroundImage;

  const getPosition = (image: SanityImage) => {
    const x = image.hotspot?.x ? image.hotspot.x * 100 : 50;
    const y = image.hotspot?.y ? image.hotspot.y * 100 : 50;
    return `${x}% ${y}%`;
  };

  return (
    <section
      className={cn("relative w-full overflow-hidden", "bg-black text-white",
        "h-[calc(100dvh-var(--mobile-header-h)-var(--mobile-menu-h))]",
        "lg-desktop:h-[calc(100dvh-var(--desktop-header-h)-var(--desktop-catalogue-nav-h))]"
      )}
    >
      <div className="absolute inset-0 z-0">
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={urlFor(data.backgroundImage).url()}
          />
          <Image
            src={urlFor(mobileBackgroundImage).url()}
            alt={data.backgroundImage.alt || "Hero Image"}
            fill
            priority
            className="object-cover rounded-none"
            sizes="100vw"
            quality={90}
            style={{ objectPosition: getPosition(mobileBackgroundImage) }}
          />
        </picture>

        <div
          className={cn(
            "absolute inset-0",
            "bg-gradient-to-r from-black/60 via-black/20 to-transparent"
          )}
        />
      </div>

      <div
        className={cn(
          "relative z-10 h-full w-full",
          "px-[clamp(1.5rem,5vw,5rem)]",
          "flex flex-col justify-center lg-touch:items-start lg-desktop:items-start",
          "gap-6"
        )}
      >
        <div
          className={cn(
            "flex max-w-xl flex-col items-start gap-4 md:gap-8",
            "lg-touch:mb-44 lg-desktop:mb-64",
            "max-w-xl w-full",
            "landscape:max-w-full lg-touch:landscape:max-w-4xl lg-desktop:landscape:max-w-4xl",
          )}
        >
          <div className="flex flex-col gap-4 md:gap-8">
            <h1
              className={cn(
                "text-cap type-hero-headline uppercase"
              )}
            >
              {data.headline}
            </h1>
            <p
              className={cn(
                "text-cap type-hero-sub",
              )}
            >
              {data.subheadline}
            </p>
          </div>

          <button
            className={cn(
              "btn-primary px-12 py-4 lg:py-6",
              "text-cta-hero font-bold",
              "mt-2"
            )}
          >
            {data.ctaText || "Explore"}
          </button>
        </div>
      </div>
    </section>
  );
}
