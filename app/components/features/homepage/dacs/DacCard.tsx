import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity/lib/image";

export default function DacCard({ item, idx }: { item: any; idx: number }) {
  if (!item) return null;

  const productName = item.name || "Unknown Product";
  const brandName = item.brand || "Generic";
  const price = item.displayPrice ? `$${item.displayPrice}` : "Contact for Price";

  return (
    <div className={cn(
      "group flex flex-col gap-6 p-6 rounded-2xl border border-brand-800/20 bg-brand-800/5",
      "interactive-card"
    )}>
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={urlFor(item.image).url()}
          alt={productName}
          width={400}
          height={400}
          priority={idx < 4}
          loading={idx < 4 ? "eager" : "lazy"}
          className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-body text-cap font-bold italic tracking-tight">
          {productName}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-small font-mono text-brand-400 uppercase">
            {brandName}
          </span>
          <span className="text-body font-light text-brand-100">
            {price}
          </span>
        </div>
      </div>
    </div>
  );
}