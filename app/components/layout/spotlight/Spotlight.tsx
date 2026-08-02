import { cn } from "@/lib/utils/tailwind";

interface SpotlightProps {
  children: React.ReactNode;
  isReversed?: boolean;
  className?: string;
}

export default function Spotlight({ children, isReversed, className }: SpotlightProps) {
  return (
    <section className={cn("w-full py-16 lg:py-20", className)}>
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-12 gap-8 items-center",
        isReversed && "lg:direction-rtl"
      )}>
        {/* The component assumes two children: one for Content, one for Image */}
        {children}
      </div>
    </section>
  );
}
