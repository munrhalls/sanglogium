import { cn } from "@/lib/utils/tailwind";
import type { CatalogueItem } from "../data";
import Image from "next/image";

export default function HeroImage({ data }: { data: CatalogueItem }) {
  return (
    <div
      className={cn(
        "absolute h-96 w-96 text-accent-600 opacity-40",
        "transition-all duration-700 hover:scale-110",
        "[animation:pendulum_8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite_alternate]",
        "sm:h-[960px] sm:w-[960px]",
        "landscape:aspect-square landscape:h-[512px] landscape:w-[512px]"
      )}
    >
      <Image
        src={data.imageUrl}
        alt={data.label}
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
