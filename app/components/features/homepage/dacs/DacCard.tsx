import { cn } from "@/lib/utils/tailwind";
import CarouselMediaBox from "@/app/components/layout/carousel/CarouselMediaBox";

export default function DacCard({ item }: { item: any }) {
  if (!item) return null;

  const imageUrl = item.image?.asset?.url || "/images/placeholder-product.jpg";
  const productName = item.name || "Unknown Product";
  const brandName = item.brand || "Generic";
  const price = item.displayPrice ? `$${item.displayPrice}` : "Contact for Price";

  return (
    <div className={cn(
      "group flex flex-col gap-6 p-6 rounded-2xl border border-brand-800/20 bg-brand-800/5",
      "interactive-card"
    )}>
      <CarouselMediaBox
        src={imageUrl}
        alt={productName}
      />
      <div className="flex flex-col gap-2">
        <h3 className="text-body text-cap font-bold italic tracking-tight">
          {productName}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-small font-mono text-brand-400 uppercase">
            {brandName}
          </span>
          <span className="text-body font-light text-brand-100">
            {price}
          </span>
        </div>
      </div>
    </div>
  );
}