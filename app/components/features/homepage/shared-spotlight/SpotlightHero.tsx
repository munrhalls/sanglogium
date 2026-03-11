import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightHeroProps {
  image: string;
  tier: "standard" | "gold";
  className?: string;
}

export default function SpotlightHero({ image, className }: SpotlightHeroProps) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-none", className)}>
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
