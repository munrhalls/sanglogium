import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  brand: string;
  displayPrice: number;
  imageUrl: string;
  slug: string | { current: string };
  tag?: string[];
}

export default function ProductCard({ product }: { product: Product }) {
  if (!product) return null;
  const href = typeof product.slug === 'string'
    ? `/product/${product.slug}`
    : `/product/${product.slug?.current || ""}`;

  return (
    <Link
      href={href}
      className="group flex flex-col h-full bg-white border border-secondary-100 transition-all duration-500 rounded-sm hover:shadow-card-hover overflow-hidden"
    >
      <ProductMedia src={product.imageUrl} alt={product.name} />
      <ProductDetails
        name={product.name}
        brand={product.brand}
        price={product.displayPrice}
      />
    </Link>
  );
}

function ProductMedia({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="p-8 pb-0 flex-[2] bg-secondary-50/30">
      <div className="relative aspect-square w-full overflow-hidden bg-white rounded-sm border border-secondary-100">
        <Image
          src={src || "/placeholder.png"}
          alt={alt}
          fill
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 40vw, 20vw"
        />
      </div>
    </div>
  );
}

function ProductDetails({ name, brand, price }: { name: string; brand: string; price: number }) {
  return (
    <div className="p-8 pt-6 flex flex-col justify-between flex-1">
      <div className="flex flex-col gap-2">
        <span className="text-small font-mono text-secondary-400 uppercase tracking-tighter">
          {brand}
        </span>
        <h3 className="text-h3 font-light leading-tight text-brand-900 line-clamp-2">
          {name}
        </h3>
      </div>

      <div className="mt-8 flex items-baseline justify-between pt-6 border-t border-secondary-100">
        <span className="text-body font-bold text-brand-900">
          ${price}
        </span>
        <span className="text-small font-bold uppercase tracking-widest text-brand-600 transition-all group-hover:translate-x-1">
          Shop
        </span>
      </div>
    </div>
  );
}

