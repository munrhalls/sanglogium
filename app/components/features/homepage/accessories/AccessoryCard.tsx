import { cn } from "@/lib/utils/tailwind";
import GridMediaBox from "@/app/components/layout/grid/GridMediaBox";

export default function AccessoryCard({ item }: { item: any }) {
  return (
    <div className={cn(
      "group flex flex-col gap-3 p-3 rounded-lg border border-transparent",
      "interactive-card"
    )}>
      <GridMediaBox src={item.imageUrl} alt={item.name} />
      <div className="flex flex-col gap-1">
        <h4 className="text-[11px] font-bold text-brand-100 truncate leading-tight">
          {item.name}
        </h4>
        <span className="text-[10px] font-medium text-secondary-500 italic">
          ${item.displayPrice}
        </span>
      </div>
    </div>
  );
}
