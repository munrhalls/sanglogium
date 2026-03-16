import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";
import { cn } from "@/lib/utils/tailwind";
import { HeroData, SanityImage } from "./types";

export default async function Hero() {
  console.log('[SRIP Trace] Overwrote border-radius to 0px in:', 'Hero');
  const data = await getHeroData() as HeroData | null;

  if (!data?.backgroundImage || !data?.headline) {
    return null;
  }

  console.log(`[SRIP Trace] Hero Data Contract validated for headline: "${data.headline}"`);

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
        <Image
          src={urlFor(mobileBackgroundImage).url()}
          alt={mobileBackgroundImage.alt || "Hero Image"}
          fill
          priority
          className={cn("block object-cover rounded-none", "md:hidden")}
          sizes="100vw"
          quality={90}
          style={{ objectPosition: getPosition(mobileBackgroundImage) }}
        />

        <Image
          src={urlFor(data.backgroundImage).url()}
          alt={data.backgroundImage.alt || "Hero Image"}
          fill
          priority
          className={cn("hidden object-cover rounded-none", "md:block")}
          sizes="100vw"
          quality={90}
          style={{ objectPosition: getPosition(data.backgroundImage) }}
        />

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
          <div className="flex flex-col gap-2 md:gap-8">
            <h1
              className={cn(
                "text-cap text-display-2 md:text-display-1 font-bold uppercase"
              )}
            >
              {data.headline}
            </h1>
            <p
              className={cn(
                "text-cap text-h4 font-semibold",
                "text-h4 md:text-h2"
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
