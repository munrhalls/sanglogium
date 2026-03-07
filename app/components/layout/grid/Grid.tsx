import { cn } from "@/lib/utils/tailwind";

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 2 | 3 | 4; // Define common patterns
}

export default function Grid({ children, className, cols = 4 }: GridProps) {
  const columnMap = {
    2: "grid-cols-2 lg:grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  return (
    <div className={cn(
      "grid gap-4 md:gap-8 lg:gap-12",
      columnMap[cols],
      className
    )}>
      {children}
    </div>
  );
}