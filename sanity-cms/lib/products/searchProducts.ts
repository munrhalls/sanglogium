import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';

const MAX_AUTOCOMPLETE = 6;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
}

export interface SearchProduct {
  _id: string;
  name: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
}

export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
}

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const searchTerm = `${query.trim()}*`;

  try {
    return await sanityFetch<AutocompleteProduct[]>({
      query: groq`*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
        name match $query ||
        sku match $query ||
        brand._ref in *[_type == "brand" && name match $query]._id ||
        specifications[].value match $query ||
        overviewFields[].value match $query
      )] {
        _id,
        name,
        price_data,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        "score": select(
          name match $query => 20,
          brand->name match $query => 15,
          10
        )
      } | order(score desc, name asc) [0...${MAX_AUTOCOMPLETE}]`,
      params: { query: searchTerm },
    });
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}

export async function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE
): Promise<SearchResult> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return { products: [], totalCount: 0 };
  }

  const searchTerm = `${query.trim()}*`;
  const offset = (page - 1) * perPage;

  // Build sort clause
  let orderClause = 'name asc';
  if (sort) {
    const [field, dir] = sort.split(':');
    if (['name', 'unit_amount'].includes(field) && ['asc', 'desc'].includes(dir)) {
      orderClause = `${field} ${dir}`;
    }
  }

  const filterClause = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
    name match $query ||
    sku match $query ||
    brand._ref in *[_type == "brand" && name match $query]._id ||
    specifications[].value match $query ||
    overviewFields[].value match $query
  )`;

  try {
    // Fetch total count and paginated results in parallel
    const [totalCount, products] = await Promise.all([
      sanityFetch<number>({
        query: groq`count(*[${filterClause}])`,
        params: { query: searchTerm },
      }),
      sanityFetch<SearchProduct[]>({
        query: groq`*[${filterClause}] {
          _id,
          name,
          price_data,
          stock,
          reservedStock,
          "availableStock": stock - reservedStock,
          "brand": brand->{ _id, name, slug },
          slug,
          image,
          "score": select(
            name match $query => 20,
            brand->name match $query => 15,
            10
          )
        } | order(score desc, ${orderClause}) [${offset}...${offset + perPage}]`,
        params: { query: searchTerm },
      }),
    ]);

    return { products, totalCount };
  } catch (error) {
    console.error(`[searchProductsFull] Failed for query "${query}", sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0 };
  }
}
