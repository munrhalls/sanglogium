import type { RouteMapData } from '@/features/product-filtering/core/types/optionMaps';
import { PUBLISHED, toOptionMapData } from './optionMapData';

/** How a product's brand is read in a query: the brand's name, through its reference. */
export const BRAND_NAME = 'brand->name';

/**
 * The shop's one read for a route's controls: the picklist document, the curated label rows and the published products whose catalogue keys meet `$keys` (the route's VFS key set).
 * The picklist is read whole, so its sort lists come with it. A product carries only what the maps and the sorts read: the brand as its name, its name, the price, the stock, and the picks in filterAttributes.
 * A plain module (no server-only) so the live proof runs the same query.
 */
export const ROUTE_MAP_QUERY = `{
  "picklist": *[_id == "filterPicklist"][0],
  "rows": *[_id == "filterLabels"][0].labels,
  "products": *[_type == "product" && ${PUBLISHED} && count(catalogueLocationKeys[@ in $keys]) > 0]{ "brand": ${BRAND_NAME}, name, price_data, stock, filterAttributes }
}`;

/** The result of ROUTE_MAP_QUERY as the use case's input. The picklist part is read by the same mapper as the Studio list. A missing document or list means empty lists; rows that are not a list mean no rows. */
export function toRouteMapData(result: any): RouteMapData {
  const { items: _items, ...maps } = toOptionMapData(result);
  return { ...maps, rows: Array.isArray(result?.rows) ? result.rows : [] };
}
