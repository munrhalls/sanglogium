import { cn } from "@/lib/utils/tailwind";
import { ReactNode } from "react";

interface ShelfProps {
  children: ReactNode;
  variant?: "default" | "platinum";
  fullBleed?: boolean;
  className?: string;
}

export default function Shelf({ children, variant = "default", fullBleed = false, className }: ShelfProps) {

  return (
    <section className={cn("w-full py-20", className)}>
      <div className={cn("mx-auto", fullBleed ? "w-full" : "max-w-content")}>
        {children}
      </div>
    </section>
  );
}
