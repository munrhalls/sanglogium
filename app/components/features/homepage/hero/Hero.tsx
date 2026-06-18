import { getImageProps } from 'next/image';
import Link from "next/link";
import { cn } from "@/lib/utils/tailwind";
import { HeroData, SanityImage } from "./types";
import { HeroQualityBar } from "./HeroQualityBar";

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

  const commonImageProps = {
    fill: true,
    priority: true,
    fetchPriority: 'high' as const,
    quality: 75,
    sizes: '100vw',
    placeholder: blurDataURL ? ("blur" as const) : ("empty" as const),
    blurDataURL,
  };

  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...commonImageProps,
    src: heroData.backgroundImage.asset?._id ?? "",
    alt: heroData.backgroundImage.alt || "Hero Image",
  });

  const {
    props: { srcSet: mobileSrcSet, ...rest },
  } = getImageProps({
    ...commonImageProps,
    src: mobileBackgroundImage.asset?._id ?? "",
    alt: mobileBackgroundImage.alt || heroData.backgroundImage.alt || "Hero Image",
  });

  const desktopPosition = getPosition(heroData.backgroundImage);
  const mobilePosition = getPosition(mobileBackgroundImage);

  return (
    <section
      className={cn("relative w-full overflow-hidden", "bg-black text-white",
        "h-[calc(100dvh-var(--mobile-header-h)-var(--mobile-menu-h))]",
        "lg:h-[calc(100dvh-var(--desktop-header-h)-var(--desktop-catalogue-nav-h))]",
        "min-h-[80vh]"
      )}
    >
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
            <img
              {...rest}
              srcSet={mobileSrcSet}
              className="object-cover rounded-none max-md:[object-position:var(--mobile-pos)] md:[object-position:var(--desktop-pos)]"
              style={{ ...rest.style, '--desktop-pos': desktopPosition, '--mobile-pos': mobilePosition } as React.CSSProperties}
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
              "flex max-w-xl flex-col items-start gap-3 md:gap-5",
              "lg-touch:mb-44 lg-desktop:mb-64",
              "max-w-xl w-full",
              "landscape:max-w-full lg-touch:landscape:max-w-4xl lg-desktop:landscape:max-w-4xl",
            )}
          >
            <div className="flex flex-col gap-2">
              <h1 className="type-hero-headline">
                {heroData.headline}
              </h1>
              <p className="type-hero-sub m-0 p-0">
                Hear the new difference.
              </p>
            </div>

            <Link
              href={heroData.ctaLink || "/products"}
              className={cn(
                "btn-primary px-10 py-4 lg:py-5",
                "text-cta-hero font-bold"
              )}
            >
              {"DISCOVER"}
            </Link>
          </div>
        </div>
      <HeroQualityBar />
    </section>
  );
}
