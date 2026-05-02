import { cn } from "@/lib/utils/tailwind"
import { Image } from "next-sanity/image"
import { urlFor } from "@/sanity/lib/image"
import { IemProduct } from "./getIemProducts"
import { AddToCartButton } from "@/app/components/ui/AddToCartButton"
import { centsToDisplay } from "@/lib/utils/price"

export default function IemCard({ product, idx }: { product: IemProduct; idx: number }) {
    if (!product) return null;

    return (
        <a href={`/products/${product.slug}`} className="block group">
            <article className="card-product p-0 xs:p-6 flex h-full flex-col gap-4 group-hover:shadow-cardHover group-hover:-translate-y-1 transition-all duration-300">
            <div className="relative flex justify-center items-center aspect-square w-full overflow-hidden rounded-none bg-surface-productImage pt-0 xs:pt-8 md:pt-12 pb-0 xs:pb-4 cursor-pointer">
                <Image
                    src={urlFor(product.image).width(375).auto('format').quality(75).url()}
                    alt={product.name}
                    width={375}
                    height={375}
                    loading="lazy"
                    className="object-cover w-[70%] h-[70%] xs:w-[60%] xs:h-[60%] transition-transform duration-300 group-hover:scale-105 object-center"
                />
                <div className="absolute left-2 top-2 xs:top-4">
                    <span className="text-[7px] xs:text-small font-bold uppercase tracking-editorial text-brand-900 whitespace-nowrap xs:whitespace-normal">{product.brand.name}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 xs:gap-3">
                <h3 className="type-body font-medium line-clamp-2">
                    {product.name}
                </h3>
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                    <p className="type-price">
                        ${centsToDisplay(product.price_data.unit_amount)}
                    </p>
                    <AddToCartButton
                        productId={product._id}
                        name={product.name}
                        displayPrice={centsToDisplay(product.price_data.unit_amount)}
                        stock={product.stock ?? 99}
                        imageUrl={product.imageUrl ?? ''}
                        slug={product.slug}
                        className="w-full justify-center xs:w-auto"
                    />
                </div>
            </div>
        </article>
        </a>
    )
}
