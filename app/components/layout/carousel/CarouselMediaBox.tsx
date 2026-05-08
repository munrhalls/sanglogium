import Image from "next/image";
import { urlFor } from "@/sanity-cms/lib/client";

interface CarouselMediaBoxProps {
  src: any;
  alt: string;
}

export default function CarouselMediaBox({ src, alt }: CarouselMediaBoxProps) {
  if (!src) return <div className="bg-secondary-100 aspect-square w-full animate-pulse rounded-sm" />;

  const isStringUrl = typeof src === "string";
  const imagePath = isStringUrl ? src : urlFor(src).url();

  return (
    <div className="relative aspect-square w-full overflow-hidden">
      <Image
        src={imagePath}
        alt={alt || "Product image"}
        fill
        sizes="(max-width: 768px) 40vw, 20vw"
        className="object-contain transition-transform duration-700 group-hover:scale-105"
        priority
      />
    </div>
  );
}
