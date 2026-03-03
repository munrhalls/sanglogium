import React from "react";
import { CatalogueWrapper } from "./CatalogueWrapper";
import { CatalogueMenu } from "./CatalogueMenu";
import { CATALOGUE_DATA } from "./data";
import { cn } from "@/lib/utils/tailwind";

const CatalogueNavbar = async () => {
  return (
    <nav
      className={cn(
        "hidden w-full shrink-0 items-center bg-brand-900 lg:flex lg:h-[var(--desktop-catalogue-nav-h)]"
      )}
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        {CATALOGUE_DATA.map((item, index) => (
          <CatalogueWrapper key={item.id} label={item.label}>
            <CatalogueMenu data={item} index={index} />
          </CatalogueWrapper>
        ))}
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
