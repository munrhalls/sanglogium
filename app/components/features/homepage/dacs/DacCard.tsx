import { cn } from "@/lib/utils/tailwind";
import CarouselMediaBox from "@/app/components/layout/carousel/CarouselMediaBox";

export default function DacCard({ item }: { item: any }) {
  return (
    <div className={cn(
      "group flex flex-col gap-6 p-6 rounded-2xl border border-brand-800/20 bg-brand-800/5",
      "interactive-card"
    )}>
      <CarouselMediaBox src={item.imageUrl} alt={item.name} />
      <div className="flex flex-col gap-2">
        <h3 className="text-body text-cap font-bold text-brand-100 italic tracking-tight">
          {item.name}
        </h3>
        <div className="flex justify-between items-center">
          <span className="text-small font-mono text-brand-400 uppercase">
            {item.type}
          </span>
          <span className="text-body font-light text-brand-100">
            ${item.displayPrice}
          </span>
        </div>
      </div>
    </div>
  );
}
