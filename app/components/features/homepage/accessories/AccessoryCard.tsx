import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity/lib/image";
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr";

export default function AccessoryCard({ item, idx }: { item: AccessoryItem; idx: number }) {
  if (!item) return null;

  return (
    <article className="group flex h-full flex-col bg-transparent p-6 transition-all duration-300">

      <figure className="aspect-[3/2] rounded-none relative flex w-full items-center justify-center overflow-hidden bg-brand-300 p-6 md:pt-12 md:pb-4 md:px-4 mb-4">
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
          className="h-auto max-h-[75%] w-auto max-w-[75%] md:max-h-full md:max-w-full md:h-full md:w-full transform object-contain object-center mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
      </figure>

      <div className="flex flex-col flex-grow">

        {/* ZONE 1: INFO - Height recalculated to 5.5rem (~88px) to fit Title + Price perfectly */}
        <div className="flex flex-col h-[5.5rem] mb-4">

          <h3 className="type-body line-clamp-2 font-medium mb-2">
            {item.name}
          </h3>

          <p className="type-price">${item.displayPrice}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-border-secondary/50">
          <button className="btn-cart w-full justify-center transition-all active:scale-95">
            <ShoppingCart size={18} weight="bold" />
            <span className="hidden md:block text-cap font-bold ml-2">Add to Cart</span>
            <span className=" md:hidden text-cap font-bold ml-2">Add</span>

          </button>
        </div>
      </div>
    </article>
  );
}