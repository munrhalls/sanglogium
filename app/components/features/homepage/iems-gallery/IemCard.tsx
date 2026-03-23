import { cn } from "@/lib/utils/tailwind"
import { Image } from "next-sanity/image"
import { urlFor } from "@/sanity/lib/image"
import { IemProduct } from "./getIemProducts"

export default function IemCard({ product, idx }: { product: IemProduct; idx: number }) {
    if (!product) return null;

    return (
        <div className="group relative flex flex-col gap-4 p-4 rounded-none border border-transparent hover:bg-brand-50 hover:border-brand-200 transition-all">
            <div className="relative aspect-square w-full overflow-hidden rounded-none bg-brand-50">
                <Image
                    src={urlFor(product.image).width(400).auto('format').quality(75).url()}
                    alt={product.name}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 bg-brand-700 px-2 py-1">
                    <span className="type-overline">{product.brand}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="type-body font-bold line-clamp-2">
                    {product.name}
                </h3>
                <div className="flex items-center justify-between gap-2">
                    <p className="type-price">
                        ${product.displayPrice}
                    </p>
                    <button className="btn-cart">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
