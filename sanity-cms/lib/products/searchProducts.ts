'use server';

import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { ROOT_CATEGORIES, deriveSpacedQuery, normalizeText, rootCategoriesOf, scoreProduct } from '@/sanity-cms/lib/products/searchScoring';
import type { RootCategory } from '@/sanity-cms/lib/products/searchScoring';
import { computeCatalogueFacets, productMatchesState } from '@/sanity-cms/lib/products/getFilterFacets';
import type { CatalogueFacets, RawProduct } from '@/sanity-cms/lib/products/getFilterFacets';
import { sanitizeFilterState, type ProductQueryState, type PriceRangeData } from '@/features/product-filtering';

const MAX_AUTOCOMPLETE = 6;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_PER_PAGE = 24;

export interface AutocompleteProduct {
  _id: string;
  name: string;
  sku?: string;
  brand: { _id: string; name: string; slug: string } | null;
  price_data: { currency: string; unit_amount: number };
  slug: { current: string };
  image: any;
  catalogueLocationKeys?: string[];
  availableStock?: number;
}

export interface SearchProduct {
  _id: string;
  name: string;
  sku?: string;
  brand: { _id: string; name: string; slug?: { current: string } } | null;
  price_data: { currency: string; unit_amount: number };
  stock: number;
  reservedStock: number;
  availableStock: number;
  slug: { current: string };
  image: any;
  catalogueLocationKeys: string[];
  filterAttributes?: Record<string, unknown>;
  brandRef?: { name: string; slug: string } | null;
  price?: number;
}

export interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
  /** Products matching the words alone, before any filter is applied. */
  unfilteredCount: number;
  facets?: CatalogueFacets;
  priceRange?: PriceRangeData;
  /** The filter state actually applied (junk brand values dropped). */
  state?: ProductQueryState;
  /** Root category the results are narrowed to, when a valid one was requested. */
  category?: RootCategory;
  /** Per-category counts under the active filters (ignoring the category itself). */
  categoryCounts?: { id: RootCategory; label: string; count: number }[];
  /** Products matching the active filters across all categories. */
  allCategoriesCount?: number;
}

const MAX_SORT_WINDOW = 2000;

// One GROQ predicate for suggestions and results, so both see the same matched
// set. The suggestions score ALL of it (not just the first N by _id), which is
// what keeps the popup's top rows equal to the results page's top rows.
const SEARCH_MATCH = groq`_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0 && (
        name match $query ||
        name match $spacedQuery ||
        sku match $query ||
        brand._ref in *[_type == "brand" && (name match $query || name match $spacedQuery)]._id ||
        specifications[].value match $query ||
        specifications[].value match $spacedQuery ||
        overviewFields[].value match $query ||
        overviewFields[].value match $spacedQuery
      )`;

export async function searchProductsAutocomplete(query: string): Promise<AutocompleteProduct[]> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return [];
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  try {
    const candidates = await sanityFetch<AutocompleteProduct[]>({
      query: groq`*[${SEARCH_MATCH}] {
        _id,
        name,
        sku,
        catalogueLocationKeys,
        price_data,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        "availableStock": stock - reservedStock
      } | order(_id asc) [0...${MAX_SORT_WINDOW}]`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    return (candidates ?? [])
      .map((product) => ({ product, score: scoreProduct(product, rawQuery) }))
      .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
      .slice(0, MAX_AUTOCOMPLETE)
      .map(({ product }) => product);
  } catch (error) {
    console.error(`[searchProductsAutocomplete] Failed for query "${query}":`, error);
    return [];
  }
}

export async function searchProductsFull(
  query: string,
  sort?: string,
  page: number = 1,
  perPage: number = DEFAULT_PER_PAGE,
  state?: ProductQueryState,
  category?: string
): Promise<SearchResult> {
  if (!query || query.trim().length < MIN_QUERY_LENGTH || normalizeText(query).length < MIN_QUERY_LENGTH) {
    return { products: [], totalCount: 0, unfilteredCount: 0 };
  }

  const rawQuery = query.trim();
  const searchTerm = `${rawQuery}*`;
  const spacedTerm = `${deriveSpacedQuery(rawQuery)}*`;

  const safePage = Math.max(1, Math.floor(page) || 1);
  const effectivePerPage = Math.max(1, Math.floor(perPage) || DEFAULT_PER_PAGE);

  const filterClause = SEARCH_MATCH;

  try {
    const countResult = await sanityFetch<number>({
      query: groq`count(*[${filterClause}])`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    const unfilteredCount = countResult ?? 0;
    if (unfilteredCount === 0) {
      return { products: [], totalCount: 0, unfilteredCount: 0 };
    }

    const sortWindow = Math.min(unfilteredCount, MAX_SORT_WINDOW);
    const matchedProducts = await sanityFetch<SearchProduct[]>({
      query: groq`*[${filterClause}] {
        _id,
        name,
        sku,
        price_data,
        stock,
        reservedStock,
        "availableStock": stock - reservedStock,
        "brand": brand->{ _id, name, slug },
        slug,
        image,
        catalogueLocationKeys,
        filterAttributes,
        "brandRef": brand->{ name, "slug": slug.current },
        "price": price_data.unit_amount
      } | order(_id asc) [0...${sortWindow}]`,
      params: { query: searchTerm, spacedQuery: spacedTerm },
    });

    const matched = matchedProducts ?? [];

    // Filters: counts, price range and the filtered list all come from this one
    // matched set, so the sidebar's counts can never disagree with the results.
    let facets: CatalogueFacets | undefined;
    let priceRange: PriceRangeData | undefined;
    let appliedState: ProductQueryState | undefined;
    let filtered = matched;
    let categoryCounts: SearchResult['categoryCounts'];
    let allCategoriesCount: number | undefined;
    const activeCategory = ROOT_CATEGORIES.find((c) => c.id === category)?.id;
    // Category narrowing scopes the counts, price range and list; the category
    // chips themselves are counted below over the un-narrowed set.
    const scoped = activeCategory
      ? matched.filter((p) => rootCategoriesOf(p.catalogueLocationKeys).includes(activeCategory))
      : matched;
    if (state) {
      facets = computeCatalogueFacets(scoped as unknown as RawProduct[], state);
      appliedState = sanitizeFilterState(state, { brand: Object.keys(facets.brandLabels) });
      const activeState = appliedState;
      filtered = scoped.filter((p) => productMatchesState(p as unknown as RawProduct, activeState));
      const acrossCategories = matched.filter((p) =>
        productMatchesState(p as unknown as RawProduct, activeState)
      );
      allCategoriesCount = acrossCategories.length;
      categoryCounts = ROOT_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        count: acrossCategories.filter((p) => rootCategoriesOf(p.catalogueLocationKeys).includes(c.id))
          .length,
      }));
      const prices = scoped
        .map((p) => p.price_data?.unit_amount)
        .filter((n): n is number => Number.isFinite(n));
      priceRange = {
        minPrice: prices.length ? Math.min(...prices) : null,
        maxPrice: prices.length ? Math.max(...prices) : null,
        prices,
      };
    }
    const resultCount = state ? filtered.length : unfilteredCount;

    const byRelevance = (a: SearchProduct, b: SearchProduct) => {
      const scoreA = scoreProduct(a, rawQuery);
      const scoreB = scoreProduct(b, rawQuery);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    };

    const comparator =
      sort === 'price-asc'
        ? (a: SearchProduct, b: SearchProduct) =>
            a.price_data.unit_amount - b.price_data.unit_amount || byRelevance(a, b)
        : sort === 'price-desc'
          ? (a: SearchProduct, b: SearchProduct) =>
              b.price_data.unit_amount - a.price_data.unit_amount || byRelevance(a, b)
          : sort === 'alpha-asc'
            ? (a: SearchProduct, b: SearchProduct) =>
                a.name.localeCompare(b.name) || byRelevance(a, b)
            : byRelevance;

    const products = filtered.slice().sort(comparator);

    const totalPages = Math.max(1, Math.ceil(resultCount / effectivePerPage));
    const effectivePage = Math.min(safePage, totalPages);
    const offset = (effectivePage - 1) * effectivePerPage;

    // Strip the filter-only fields so they never reach the client grid.
    const pageProducts = products
      .slice(offset, offset + effectivePerPage)
      .map(({ filterAttributes, brandRef, price, ...product }) => product);

    return {
      products: pageProducts,
      totalCount: resultCount,
      unfilteredCount,
      facets,
      priceRange,
      state: appliedState,
      category: activeCategory,
      categoryCounts,
      allCategoriesCount,
    };
  } catch (error) {
    console.error(`[searchProductsFull] Failed for query "${query}", sort "${sort}", page ${page}:`, error);
    return { products: [], totalCount: 0, unfilteredCount: 0 };
  }
}
