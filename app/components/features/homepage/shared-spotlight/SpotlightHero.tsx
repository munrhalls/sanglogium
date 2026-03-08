import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

interface SpotlightHeroProps {
  image: string;
  tier: "standard" | "premium"; // standard = brand-700, premium = brand-900
}

export default function SpotlightHero({ image, tier }: SpotlightHeroProps) {
  return (
    <div className={cn(
      "relative w-full aspect-square overflow-hidden rounded-2xl border",
      tier === "premium" ? "bg-brand-900 border-accent-500/20" : "bg-brand-700 border-brand-400/20"
    )}>
      {/* Background Ornament Layer - Soon to be asset-backed */}
      <div className={cn(
        "absolute inset-0 opacity-10 pointer-events-none",
        tier === "premium" ? "bg-[radial-gradient(circle_at_center,_var(--tw-accent-500)_0%,_transparent_70%)]" : "bg-[radial-gradient(circle_at_center,_var(--tw-brand-400)_0%,_transparent_70%)]"
      )} />
      
      <Image 
        src={image} 
        alt="Spotlight Product" 
        fill 
        className="object-contain p-8 transform group-hover:scale-110 transition-transform duration-1000 ease-out"
      />
    </div>
  );
}
