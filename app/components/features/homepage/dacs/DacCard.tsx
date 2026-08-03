import { cn } from "@/lib/utils/tailwind";
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
    <article className="card-product-dark flex h-full flex-col gap-4 lg-touch:gap-3 lg-touch:p-4 lg:grid lg:grid-cols-[1fr_auto] lg:items-center">
      <Link href={`/product/${item.slug}`} className="flex flex-grow flex-col lg:contents">
        <figure className="relative flex aspect-[4/3] lg:aspect-[3/2] lg-touch:aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-productImage p-6 lg-touch:p-4 lg:col-span-2">
          <span className="absolute left-4 top-2 z-10 text-tiny xs:text-small tracking-tight text-brand-900">
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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)]"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.04) 100%)",
            }}
          />
        </figure>

        <div className="flex flex-grow flex-col px-4 pt-2 mt-3 lg-touch:px-2 lg-touch:pt-1 lg:contents">
          <h3 className="text-small line-clamp-2 lg:col-span-2 lg:px-4">
            {productName}
          </h3>
          <p className="type-price mt-2 lg:mt-0 lg:px-4 lg:text-action">{price}</p>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-2 mt-auto lg:m-0 lg:p-0 lg:pr-4">
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
