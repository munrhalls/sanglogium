import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";

export default async function Hero() {
  const data = await getHeroData();

  // --- TRACER (Keep this for now, it's useful) ---
  console.log("--------------------------------------------------");
  console.log("HERO DATA INTEGRITY CHECK:");
  console.log("1. HEADLINE: ", data?.headline ? "✅ Found" : "❌ Missing");
  const hasAsset = !!data?.backgroundImage?.asset?.url;
  console.log("2. IMAGE ASSET: ", hasAsset ? "✅ Found" : "❌ Missing");
  const hasHotspot = !!data?.backgroundImage?.hotspot;
  console.log(
    "3. HOTSPOT: ",
    hasHotspot ? "✅ Found" : "⚠️ Defaulting to Center"
  );
  console.log("--------------------------------------------------");
  // -----------------------------------------------

  // ROBUSTNESS CHECK 1:
  // If data failed to fetch or image is missing, do not render broken component.
  if (!data?.backgroundImage) {
    return null;
  }

  // ROBUSTNESS CHECK 2:
  // Calculate the Hotspot (The Handshake).
  // If Sanity has a hotspot, use it. If not, default to center (0.5).
  const { hotspot } = data.backgroundImage;
  const hotspotX = hotspot?.x ?? 0.5;
  const hotspotY = hotspot?.y ?? 0.5;

  // Convert 0-1 decimals to 0-100% for CSS
  const objectPosition = `${hotspotX * 100}% ${hotspotY * 100}%`;

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      {/* 1. Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          // FIXED: Use the correct field name from schema (backgroundImage)
          src={urlFor(data.backgroundImage).url()}
          alt={data.backgroundImage.alt || "Hero Image"}
          fill
          priority
          // IMPORTANT: Removed 'object-center' class because we handle it in style
          className="object-cover"
          sizes="100vw"
          quality={90}
          // THE HANDSHAKE:
          style={{ objectPosition: objectPosition }}
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
