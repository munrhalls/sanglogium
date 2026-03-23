import { cn } from "@/lib/utils/tailwind"
import { Image } from "next-sanity/image"
import { urlFor } from "@/sanity/lib/image"
import { IemProduct } from "./types"

export default function IemCard({ product, idx }: { product: IemProduct; idx: number }) {
    if (!product) return null;

    return (
        <div className="group relative flex flex-col gap-4 p-4 rounded-xl border border-transparent hover:bg-brand-800/20 transition-all">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-brand-800/10">
                <Image
                    src={urlFor(product.image).url()}
                    alt={product.name}
                    width={400}
                    height={400}
                    loading="lazy"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-small font-mono uppercase tracking-widest text-brand-400">
                    {product.brand}
                </span>
                <h3 className="text-small font-bold truncate">
                    {product.name}
                </h3>
                <p className="text-small text-brand-200">
                    ${product.displayPrice}
                </p>
            </div>
        </div>
    )
}
