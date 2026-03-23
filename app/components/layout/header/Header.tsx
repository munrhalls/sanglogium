import { cn } from "@/lib/utils/tailwind";
import BrandLogo from "./BrandLogo";
import Searchbar from "./Searchbar";
import NavbarActionsServer from "./NavbarActionsServer";
import NavbarActionsSkeleton from "./NavbarActionsSkeleton";
import { Suspense } from "react";

export default function Header() {
  return (
    <header
      className={cn(
        "sticky left-0 right-0 top-0 z-50",
        "flex h-[var(--mobile-header-h)] shrink-0 items-center justify-around gap-4 lg:h-[var(--desktop-header-h)]",
        "bg-brand-900 text-cap"
      )}
    >
      <BrandLogo />
      <Searchbar />
      <Suspense fallback={<NavbarActionsSkeleton />}>
        <NavbarActionsServer />
      </Suspense>
    </header>
  );
}
