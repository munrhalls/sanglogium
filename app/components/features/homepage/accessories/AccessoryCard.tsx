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
        <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-t-[0.4rem] bg-surface-productImage p-0">
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
              className="absolute right-2 top-8 z-10"
            />
          )}
          <div className="absolute left-2 right-2 top-2">
            <span className="block truncate text-small font-bold uppercase tracking-tight text-brand-900">
              {item.brand?.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 px-4 pt-3 md:px-8 md:pt-4">
          <h3 className="text-body leading-snug line-clamp-2 break-words">
            {item.name}
          </h3>
        </div>
      </Link>

      <div className="mt-auto flex flex-row items-center justify-between gap-3 pt-2 px-4 pb-6 md:px-8 md:pb-8">
        <Price
          value={centsToDisplay(item.price_data.unit_amount)}
          className="type-price tabular-nums text-base leading-tight min-w-0"
        />
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          addClassName="btn-cart md:py-0.5"
          wrapperClassName="shrink-0"
        />
      </div>
    </article>
  );
}
