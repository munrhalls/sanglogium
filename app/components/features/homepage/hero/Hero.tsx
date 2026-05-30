import Image from "next/image";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";
import { cn } from "@/lib/utils/tailwind";
import { HeroData, SanityImage } from "./types";

interface HeroProps {
  heroData: HeroData | null;
}

export default async function Hero({ heroData }: HeroProps) {
  if (!heroData?.backgroundImage || !heroData?.headline) {
    return null;
  }

  const mobileBackgroundImage = heroData.mobileBackgroundImage || heroData.backgroundImage;

  const getPosition = (image: SanityImage) => {
    const x = image.hotspot?.x ? image.hotspot.x * 100 : 50;
    const y = image.hotspot?.y ? image.hotspot.y * 100 : 50;
    return `${x}% ${y}%`;
  };

  // Generate blur placeholder from Sanity LQIP
  const blurDataURL = mobileBackgroundImage.asset?.metadata?.lqip || undefined;

  // Raw Sanity asset id for desktop srcset (built server-side via direct function call)
  const desktopRef = heroData.backgroundImage.asset?._id;

  // Responsive srcset for desktop source
  const desktopSrcSet = [640, 750, 1080, 1200, 1920, 2048]
    .map((w) => `${sanityImageLoader({ src: desktopRef, width: w, quality: 75 })} ${w}w`)
    .join(", ");

  // Raw Sanity asset id for mobile image (built server-side via direct function call)
  const mobileRef = mobileBackgroundImage.asset?._id;

  // Pre-compute mobile fallback URL — next/image default loader handles responsive srcset
  const mobileImageUrl = mobileRef ? sanityImageLoader({ src: mobileRef, width: 828, quality: 75 }) : "";

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
            srcSet={desktopSrcSet}
          />
          <Image
            src={mobileImageUrl}
            alt={heroData.backgroundImage.alt || "Hero Image"}
            fill
            priority
            fetchPriority="high"
            placeholder={blurDataURL ? "blur" : undefined}
            blurDataURL={blurDataURL}
            className="object-cover rounded-none"
            sizes="100vw"
            quality={75}
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
          "px-[clamp(1.5rem,5vw,5rem)] landscape:px-6",
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
              {heroData.headline}
            </h1>
            <p
              className={cn(
                "text-cap type-hero-sub",
              )}
            >
              {heroData.subheadline}
            </p>
          </div>

          <button
            className={cn(
              "btn-primary px-12 py-4 lg:py-6",
              "text-cta-hero font-bold",
              "mt-2 lg:mt-4"
            )}
          >
            {heroData.ctaText || "Explore"}
          </button>
        </div>
      </div>
    </section>
  );
}
