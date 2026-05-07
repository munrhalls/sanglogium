import { cn } from "@/lib/utils/tailwind";
import { Image } from "next-sanity/image";
import { urlFor } from "@/sanity-config/lib/image";
import type { AccessoryItem } from "./types";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function AccessoryCard({ item, idx }: { item: AccessoryItem; idx: number }) {
  if (!item) return null;

  return (
    <a href={`/products/${item.slug}`} className="block group">
      <article className="card-product flex h-full flex-col gap-4 group-hover:shadow-cardHover group-hover:-translate-y-1 transition-all duration-300">

        <figure className="aspect-[4/3] rounded-none relative flex w-full items-center justify-center overflow-hidden bg-surface-productImage p-6 md:pt-12 md:pb-4 md:px-4 mb-4">
          <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
            {item.brand.name}
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
        <div className="flex flex-col min-h-[5.5rem] mb-4">

          <h3 className="type-body line-clamp-2 font-medium mb-2">
            {item.name}
          </h3>

          <p className="type-price">${centsToDisplay(item.price_data.unit_amount)}</p>
        </div>

        <div className="mt-auto pt-4 border-t border-border-secondary/50">
          <BasketControls
            productId={item._id}
            displayPriceAtAdd={centsToDisplay(item.price_data.unit_amount)}
            availableStockAtAdd={(item as any).stock ?? 99}
            isBasketPage={false}
            addClassName="btn-cart w-full justify-center"
            wrapperClassName="flex items-center gap-1"
            decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
            incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
            quantityClassName="w-7 text-center type-body text-primary tabular-nums"
          />
        </div>
      </div>
    </article>
  </a>
  );
}
