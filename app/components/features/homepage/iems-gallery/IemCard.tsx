import { cn } from "@/lib/utils/tailwind"
import { Image } from "next-sanity/image"
import { urlFor } from "@/sanity/lib/image"
import { IemProduct } from "./getIemProducts"
import { ShoppingCart } from "@phosphor-icons/react/dist/ssr"

export default function IemCard({ product, idx }: { product: IemProduct; idx: number }) {
    if (!product) return null;

    return (
        <div className="group relative flex flex-col gap-4 p-4 rounded-none border border-transparent  transition-all">
            <div className="relative flex justify-center items-center aspect-square w-full overflow-hidden rounded-none bg-brand-100 pt-12 pb-4 cursor-pointer">
                <Image
                    src={urlFor(product.image).width(375).auto('format').quality(75).url()}
                    alt={product.name}
                    width={375}
                    height={375}
                    loading="lazy"
                    className="object-cover w-[60%] h-[60%] transition-transform duration-300 group-hover:scale-105 object-center"
                />
                <div className="absolute left-4 top-4">
                    <span className="text-small font-bold uppercase tracking-editorial text-brand-900">{product.brand}</span>
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
                        <ShoppingCart size={20} style={{ marginBottom: "2px" }} />
                        Add
                    </button>
                </div>
            </div>
        </div>
    )
}
