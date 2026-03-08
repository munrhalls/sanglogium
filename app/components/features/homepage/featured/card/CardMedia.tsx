import Image from "next/image";

export default function CardMedia({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative flex-[2] bg-secondary-50/10 p-6 group-hover:bg-secondary-50/30 transition-colors duration-500">
      {/* The Gallery Frame: Matching the reference image boxed depth */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-sm ring-1 ring-black/5">
        <Image
          src={src || "/placeholder.png"}
          alt={alt}
          fill
          priority
          className="object-contain p-10 transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 85vw, (max-width: 1200px) 30vw, 25vw"
        />
      </div>
    </div>
  );
}
