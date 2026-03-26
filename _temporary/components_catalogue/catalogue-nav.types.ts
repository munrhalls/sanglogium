export interface CatalogueNavItem {
  id: string;
  label: string;
  imageUrl: string;
  sections: { title: string; links: string[] }[];
  feature: { caption: string };
}
