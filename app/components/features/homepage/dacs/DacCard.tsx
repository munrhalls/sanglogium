import Image from "next/image";
import Link from "next/link";
import { BasketControls } from "@/app/components/features/basket/BasketControls";
import { centsToDisplay } from "@/lib/utils/price";

export default function DacCard({ item, idx }: { item: any; idx: number }) {
  if (!item) return null;

  const productName = item.name || "Unknown Product";
  const brandName = item.brand?.name || "Generic";
  const price = item.price_data
    ? `$${centsToDisplay(item.price_data.unit_amount)}`
    : "Contact for Price";

  return (
    <article className="group card-product-dark flex h-full min-w-0 flex-col overflow-hidden !p-0">
      <Link href={`/product/${item.slug}`} className="flex flex-grow flex-col">
        <figure className="relative flex aspect-[4/3] lg:aspect-[3/2] lg-touch:aspect-[16/9] w-full items-center justify-center overflow-hidden bg-surface-productImage">
          <span className="type-product-brand absolute left-3 top-3 z-10 text-brand-900">
            {brandName}
          </span>
          <Image
            src={item.image?.asset?._id ?? ""}
            alt={productName}
            width={400}
            height={400}
            priority={idx === 0}
            loading={idx === 0 ? "eager" : "lazy"}
            sizes="(max-width: 768px) 50vw, 25vw"
            className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
          />
        </figure>

        <div className="flex min-w-0 flex-grow flex-col gap-1 p-3">
          <h3 className="type-product-title line-clamp-2 min-h-[2.5em]">{productName}</h3>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <p className="type-product-price tabular-nums">{price}</p>
        <BasketControls
          productId={item._id}
          isBasketPage={false}
          label="Add"
          addClassName="btn-product-add"
          wrapperClassName="flex items-center gap-1"
        />
      </div>
    </article>
  );
}
