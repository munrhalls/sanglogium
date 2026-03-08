import { cn } from "@/lib/utils/tailwind";

export default function AccessoryCard({ item }: { item: any }) {
  return (
    <div className="group flex flex-col gap-3 p-3 rounded-lg border border-transparent hover:border-secondary-200 transition-all">
      <div className="flex flex-col gap-1">
        <h4 className="text-small font-bold text-brand-100 truncate">
          {item.name}
        </h4>
        <span className="text-small font-medium text-secondary-500 italic opacity-80">
          {item.brand}
        </span>
      </div>
    </div>
  );
}
