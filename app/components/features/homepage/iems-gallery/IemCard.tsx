import { cn } from "@/lib/utils/tailwind";
import GridMediaBox from "@/app/components/layout/grid/GridMediaBox";

export default function IemCard({ iem }: { iem: any }) {
  return (
    <div className={cn(
      "group relative flex flex-col gap-4 p-4 rounded-xl border border-transparent",
      "interactive-card"
    )}>
      <GridMediaBox src={iem.imageUrl} alt={iem.name} />
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-brand-400">
          {iem.brand}
        </span>
        <h3 className="text-small text-cap font-bold text-brand-100 truncate">
          {iem.name}
        </h3>
        <p className="text-small font-light text-secondary-400">
          ${iem.displayPrice}
        </p>
      </div>
    </div>
  );
}
