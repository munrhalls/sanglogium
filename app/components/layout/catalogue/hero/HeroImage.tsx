import { cn } from "@/lib/utils/tailwind";
import type { CatalogueNavItem } from "../catalogue-nav.types";
import Image from "next/image";

export default function HeroImage({ data }: { data: CatalogueNavItem }) {
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
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
      />
    </div>
  );
}
