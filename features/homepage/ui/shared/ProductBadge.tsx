import { cn } from "@/lib/utils/tailwind";

interface ProductBadgeProps {
  label: string;
  className?: string;
}

export function ProductBadge({
  label,
  className,
}: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "product-badge",
        label.toLowerCase() === "bestseller"
          ? "bg-brand-700 text-brand-400"
          : "bg-brand-900 text-brand-50",
        className
      )}
    >
      {label}
    </span>
  );
}
