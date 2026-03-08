import Image from "next/image";

export default function CardMedia({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="p-8 pb-0 flex-[2] bg-secondary-50/30">
      <div className="relative aspect-square w-full overflow-hidden bg-white rounded-sm border border-secondary-100">
        <Image
          src={src || "/placeholder.png"}
          alt={alt}
          fill
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 40vw, 20vw"
        />
      </div>
    </div>
  );
}
