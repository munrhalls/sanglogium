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
        "w-full py-20 md:py-36",
        className
      )}
    >
      {children}
    </section>
  );
}