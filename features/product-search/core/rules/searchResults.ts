import { scoreProduct, ROOT_CATEGORIES, rootCategoriesOf } from './searchScoring';
import type { CategoryLookup } from '@/features/catalogue';
import type { FilterPanelData } from '@/features/product-filtering';
import type { AutocompleteProduct, FeatureProduct, SearchProduct, SearchResult } from '@/features/product-search/core/types/searchTypes';

const MAX_AUTOCOMPLETE = 6;

export function rankAutocomplete(
  candidates: AutocompleteProduct[],
  rawQuery: string,
  lookup: CategoryLookup
): AutocompleteProduct[] {
  return (candidates ?? [])
    .map((product) => ({ product, score: scoreProduct(product, rawQuery, lookup) }))
    .sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name))
    .slice(0, MAX_AUTOCOMPLETE)
    .map(({ product }) => product);
}

export function scopeToCategory(input: {
  matched: SearchProduct[];
  category?: string;
  lookup: CategoryLookup;
}): { category: SearchResult['category']; scoped: SearchProduct[] } {
  const { matched, category, lookup } = input;
  const activeCategory = ROOT_CATEGORIES.find((c) => c.id === category)?.id;
  const scoped = activeCategory
    ? matched.filter((p) => rootCategoriesOf(p.catalogueLocationKeys, lookup).includes(activeCategory))
    : matched;
  return { category: activeCategory, scoped };
}

export function toFeatureProducts(scoped: SearchProduct[]): FeatureProduct[] {
  return scoped.map((p) => ({
    brand: p.brand?.name ?? null,
    name: p.name,
    price_data: p.price_data,
    stock: p.stock,
    filterAttributes: p.filterAttributes,
  }));
}

export function buildSearchResult(input: {
  matched: SearchProduct[];
  scoped: SearchProduct[];
  category: SearchResult['category'];
  narrowedIds: string[];
  filter?: FilterPanelData;
  unfilteredCount: number;
  rawQuery: string;
  sort?: string;
  page: number;
  perPage: number;
  lookup: CategoryLookup;
}): SearchResult {
  const {
    matched,
    scoped,
    category,
    narrowedIds,
    filter,
    unfilteredCount,
    rawQuery,
    sort,
    page: safePage,
    perPage: effectivePerPage,
    lookup,
  } = input;

  const narrowed = new Set(narrowedIds);
  const inWindow = matched.filter((p) => narrowed.has(p._id));
  const filtered = scoped.filter((p) => narrowed.has(p._id));
  const allCategoriesCount = inWindow.length;
  const categoryCounts = ROOT_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    count: inWindow.filter((p) =>
      rootCategoriesOf(p.catalogueLocationKeys, lookup).includes(c.id)
    ).length,
  }));
  const totalCount = filtered.length;

  const byRelevance = (a: SearchProduct, b: SearchProduct) => {
    const scoreA = scoreProduct(a, rawQuery, lookup);
    const scoreB = scoreProduct(b, rawQuery, lookup);
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

  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePerPage));
  const effectivePage = Math.min(safePage, totalPages);
  const offset = (effectivePage - 1) * effectivePerPage;

  // Strip the filter-only fields so they never reach the client grid.
  const pageProducts = products
    .slice(offset, offset + effectivePerPage)
    .map(({ filterAttributes, brandRef, price, ...product }) => product);

  return {
    products: pageProducts,
    totalCount,
    unfilteredCount,
    filter,
    category,
    categoryCounts,
    allCategoriesCount,
  };
}
