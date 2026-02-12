import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";

export default async function Hero() {
  const data = await getHeroData();

  if (!data?.backgroundImage || !data?.headline) {
    return null;
  }
  // TODO this is no longer relevant - now, backend has new separate hero image (it's the same image but cropped) specifically for mobile

  const { hotspot } = data.backgroundImage;
  const hotspotX = hotspot?.x ?? 0.5;
  const hotspotY = hotspot?.y ?? 0.5;

  const mobileOffsetX = -0.1;
  const mobileOffsetY = 0.5;

  const mobileHotspotX = Math.min(hotspotX + mobileOffsetX, 1);
  const mobileHotspotY = Math.min(hotspotY + mobileOffsetY, 1);

  const dynamicStyles = {
    "--bg-pos-mobile": `${mobileHotspotX * 100}% ${mobileHotspotY * 100}%`,
    "--bg-pos-desktop": `${hotspotX * 100}% ${hotspotY * 100}%`,
  } as React.CSSProperties;

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src={urlFor(data.backgroundImage).url()}
          alt={data.backgroundImage.alt || "Hero Image"}
          fill
          priority
          className="object-cover object-[var(--bg-pos-mobile)] md:object-[var(--bg-pos-desktop)]"
          sizes="100vw"
          quality={90}
          style={dynamicStyles}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto flex h-full flex-col justify-start px-4 sm:justify-center sm:px-16 3xl:px-44">
        <div className="flex max-w-xl flex-col items-start gap-8 sm:mb-44">
          <div>
            <h1 className="text-display-1 font-bold uppercase leading-tight text-brand-400 sm:mb-0 sm:text-display-2 md:text-display-1">
              {data.headline}
            </h1>
            <p className="mt-2 text-h4 font-medium text-secondary-300 sm:mb-0 md:text-h3">
              {data.subheadline}
            </p>
          </div>

          <button className="mt-2 rounded-full bg-brand-400 px-12 py-4 text-cta-hero font-bold text-brand-700 transition-colors hover:bg-brand-200">
            {data.ctaText || "Explore"}
          </button>
        </div>
      </div>
    </section>
  );
}
