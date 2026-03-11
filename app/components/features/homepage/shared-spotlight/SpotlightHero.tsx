import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightHeroProps {
  image: string;
  tier: "standard" | "gold";
  className?: string;
}

export default function SpotlightHero({ image, className }: SpotlightHeroProps) {
  return (
    /* SYSTEM FIX: We remove 'h-full' which fails on min-height parents. 
       We use 'flex-1' and 'min-h-[450px]' (mobile) / 'lg:min-h-full' 
       to ensure the absolute 'fill' image has a coordinate system to reference.
    */
    <div className={cn("relative w-full flex-1 min-h-[450px] lg:min-h-full overflow-hidden rounded-none", className)}>
      <Image
        src={image}
        alt="Product Spotlight"
        fill
        className="object-contain p-12 transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 42vw"
        priority
      />
    </div>
  );
}
