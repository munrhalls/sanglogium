import Image from "next/image";
import { urlFor } from "@/sanity/lib/client";

interface CarouselMediaBoxProps {
  src: any;
  alt: string;
}

export default function CarouselMediaBox({ src, alt }: CarouselMediaBoxProps) {
  // Guard clause for missing source to prevent runtime crashes
  if (!src) return <div className="bg-secondary-100 aspect-square w-full animate-pulse" />;

  return (
    <div className="relative aspect-square w-full overflow-hidden bg-white">
      <Image
        src={urlFor(src).url()}
        alt={alt || "Product image"}
        fill
        sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 20vw"
        className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
      />
    </div>
  );
}
