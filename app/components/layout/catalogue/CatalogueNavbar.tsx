import React from "react";
import { CatalogueView } from "./CatalogueView";
import NavbarManager from "./NavbarManager";
import catalogueDataRaw from "./catalogue.json";
import type { CatalogueNavItem } from "./catalogue-nav.types";
import { cn } from "@/lib/utils/tailwind";

const CatalogueNavbar = async () => {
  // Transform catalogue.json to match original CatalogueNavItem interface
  const catalogueData: CatalogueNavItem[] = catalogueDataRaw.catalogue.map((item: any) => ({
    id: item.slug?.current || item.title.toLowerCase().replace(/\s+/g, '-'),
    label: item.title,
    imageUrl: `/images/${item.icon}-skeletal.png`,
    sections: (item.children || []).map((child: any) => ({
      title: child.title,
      links: (child.children || []).map((link: any) => link.title)
    })),
    feature: {
      caption: "Pure Resonance"
    }
  }));

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
