import Link from "next/link";
import Image from "next/image";

export default function FeaturedProduct({ product }: { product: any }) {
  if (!product) return null;
  return (
    <Link 
      href={`/product/${product.slug?.current || ""}`}
      className="group flex flex-col h-full bg-white transition-all duration-500 rounded-sm shadow-card hover:shadow-card-hover"
    >
      <div className="p-6 pb-0">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={product.imageUrl || "/placeholder.png"}
            alt={product.name || "Product"}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 40vw, 20vw"
          />
        </div>
      </div>
      <div className="p-6 pt-4 flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-2">
          <h3 className="text-small font-bold uppercase tracking-widest text-brand-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-small font-medium uppercase text-secondary-500">
            {product.category}
          </p>
        </div>
        <div className="mt-6 text-body font-bold text-brand-900">
          ${product.price}
        </div>
      </div>
    </Link>
  );
}
