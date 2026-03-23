import { cn } from "@/lib/utils/tailwind";

export default function NavbarActionsSkeleton() {
  return (
    <div className={cn("ml-6 hidden items-center gap-6", "lg:flex")}>
      <div className="h-6 w-6 rounded bg-brand-800/40 animate-pulse" />
      <div className="h-6 w-6 rounded bg-brand-800/40 animate-pulse" />
    </div>
  );
}
