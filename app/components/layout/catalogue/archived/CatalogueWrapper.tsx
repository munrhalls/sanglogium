import { getCatalogue } from "@/data/catalogue";

import CatalogueNav from "./CatalogueNav";

export default async function CatalogueWrapper() {
  const catalogue = getCatalogue();
  if (!catalogue || catalogue.length === 0) {
    console.error("Catalogue is empty or undefined");
    return null;
  }

  return <CatalogueNav catalogue={catalogue} />;
}
