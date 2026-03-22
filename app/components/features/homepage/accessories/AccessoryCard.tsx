import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity/lib/image";

export default function AccessoryCard({ item, idx }: { item: AccessoryItem; idx: number }) {
  if (!item) return null;

  return (
    <div className="group flex flex-col gap-3 p-3 rounded-lg border border-transparent hover:border-secondary-200 transition-all">
      <div className="relative aspect-square w-full overflow-hidden rounded bg-brand-800/10">
        <Image
          src={urlFor(item.image).url()}
          alt={item.name}
          width={400}
          height={400}
          priority={idx < 4}
          loading={idx < 4 ? "eager" : "lazy"}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-small font-bold truncate">
          {item.name}
        </h4>
        <div className="flex justify-between items-center">
          <span className="text-small font-medium text-secondary-500 italic opacity-80">
            {item.brand}
          </span>
          <span className="text-small font-mono text-brand-200">
            ${item.displayPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
