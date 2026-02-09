import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";
import { getHeroData } from "@/sanity/lib/hero/getHeroData";

export default async function Hero() {
  const data = await getHeroData();

  // --- VERIFICATION TRACER START ---
  console.log("--------------------------------------------------");
  console.log("HERO DATA INTEGRITY CHECK:");
  console.log("1. HEADLINE: ", data?.headline ? "✅ Found" : "❌ Missing");

  // Handshake Check: Does the image have the data needed for the loader?
  const hasAsset = !!data?.backgroundImage?.asset?.url;
  console.log(
    "2. IMAGE ASSET (URL Source): ",
    hasAsset ? "✅ Found" : "❌ Missing"
  );

  // CSS Check: Do we have the coordinates for object-position?
  const hasHotspot = !!data?.backgroundImage?.hotspot;
  console.log(
    "3. HOTSPOT DATA (CSS Position): ",
    hasHotspot ? "✅ Found (Custom Crop)" : "⚠️ Defaulting to Center"
  );

  // Full Object Dump for deep inspection if needed
  // console.dir(data, { depth: null });
  console.log("--------------------------------------------------");
  // --- VERIFICATION TRACER END ---

  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      {/* 1. Image Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={urlFor(data.heroImage).url()}
          alt="Winter Collection Headphones"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
          quality={90}
        />

        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 2. Typography Layer */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-4xl text-5xl font-bold uppercase tracking-tighter text-brand-400 md:text-8xl">
          Sound Redefined
        </h1>
        <p className="mt-4 text-lg font-medium text-secondary-300 md:text-2xl">
          Winter collection
        </p>
        <button className="mt-8 rounded-full bg-[#D9C5B2] px-12 py-4 font-semibold text-black transition-colors hover:bg-white">
          EXPLORE
        </button>
      </div>
    </section>
  );
}
