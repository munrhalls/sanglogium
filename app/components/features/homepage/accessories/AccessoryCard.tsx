import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import type { AccessoryItem } from "./types";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

function getModelName(productName: string, brandName: string): string {
  // Escape special regex characters in brand name (spaces, ampersands, etc.)
  const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Remove brand name from product name to get model name only (case-insensitive)
  const model = productName.replace(new RegExp(`^${escapedBrand}\\s*`, 'i'), '').trim();
  
  // Fallback to original name if replacement fails or results in empty string
  return model || productName;
}

export default function AccessoryCard({
  item,
  idx,
  categoryLabel,
}: {
  item: AccessoryItem;
  idx: number;
  categoryLabel?: string;
}) {
  if (!item) return null;

  const modelName = getModelName(item.name, item.brand.name);

  return (
    <article className="card-product-dark flex h-full flex-col gap-3 p-2 xs:p-3 md:p-6">
      <Link href={`/product/${item.slug}`} className="block">
        <figure className="relative mb-2 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-productImage p-2 xs:p-3 md:px-4 md:pb-4 md:pt-12">
          <span className="absolute left-2 top-2 xs:left-4 xs:top-4 text-tiny font-bold uppercase tracking-tight text-brand-900 xs:text-small hidden md:block">
            {item.brand.name}
          </span>
          <Image
            src={item.image?.asset?._id ?? ""}
            alt={item.name}
            width={450}
            height={450}
            priority={idx === 0}
            loading={idx === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-auto max-h-[75%] w-auto max-w-[75%] transform object-contain object-center mix-blend-multiply transition-transform duration-700 group-hover:scale-110 md:h-full md:max-h-full md:w-full md:max-w-full"
          />
        </figure>

        <div className="flex flex-grow flex-col pb-1 pt-1 md:px-4 md:pb-4 md:pt-2">
          <div className="flex flex-col mt-3">
            {categoryLabel && <p className="hidden xs:block type-overline mb-1">{categoryLabel}</p>}
            <span className="block md:hidden text-tiny font-light uppercase tracking-tight text-accent-500 xs:text-small">
              {item.brand.name}
            </span>
            <h3 className="text-small line-clamp-2">
              {modelName}
            </h3>
            <p className="type-price mt-2">
              ${centsToDisplay(item.price_data.unit_amount)}
            </p>
          </div>
        </div>
      </Link>

      <div className="md:px-4 md:pb-4 mt-auto">
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
