import type { NavigationItem } from "@/features/catalogue";

export type CatalogueNavItem = NavigationItem;

export interface NavbarManagerProps {
  navLinks: { id: string; label: string }[];
  children: React.ReactNode[];
}
