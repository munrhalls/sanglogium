import { cn } from "@/lib/utils/tailwind";
import { ReactNode } from "react";

interface ShelfProps {
  children: ReactNode;
  variant?: "default" | "platinum";
  fullBleed?: boolean;
  className?: string;
}

export default function Shelf({ children, variant = "default", fullBleed = false, className }: ShelfProps) {
  const variants = {
    default: "bg-transparent",
    platinum: "bg-secondary-50 shadow-inner-soft",
  };

  return (
    <section className={cn("w-full py-20", variants[variant], className)}>
      <div className={cn("mx-auto", fullBleed ? "w-full" : "max-w-[1280px]")}>
        {children}
      </div>
    </section>
  );
}
