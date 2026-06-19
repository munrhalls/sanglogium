import { cn } from "@/lib/utils/tailwind";
import { ReactNode } from "react";

interface ShelfProps {
  children: ReactNode;
  variant?: "default" | "platinum";
  fullBleed?: boolean;
  className?: string;
  'data-testid'?: string;
}

export default function Shelf({ children, variant = "default", fullBleed = false, className, 'data-testid': dataTestId }: ShelfProps) {

  return (
    <section className={cn("w-full", className)} data-testid={dataTestId}>
      <div className={cn("mx-auto", fullBleed ? "w-full" : "max-w-content px-6 lg:px-8")}>
        {children}
      </div>
    </section>
  );
}
