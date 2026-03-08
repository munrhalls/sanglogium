import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

export default function GridMediaBox({ src, alt, aspectRatio = "aspect-square" }: { src: string; alt: string; aspectRatio?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-brand-800/5 border border-brand-800/10", aspectRatio)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 768px) 50vw, 25vw"
      />
    </div>
  );
}
