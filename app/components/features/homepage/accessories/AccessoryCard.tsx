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
}: {
  item: AccessoryItem;
  idx: number;
}) {
  if (!item) return null;

  const modelName = getModelName(item.name, item.brand.name);

  return (
    <article className="card-product-dark mx-auto flex h-full w-full max-w-[260px] flex-col gap-1 p-2 xs:p-3 md:p-4">
      <Link href={`/product/${item.slug}`} className="block">
        <figure className="relative mb-2 flex aspect-[3/2] lg:aspect-[2/1] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-productImage p-2 xs:p-3 md:px-3 md:pb-3 md:pt-3">
          <span className="absolute left-2 top-2 xs:left-4 xs:top-3 text-tiny font-normal uppercase tracking-tight text-brand-900 hidden md:block">
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
            className="h-auto max-h-[78%] w-auto max-w-[78%] transform object-contain object-[67%_59%] mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        </figure>

        <div className="flex flex-grow flex-col pb-1 pt-1 md:px-3 md:pb-2 md:pt-1">
          <div className="flex flex-col mt-2">
            <span className="block md:hidden text-tiny font-light uppercase tracking-tight text-accent-500 xs:text-small">
              {item.brand.name}
            </span>
            <h3 className="text-small line-clamp-2">
              {modelName}
            </h3>
          </div>
        </div>
      </Link>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 px-3 pb-3 pt-2 mt-auto lg:gap-4 lg:px-3 lg:py-2">
        <p className="type-price">
          ${centsToDisplay(item.price_data.unit_amount)}
        </p>
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          addClassName="btn-cart w-full justify-center lg:w-auto lg:gap-1 lg:px-2 lg:py-1 lg:text-small"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
