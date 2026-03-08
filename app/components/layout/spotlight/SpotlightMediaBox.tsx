import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

export default function SpotlightMediaBox({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative w-full aspect-square lg:aspect-auto lg:h-feature-media flex items-center justify-center bg-secondary-300/10", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-8 transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl"
        sizes="(max-width: 1024px) 100vw, 40vw"
        priority
      />
    </div>
  );
}
