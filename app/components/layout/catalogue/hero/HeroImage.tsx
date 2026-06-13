import { cn } from "@/lib/utils/tailwind";
import type { CatalogueNavItem } from "../catalogue-nav.types";

export default function HeroImage({ data }: { data: CatalogueNavItem }) {
  return (
    <div
      className={cn(
        "absolute inset-0 text-accent-600 opacity-40",
        "transition-all duration-700 hover:scale-110",
        "[animation:pendulum_8s_cubic-bezier(0.45,0.05,0.55,0.95)_infinite_alternate]"
      )}
    >
      <img
        src={data.imageUrl}
        alt={data.label}
        className="absolute inset-0 h-full w-full object-contain rounded-none"
        loading="lazy"
      />
    </div>
  );
}
