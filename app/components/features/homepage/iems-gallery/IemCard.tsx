import { cn } from "@/lib/utils/tailwind";
import Image from "next/image";
import Link from "next/link";
import { IemProduct } from "./getIemProducts";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { Price } from "@/app/components/ui/Price";
import { centsToDisplay } from "@/lib/utils/price";

function getModelName(productName: string, brandName: string): string {
  // Escape special regex characters in brand name (spaces, ampersands, etc.)
  const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Remove brand name from product name to get model name only (case-insensitive)
  const model = productName.replace(new RegExp(`^${escapedBrand}\\s*`, 'i'), '').trim();
  
  // Fallback to original name if replacement fails or results in empty string
  return model || productName;
}

export default function IemCard({
  product,
  idx,
}: {
  product: IemProduct;
  idx: number;
}) {
  if (!product) return null;

  const modelName = getModelName(product.name, product.brand.name);

  return (
    <article className="card-product-dark flex h-full flex-col gap-3 !p-3 xs:!p-6 lg:!p-3">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface-productImage pt-6 pb-2 xs:pt-8 xs:pb-4 md:pt-12 lg:pt-2 lg:pb-0">
          <Image
            src={product.image?.asset?._id ?? ""}
            alt={product.name}
            width={375}
            height={375}
            loading="lazy"
            className="h-[70%] w-[70%] object-cover object-center mix-blend-multiply transition-transform duration-300 group-hover:scale-105 xs:h-[60%] xs:w-[60%]"
          />
          <div className="absolute left-2 right-2 top-2 xs:top-3 hidden md:block">
            <span className="block truncate text-tiny font-bold uppercase tracking-tight text-brand-900 xs:text-small">
              {product.brand.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-3">
          <span className="block md:hidden text-tiny font-light uppercase tracking-tight text-accent-500 xs:text-small">
            {product.brand.name}
          </span>
          <h3 className="text-small">{modelName}</h3>
        </div>
      </Link>

      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between mt-auto">
        <Price value={centsToDisplay(product.price_data.unit_amount)} />
        <BasketControls
          productId={product._id}
          isBasketPage={false}
          addClassName="btn-cart"
          wrapperClassName="flex items-center gap-1"
          decrementClassName="btn-secondary w-8 h-8 flex items-center justify-center"
          incrementClassName="btn-secondary w-8 h-8 flex items-center justify-center disabled:opacity-50"
          quantityClassName="w-7 text-center type-body text-primary tabular-nums"
        />
      </div>
    </article>
  );
}
