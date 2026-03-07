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

        "py-20 md:py-36 landscape:py-10 md:landscape:py-36",

        "px-6 md:px-12",
        "outline-1 outline-dashed outline-white/20 -outline-offset-1",
        className
      )}
    >
      {children}
    </section>
  );
}