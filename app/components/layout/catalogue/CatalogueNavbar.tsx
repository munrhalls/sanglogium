import React from "react";
import { CatalogueWrapper } from "./CatalogueWrapper";
import { CatalogueMenu } from "./CatalogueMenu";
import { CATALOGUE_DATA } from "./data";

const CatalogueNavbar = async () => {
  return (
    <nav
      className="hidden w-full shrink-0 items-center bg-brand-800 md:flex md:h-[var(--catalogue-nav-h)]"
      aria-label="Catalogue Navigation"
    >
      <div className="container mx-auto flex h-full items-center justify-center">
        {CATALOGUE_DATA.map((item) => (
          <CatalogueWrapper key={item.id} label={item.label}>
            <CatalogueMenu data={item} />
          </CatalogueWrapper>
        ))}
      </div>
    </nav>
  );
};

export default CatalogueNavbar;
