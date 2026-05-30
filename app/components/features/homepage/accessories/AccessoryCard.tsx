import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import { sanityImageLoader } from "@/lib/utils/sanityImageLoader";
import Link from "next/link";
import type { AccessoryItem } from "./types";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function AccessoryCard({
  item,
  idx,
}: {
  item: AccessoryItem;
  idx: number;
}) {
  if (!item) return null;

  return (
    <article className="card-product flex h-full flex-col gap-4 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-cardHover">
      <Link href={`/product/${item.slug}`} className="block">
        <figure className="rounded-none relative mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-productImage p-6 md:px-4 md:pb-4 md:pt-12">
          <span className="absolute left-4 top-4 text-small font-bold uppercase tracking-editorial text-brand-900">
            {item.brand.name}
          </span>
          <Image
            src={item.image?.asset?._id ? sanityImageLoader({ src: item.image?.asset?._id, width: 450, quality: 75 }) : ""}
            alt={item.name}
            width={450}
            height={450}
            priority={idx === 0}
            loading={idx === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-auto max-h-[75%] w-auto max-w-[75%] transform object-contain object-center mix-blend-multiply transition-transform duration-700 group-hover:scale-110 md:h-full md:max-h-full md:w-full md:max-w-full"
          />
        </figure>

        <div className="flex flex-grow flex-col px-4 pb-4">
          {/* ZONE 1: INFO - Height recalculated to 5.5rem (~88px) to fit Title + Price perfectly */}
          <div className="mb-4 flex min-h-[5.5rem] flex-col">
            <h3 className="type-body mb-2 line-clamp-2 font-medium">
              {item.name}
            </h3>

            <p className="type-price">
              ${centsToDisplay(item.price_data.unit_amount)}
            </p>
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4">
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          addClassName="btn-cart w-full justify-center"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
