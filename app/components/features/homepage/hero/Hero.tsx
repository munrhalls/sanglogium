import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";

export default async function Hero() {
  const data = await getHeroData();

  if (!data?.backgroundImage || !data?.headline) {
    return null;
  }

  const { hotspot: desktopHotspot } = data.backgroundImage;
  const desktopX = desktopHotspot?.x ?? 0.5;
  const desktopY = desktopHotspot?.y ?? 0.5;

  const mobileBackgroundImage =
    data.mobileBackgroundImage || data.backgroundImage;
  const { hotspot: mobileHotspot } = mobileBackgroundImage;
  const mobileX = mobileHotspot?.x ?? 0.5;
  const mobileY = mobileHotspot?.y ? mobileHotspot.y + 0.5 : 0.95;

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        {/* IMAGE 1: MOBILE (Visible < md) */}
        <Image
          src={urlFor(mobileBackgroundImage).url()}
          alt={mobileBackgroundImage.alt || "Hero Image"}
          fill
          priority
          className="block object-cover md:hidden"
          sizes="100vw"
          quality={90}
          style={{
            objectPosition: `${mobileX * 100}% ${mobileY * 100}%`,
          }}
        />

        {/* IMAGE 2: DESKTOP (Visible >= md) */}
        <Image
          src={urlFor(data.backgroundImage).url()}
          alt={data.backgroundImage.alt || "Hero Image"}
          fill
          priority
          className="hidden object-cover md:block"
          sizes="100vw"
          quality={90}
          style={{
            objectPosition: `${desktopX * 100}% ${desktopY * 100}%`,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="container justsm:justify-center relative z-10 mx-auto mt-16 flex h-full flex-col justify-start px-4 sm:px-16 md:mt-0 3xl:px-44">
        <div className="flex max-w-xl flex-col items-start gap-8 sm:mb-44">
          <div>
            <h1 className="text-display-1 font-bold uppercase leading-tight text-brand-400 sm:text-display-2 md:text-display-1">
              {data.headline}
            </h1>
            <p className="mt-2 text-h4 font-medium text-secondary-300 md:text-h3">
              {data.subheadline}
            </p>
          </div>

          <button className="xs:mt-auto rounded-full bg-brand-400 px-12 py-4 text-cta-hero font-bold text-brand-700 transition-colors hover:bg-brand-200 sm:mt-2">
            {data.ctaText || "Explore"}
          </button>
        </div>
      </div>
    </section>
  );
}
