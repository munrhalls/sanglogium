import React from "react";
import { CatalogueWrapper } from "./CatalogueWrapper";
import { CatalogueMenu } from "./CatalogueMenu";
import { CATALOGUE_DATA } from "./data";

const CatalogueNavbar = () => {
  return (
    <nav
      className="hidden h-[var(--catalogue-nav-h)] w-full shrink-0 items-center bg-brand-800 md:flex"
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        {CATALOGUE_DATA.map((item) => (
          <CatalogueWrapper key={item.id} label={item.label}>
            {/* The Server Component (or static data component) passed as a child */}
            <CatalogueMenu data={item} />
          </CatalogueWrapper>
        ))}
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
