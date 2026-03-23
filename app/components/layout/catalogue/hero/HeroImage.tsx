import { cn } from "@/lib/utils/tailwind";
import type { CatalogueItem } from "../data";
import Image from "next/image";

export default function HeroImage({ data }: { data: CatalogueItem }) {
  return (
    <div
      className={cn(
        "absolute inset-0 text-accent-600 opacity-40",
        "transition-all duration-700 hover:scale-110",
        "[animation:pendulum_8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite_alternate]"
      )}
    >
      <Image
        src={data.imageUrl}
        alt={data.label}
        fill
        className="object-contain rounded-none"
        loading="lazy"
        sizes="(max-width: 1024px) 0px, (max-width: 1280px) 288px, 400px"
      />
    </div>
  );
}
