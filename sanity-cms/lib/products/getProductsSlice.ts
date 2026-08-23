import { sanityFetch } from '@/sanity-cms/lib/client';
import { groq } from 'next-sanity';
import { FilterBuilder } from './FilterBuilder';
import { buildOrderClause } from '@/lib/catalogue/sortParams';

/**
 * Exactly the fields ProductCard renders — nothing more.
 * Kept narrow on purpose: the grid's row queries are the hot path, so anything
 * added here is paid for on every row of every catalogue page. The wider
 * `Product` type still serves callers that genuinely need stock/catalogue data.
 */
export interface ProductCardData {
  _id: string;
  name: string;
  brand: { name: string } | null;
  price_data: { currency: string; unit_amount: number };
  image: any;
  slug: { current: string };
}

// Streaming blueprint constants.
export const ROW_SIZE = 8;
export const PER_PAGE = 24;

export interface GetProductsCountOptions {
  keys: string[];
  filters?: string[];
}

export interface GetProductsSliceOptions {
  keys: string[];
  sort?: string;
  filters?: string[];
  offset: number;
  limit: number;
}

export async function getProductsCount({ keys, filters = [] }: GetProductsCountOptions): Promise<number> {
  if (!keys.length) return 0;
  // `filterClause` is built entirely from FilterBuilder's sanitized/allow-listed
  // output — raw URL input never reaches GROQ.
  const filterClause = FilterBuilder.buildClause(filters);
  const countQuery = groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}])`;
  try {
    return (await sanityFetch<number>({ query: countQuery, params: { keys } })) ?? 0;
  } catch (error) {
    console.error('[getProductsCount] Failed:', error);
    return 0;
  }
}

export async function getProductsSlice({ keys, sort = 'featured', filters = [], offset, limit }: GetProductsSliceOptions): Promise<ProductCardData[]> {
  if (!keys.length) return [];
  // Both clauses come from allow-listed builders (buildOrderClause resolves via
  // the SORT_OPTIONS allowlist; FilterBuilder sanitizes every value), so no raw
  // searchParams value is ever interpolated into the query text.
  const filterClause = FilterBuilder.buildClause(filters);
  const orderClause = buildOrderClause(sort);
  // Order must be applied BEFORE the slice, or the window is taken from an
  // unordered set. EXCLUSIVE slice: two dots -> exactly `limit` items.
  const productsQuery = groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] ${orderClause} [${offset}..${offset + limit}] {
    _id,
    name,
    brand->{ name },
    price_data,
    image {
      asset {
        _ref
      }
    },
    slug {
      current
    }
  }`;
  try {
    return (await sanityFetch<ProductCardData[]>({ query: productsQuery, params: { keys } })) ?? [];
  } catch (error) {
    console.error('[getProductsSlice] Failed:', error);
    return [];
  }
}
