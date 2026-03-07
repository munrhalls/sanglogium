import { cn } from "@/lib/utils/tailwind";

interface ShelfProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Shelf({ children, className, id }: ShelfProps) {
  return (
    <section
      id={id}
      className={cn(
        "w-full",
        "py-20", 
        "px-6 md:px-12",
        className
      )}
    >
      {children}
    </section>
  );
}
