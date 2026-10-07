// purely homepage implementation - functionality awaiting for post-homepage products discovery ui development

import { cn } from "@/platform/utils/tailwind";
import BrandLogo from "@/features/shell/ui/header/BrandLogo";
import SearchField from "@/features/shell/ui/header/SearchField";
import NavbarActions from "@/features/shell/ui/header/NavbarActions";
import { Suspense } from "react";

export default function Header({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header
      className={cn(
        "sticky left-0 right-0 top-0 z-50",
        // Phones: logo + a flexible search bar edge to edge. sm and up: logo,
        // search field centred in the remaining space, actions on the right.
        "flex h-[var(--mobile-header-h)] shrink-0 items-center gap-3 px-3 sm:gap-6 sm:px-6 lg:h-[var(--desktop-header-h)]",
        "bg-brand-900 text-cap"
      )}
    >
      <BrandLogo />
      <Suspense>
        <SearchField />
      </Suspense>
      {/* Cart count: hardcode 0 for now — cart state is managed client-side via Zustand */}
      <NavbarActions isAuthenticated={isAuthenticated} cartCount={0} />
    </header>
  );
}
