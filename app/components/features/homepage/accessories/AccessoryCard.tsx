import Image from "next/image";
import Link from "next/link";
import type { AccessoryItem } from "./types";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { Price } from "@/app/components/ui/Price";
import { ProductBadge } from "@/app/components/ui/ProductBadge";
import { centsToDisplay } from "@/lib/utils/price";

interface AccessoryCardProps {
  item: AccessoryItem;
  idx: number;
  badge?: string;
}

export default function AccessoryCard({ item, badge }: AccessoryCardProps) {
  if (!item) return null;

  return (
    <article className="card-product-dark group flex h-full flex-col overflow-hidden !p-0 rounded-[0.4rem]">
      <Link href={`/product/${item.slug}`} className="block">
        <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-[0.4rem] bg-surface-productImage p-0 max-sm:aspect-[3/2]">
          <Image
            src={item.image?.asset?._id ?? ""}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            loading="lazy"
            className="object-cover object-center mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <ProductBadge
              label={badge}
              className="absolute right-0 top-0 z-10 md:right-2 md:top-8"
            />
          )}
          <div className="absolute left-2 right-2 top-2 hidden md:block">
            <span className="block truncate text-small font-bold uppercase tracking-tight text-brand-900">
              {item.brand?.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-3 pt-3 md:px-8 md:pt-4">
          {item.brand?.name && (
            <span className="block truncate text-tiny font-bold uppercase tracking-tight text-text-caption md:hidden">
              {item.brand.name}
            </span>
          )}
          <h3 className="text-small leading-snug line-clamp-4 break-words md:text-body">
            {item.name}
          </h3>
        </div>
      </Link>

      <div className="mt-auto flex flex-col gap-2 px-3 pt-2 pb-5 md:flex-row md:items-center md:justify-between md:gap-3 md:px-8 md:pb-8">
        <Price
          value={centsToDisplay(item.price_data.unit_amount)}
          className="type-price tabular-nums text-small leading-tight min-w-0 md:text-base"
        />
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          addClassName="btn-cart w-full min-h-[32px] md:w-auto md:min-h-0 md:py-0.5"
          label="To cart"
          wrapperClassName="w-full md:w-auto md:shrink-0"
        />
      </div>
    </article>
  );
}
