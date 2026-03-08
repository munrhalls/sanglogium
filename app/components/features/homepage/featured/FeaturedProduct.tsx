import Link from "next/link";
import CarouselMediaBox from "@/app/components/layout/carousel/CarouselMediaBox";

export default function FeaturedProduct({ product }: { product: any }) {
  const imageSource = product.imageUrl || product.mainImage;
  const price = product.displayPrice || product.price;
  
  const categoryLabel = Array.isArray(product.tag) 
    ? (Array.isArray(product.tag[0]) ? product.tag[0][0] : product.tag[0])
    : "Audio";

  return (
    <Link
      href={`/product/${product.slug?.current || product.slug || ""}`}
      className="group flex flex-col h-full bg-white transition-all duration-500 rounded-sm shadow-card hover:shadow-card-hover"
    >
      {/* Internal Spacing: .6 (24px) for Macro breathing room */}
      <div className="p-6 pb-0">
        <CarouselMediaBox
          src={imageSource}
          alt={product.name}
        />
      </div>

      <div className="p-6 pt-4 flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-2"> {/* Micro-Scale: .2 (8px) for label relationship */}
          <h3 className="text-small font-bold uppercase tracking-widest text-brand-900 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-small font-medium uppercase text-secondary-500">
            {categoryLabel.split("/").pop()?.replace("-", " ")}
          </p>
        </div>

        <div className="mt-6 text-body font-bold text-brand-900">
          ${price}
        </div>
      </div>
    </Link>
  );
}
