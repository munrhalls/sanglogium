import type { CatalogueNavItem } from "./catalogueNavTypes";

export function transformCatalogueJson(rawData: { catalogue: CatalogueNavItem[] }): CatalogueNavItem[] {
  // The data is already in the correct format from getCatalogueForNavigation()
  // No transformation needed - just return the catalogue array
  return rawData.catalogue;
}
