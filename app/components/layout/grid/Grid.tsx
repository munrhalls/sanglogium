import { cn } from "@/lib/utils/tailwind";

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

export default function Grid({ children, className }: GridProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8",
      className
    )}>
      {children}
    </div>
  );
}
