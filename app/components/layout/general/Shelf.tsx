import { cn } from "@/lib/utils/tailwind";
import { ReactNode } from "react";

interface ShelfProps {
  children: ReactNode;
  variant?: "default" | "platinum";
  fullBleed?: boolean;
  className?: string;
  /** Simple Optimal Spacing System — vertical rhythm between homepage sections.
   *  Ratio is ~1:2:3 (tight:default:loose) at every breakpoint. */
  spacing?: "none" | "tight" | "default" | "loose";
  'data-testid'?: string;
}

const SPACING = {
  none: "",
  tight: "py-4 md:py-6 lg:py-3 lg-touch:py-3",
  default: "py-8 md:py-12 lg:py-6 lg-touch:py-6",
  loose: "py-12 md:py-16 lg:py-10 lg-touch:py-10",
} as const;

export default function Shelf({ children, variant = "default", fullBleed = false, spacing = "default", className, 'data-testid': dataTestId }: ShelfProps) {

  return (
    <section className={cn("w-full", SPACING[spacing], className)} data-testid={dataTestId}>
      <div className={cn("mx-auto", fullBleed ? "w-full" : "max-w-content px-6 lg:px-8")}>
        {children}
      </div>
    </section>
  );
}
