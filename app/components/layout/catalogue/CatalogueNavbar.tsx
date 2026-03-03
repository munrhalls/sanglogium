import React from "react";
import { CatalogueWrapper } from "./CatalogueWrapper";
import { CatalogueView } from "./CatalogueView";
import { CATALOGUE_DATA } from "./data";
import { cn } from "@/lib/utils/tailwind";

const CatalogueNavbar = async () => {
  return (
    <nav
      className={cn(
        "lg-desktop:h-[var(--desktop-catalogue-nav-h)] hidden w-full shrink-0 items-center bg-brand-900 lg:flex"
      )}
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        {CATALOGUE_DATA.map((item) => (
          <CatalogueWrapper key={item.id} label={item.label}>
            <CatalogueView data={item} />
          </CatalogueWrapper>
        ))}
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
