import type { CatalogueNavItem } from "./catalogue-nav.types";

export function transformCatalogueJson(rawData: { catalogue: any[] }): CatalogueNavItem[] {
  return rawData.catalogue.map((item: any) => ({
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
}
