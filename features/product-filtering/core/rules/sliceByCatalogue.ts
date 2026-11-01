import type { CatalogueNode } from '@/features/product-filtering/core/types/optionMaps';

/** The products at the catalogue root with this slug, or anywhere below it. A slice has exactly one root. */
export function sliceByCatalogue<P extends { catalogueLocationKeys?: string[] }>(items: CatalogueNode[], products: P[], slug: string): P[] {
  const roots = items.filter((i) => i.slug === slug && !i.parent);
  if (roots.length !== 1) throw new Error(`catalogue root "${slug}": found ${roots.length}, wanted 1`);
  const ids = new Set([roots[0]._id]);
  for (let grew = true; grew; ) {
    grew = false;
    for (const i of items) if (i.parent && ids.has(i.parent) && !ids.has(i._id)) { ids.add(i._id); grew = true; }
  }
  return products.filter((p) => (p.catalogueLocationKeys ?? []).some((k) => ids.has(k)));
}
