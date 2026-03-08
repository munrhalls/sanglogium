import Image from "next/image";

export default function CarouselMediaBox({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full h-32 mb-4 bg-black/20 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2 transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 45vw, 15vw"
      />
    </div>
  );
}
