import React from "react";
import { CatalogueView } from "./CatalogueView";
import NavbarManager from "./NavbarManager";
import { transformCatalogueJson } from "./catalogue-nav.utils";
import type { CatalogueNavItem } from "./catalogue-nav.types";
import { cn } from "@/lib/utils/tailwind";

interface CatalogueNavbarProps {
  catalogueDataRaw: { catalogue: CatalogueNavItem[] };
}

const CatalogueNavbar = async ({ catalogueDataRaw }: CatalogueNavbarProps) => {
  const catalogueData: CatalogueNavItem[] = transformCatalogueJson(catalogueDataRaw);

  const navLinks = catalogueData.map((item) => ({
    id: item.id,
    label: item.label,
  }));

  return (
    <nav
      className={cn(
        "hidden w-full shrink-0 items-center bg-brand-900 lg:flex lg-desktop:h-[var(--desktop-catalogue-nav-h)]"
      )}
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        <NavbarManager navLinks={navLinks}>
          {catalogueData.map((item) => (
            <CatalogueView key={item.id} data={item} />
          ))}
        </NavbarManager>
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
