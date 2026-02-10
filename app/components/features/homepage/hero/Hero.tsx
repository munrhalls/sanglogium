import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";

export default async function Hero() {
  const data = await getHeroData();

  if (!data?.backgroundImage) {
    return null;
  }

  const { hotspot } = data.backgroundImage;
  const hotspotX = hotspot?.x ?? 0.5;
  const hotspotY = hotspot?.y ?? 0.5;

  const mobileOffset = -0.25;
  const mobileHotspotX = Math.min(hotspotX + mobileOffset, 1);

  const dynamicStyles = {
    "--bg-pos-mobile": `${mobileHotspotX * 100}% ${hotspotY * 100}%`,
    "--bg-pos-desktop": `${hotspotX * 100}% ${hotspotY * 100}%`,
  } as React.CSSProperties;

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      {/* 1. Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={urlFor(data.backgroundImage).url()}
          alt={data.backgroundImage.alt || "Hero Image"}
          fill
          priority
          className="object-cover object-[var(--bg-pos-mobile)] md:object-[var(--bg-pos-desktop)]"
          sizes="100vw"
          quality={90}
          // style={{ objectPosition: objectPosition }}
          style={dynamicStyles}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 2. Typography Layer */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-4xl text-5xl font-bold uppercase tracking-tighter text-brand-400 md:text-8xl">
          {data.headline}
        </h1>
        <p className="mt-4 text-lg font-medium text-secondary-300 md:text-2xl">
          {data.subheadline}
        </p>
        <button className="mt-8 rounded-full bg-[#D9C5B2] px-12 py-4 font-semibold text-black transition-colors hover:bg-white">
          {data.ctaText || "Explore"}
        </button>
      </div>
    </section>
  );
}
