import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";
import { cn } from "@/lib/utils/tailwind";

export default async function Hero() {
  const data = await getHeroData();

  if (!data?.backgroundImage || !data?.headline) {
    return null;
  }
  const mobileBackgroundImage = data.mobileBackgroundImage || data.backgroundImage;

  const getPosition = (image: any) => {
    const x = image.hotspot?.x ? image.hotspot.x * 100 : 50;
    const y = image.hotspot?.y ? image.hotspot.y * 100 : 50;
    return `${x}% ${y}%`;
  };

  return (
    <section
      className={cn("relative w-full overflow-hidden", "bg-black text-white")}
      style={{
        height:
          "calc(100dvh - var(--desktop-header-h) - var(--desktop-catalogue-nav-h))",
      }}
    >
      <div className="absolute inset-0 z-0">
        {/* IMAGE 1: MOBILE (Visible < md) */}
        <Image
          src={urlFor(mobileBackgroundImage).url()}
          alt={mobileBackgroundImage.alt || "Hero Image"}
          fill
          priority
          className={cn("block object-cover", "md:hidden")}
          sizes="100vw"
          quality={90}
          style={{ objectPosition: getPosition(mobileBackgroundImage) }}
        />

        {/* IMAGE 2: DESKTOP (Visible >= md) */}
        <Image
          src={urlFor(data.backgroundImage).url()}
          alt={data.backgroundImage.alt || "Hero Image"}
          fill
          priority
          className={cn("hidden object-cover", "md:block")}
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
          "flex flex-col justify-center lg-touch:items-start lg-desktop:items-start"
        )}
      >
        <div
          className={cn("flex max-w-xl flex-col items-start gap-4 md:gap-8", "lg-touch:mb-44 lg-desktop:mb-64")}
        >
          <div>
            <h1
              className={cn(
                "text-cap text-display-1 xs:text-display-1 md:text-display-1 font-bold uppercase",
                "text-brand-400",
              )}
            >
              {data.headline}
            </h1>
            <p
              className={cn(
                "text-cap mt-2 text-h4 font-medium",
                "text-secondary-300",
                "md:text-h3"
              )}
            >
              {data.subheadline}
            </p>
          </div>

          <button
            className={cn(
              "rounded-full px-12 py-4",
              "bg-brand-400 text-cta-hero font-bold text-brand-700",
              "transition-colors hover:bg-brand-200",
              "xs:mt-auto sm:mt-2"
            )}
          >
            {data.ctaText || "Explore"}
          </button>
        </div>
      </div>
    </section>
  );
}
