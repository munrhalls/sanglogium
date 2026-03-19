import React from "react";
import { CatalogueView } from "./CatalogueView";
import NavbarManager from "./NavbarManager";
import { CATALOGUE_DATA } from "./data";
import { cn } from "@/lib/utils/tailwind";

const navLinks = CATALOGUE_DATA.map((item) => ({
  id: item.id,
  label: item.label,
}));

const CatalogueNavbar = async () => {
  return (
    <nav
      className={cn(
        "hidden w-full shrink-0 items-center bg-brand-900 lg:flex lg-desktop:h-[var(--desktop-catalogue-nav-h)]"
      )}
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        <NavbarManager navLinks={navLinks}>
          {CATALOGUE_DATA.map((item) => (
            <CatalogueView key={item.id} data={item} />
          ))}
        </NavbarManager>
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
