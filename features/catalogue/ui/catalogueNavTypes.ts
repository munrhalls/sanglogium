import type { NavigationItem } from "../domain/catalogue";

export type CatalogueNavItem = NavigationItem;

export interface NavbarManagerProps {
  navLinks: { id: string; label: string }[];
  children: React.ReactNode[];
}
