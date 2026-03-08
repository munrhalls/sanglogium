import { cn } from "@/lib/utils/tailwind";

interface ShelfProps {
  children: React.ReactNode;
  className?: string;
  variant?: "platinum" | "dark" | "gold"; 
}

export default function Shelf({ children, className, variant = "dark" }: ShelfProps) {
  const variants = {
    platinum: "bg-secondary-200 text-brand-900",
    dark: "bg-brand-900 text-brand-100",
    gold: "bg-brand-900 text-accent-500",
  };

  return (
    <section className={cn("w-full py-16 md:py-24 px-4 md:px-8", variants[variant], className)}>
      <div className={cn(
        "mx-auto p-8 md:p-16",
        variant === "platinum" ? "bg-secondary-50 shadow-sm rounded-sm" : ""
      )}>
        {children}
      </div>
    </section>
  );
}
