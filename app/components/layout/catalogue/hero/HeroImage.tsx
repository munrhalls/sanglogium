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
        "landscape:aspect-square landscape:h-[512px] landscape:w-[512px]",
        // "lg-touch:landscape:h-[748px] lg-touch:landscape:w-[748px]",
        // "lg-desktop:landscape:h-[1024px] lg-desktop:landscape:w-[1024px]"
        "lg-touch:landscape:aspect-square lg-touch:landscape:h-[150%] lg-touch:landscape:w-auto",
        "lg-desktop:landscape:aspect-square lg-desktop:landscape:h-[90%] lg-desktop:landscape:w-auto",
        "lg-desktop:landscape:left-[-27.5%]"
      )}
    >
      <Image
        src={data.imageUrl}
        alt={data.label}
        fill
        className="object-contain lg-touch:landscape:object-cover lg-touch:landscape:object-center"
        priority
      />
    </div>
  );
}
