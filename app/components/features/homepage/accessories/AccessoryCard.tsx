import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity/lib/image";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";

export default function AccessoryCard({ item, idx }: { item: AccessoryItem; idx: number }) {
  if (!item) return null;

  return (
    <article className="group flex h-full flex-col bg-transparent p-6 transition-all duration-300 gap-3">
      <figure className="aspect-[3/2] rounded-none relative flex w-full items-center justify-center overflow-hidden bg-brand-300 p-6 md:pt-6 md:pb-2 md:px-4">
        <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
          {item.brand}
        </span>
        <Image
          src={urlFor(item.image).width(450).auto('format').quality(75).url()}
          alt={item.name}
          width={450}
          height={450}
          priority={idx === 0}
          loading={idx === 0 ? "eager" : "lazy"}
          className="h-auto max-h-[95%] w-auto max-w-[95%] md:max-h-full md:max-w-full md:h-full md:w-full transform object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
      </figure>

      <div className="flex flex-col h-[3rem] pb-2">
        <p className="type-body font-bold transition-colors group-hover:text-brand-50">
          {item.name}
        </p>
      </div>
      <div className="mt-auto flex items-center ">
        <p className="text-cap type-price text-center">${item.displayPrice}</p>
        <button className="btn-cart transition-all active:scale-95 ml-auto">
          <ShoppingCart size={18} weight="bold" />
          <span className="text-cap font-bold">Add</span>
        </button>
      </div>
    </article>
  );
}
