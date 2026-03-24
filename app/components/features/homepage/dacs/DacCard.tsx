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
      <figure className="aspect-square rounded-none relative flex w-full items-center justify-center overflow-hidden bg-brand-300 p-6">
        <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
          {brandName}
        </span>
        <Image
          src={urlFor(item.image).width(400).auto('format').quality(75).url()}
          alt={productName}
          width={400}
          height={400}
          loading="lazy"
          className="h-auto max-h-[95%] w-auto max-w-[95%] transform object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
        />
      </figure>
      <div className="flex flex-col gap-2">
        <h3 className="text-body text-cap font-bold italic tracking-tight">
          {productName}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-body font-light text-brand-100">
            {price}
          </span>
        </div>
      </div>
    </div>
  );
}