import { scoreProduct, ROOT_CATEGORIES, rootCategoriesOf } from './searchScoring';
import { computeCatalogueFacets, productMatchesState, sanitizeFilterState } from '@/features/product-filtering/domain';
import type { AutocompleteProduct, SearchProduct, SearchResult } from './searchTypes';
import type {
  CatalogueFacets,
  ProductQueryState,
  PriceRangeData,
  RawProduct,
} from '@/features/product-filtering';

const MAX_AUTOCOMPLETE = 6;

export function rankAutocomplete(
  candidates: AutocompleteProduct[],
  rawQuery: string
): AutocompleteProduct[] {
  return (candidates ?? [])
    .map((product) => ({ product, score: scoreProduct(product, rawQuery) }))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, MAX_AUTOCOMPLETE)
    .map(({ product }) => product);
}

export function buildSearchResult(input: {
  matched: SearchProduct[];
  unfilteredCount: number;
  rawQuery: string;
  sort?: string;
  page: number;
  perPage: number;
  state?: ProductQueryState;
  category?: string;
}): SearchResult {
  const {
    matched,
    unfilteredCount,
    rawQuery,
    sort,
    page: safePage,
    perPage: effectivePerPage,
    state,
    category,
  } = input;

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
}
