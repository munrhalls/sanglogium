import type { OptionMapData } from '@/features/product-filtering/core/types/optionMaps';

const PUBLISHED = '!(_id in path("drafts.**")) && !(_id in path("versions.**"))';

/**
 * One read of what the option maps are computed from: the picklist document, the catalogue items and the published products.
 * The brand is read as its name: that is the value a shopper picks. A plain module (no server-only) so the live proof runs the same query.
 */
export const OPTION_MAP_QUERY = `{
  "picklist": *[_id == "filterPicklist"][0],
  "items": *[_type == "catalogueItem" && ${PUBLISHED}]{ _id, "slug": slug.current, "parent": parent._ref },
  "products": *[_type == "product" && ${PUBLISHED}]{ _id, "brand": brand->name, price_data, stock, filterAttributes, catalogueLocationKeys }
}`;

const strings = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []);

/** The result of OPTION_MAP_QUERY as the maps' input. The picklist document keeps its lists under camelCase names; the slices are the category slugs, and the list `allProducts` is the scope 'all-products' (the /products page; empty until the owner fills it). A missing document means no controls. */
export function toOptionMapData(result: any): OptionMapData {
  const doc = result?.picklist;
  return {
    alwaysOn: strings(doc?.alwaysOn),
    picks: {
      headphones: strings(doc?.headphones),
      'audio-electronics': strings(doc?.audioElectronics),
      accessories: strings(doc?.accessories),
      'all-products': strings(doc?.allProducts),
    },
    items: result?.items ?? [],
    products: result?.products ?? [],
  };
}
