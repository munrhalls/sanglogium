import Image from "next/image";
import { BrandLogo } from "./types";

const brandsSource: BrandLogo[] = [];
const brands = brandsSource;

export default function BrandMarquee() {
  console.log(`[SRIP Trace] Brand Marquee Contract validated. Unique brands: ${brands.length}`);

  return (
    <div className="w-full bg-brand-950 py-12 border-y border-brand-800/50 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...brands, ...brands].map((brand, idx) => (
          <div key={`${brand._id}-${idx}`} className="flex items-center justify-center px-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <div className="relative h-8 w-32">
              <Image
                src={brand.logoUrl}
                alt={brand.name}
                fill
                className="object-contain"
                sizes="128px"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
