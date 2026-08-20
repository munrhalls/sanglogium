import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { cache } from 'react';
import { FilterBuilder } from '@/sanity-cms/lib/products/FilterBuilder';

// React cache for Server Components
const withCache = <T extends (...args: any[]) => any>(fn: T): T => {
  try {
    return cache(fn);
  } catch {
    return fn;
  }
};

export interface FilterOption {
  value: string;
  label: string;
  /** Result count for this option within the current (active-filtered) category set. */
  count?: number;
}

export interface FilterGroup {
  field: string;
  label: string;
  options: FilterOption[];
}

export interface FilterResult {
  filters: FilterGroup[];
  priceRange: {
    minPrice: number | null;
    maxPrice: number | null;
  };
  maxStock: number | null;
}

/** Compact per-product facet data used to derive option counts and brand lists. */
interface FacetDataProduct {
  brandName: string | null;
  overviewFields: Array<{ title: string | null; value: string | null }> | null;
  specifications: Array<{ title: string | null; value: string | null }> | null;
}

/**
 * Count products matching each `field:value` pair (per-product deduped).
 * Brand keys are lowercased to match FilterBuilder's case-insensitive brand clause.
 */
function computeFilterCounts(products: FacetDataProduct[] | null): Map<string, number> {
  const counts = new Map<string, number>();
  for (const product of products ?? []) {
    const seen = new Set<string>();
    const add = (field: string | null, value: string | null) => {
      if (!field || !value) return;
      const key = `${field}:${value}`;
      if (seen.has(key)) return;
      seen.add(key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    };
    if (product.brandName) add('brand', product.brandName.toLowerCase());
    for (const f of product.overviewFields ?? []) add(f.title, f.value);
    for (const f of product.specifications ?? []) add(f.title, f.value);
  }
  return counts;
}

const getValidFilterFieldsFn = async (catalogueKeys: string[]): Promise<Set<string>> => {
  // Built-in slider fields are always valid (mirrors BUILT_IN_FILTER_FIELDS in
  // lib/catalogue/filterUtils.ts), and brand is always valid because the facet
  // layer derives a brand group even without a CMS brand filter item.
  const valid = new Set(['priceRange', 'stockMin', 'brand']);

  if (!catalogueKeys.length) return valid;

  try {
    const doc = await sanityFetch<{
      filterItems: Array<{ field: string | null; name: string | null }>;
    } | null>({
      query: groq`*[_type == "categoryFilters" && categoryKey in $keys][0] {
        "filterItems": filters.filterItems[] {
          field,
          name
        }
      }`,
      params: { keys: catalogueKeys }
    });

    for (const item of doc?.filterItems ?? []) {
      const field = item?.field || item?.name;
      if (field) valid.add(field);
    }
    return valid;
  } catch (error) {
    console.error(`[getValidFilterFields] Failed for ${catalogueKeys.length} keys:`, error);
    return valid;
  }
};

/**
 * Cached set of valid filter field names for a category path: the fields
 * declared in the category's categoryFilters doc, plus `brand` and the
 * always-valid built-in slider fields (`priceRange`, `stockMin`). Server pages
 * use this to strip stale/unknown `?f=` fields BEFORE querying (G3), so SSR
 * never flashes an empty grid for shared/crawled URLs.
 */
export const getValidFilterFields = withCache(getValidFilterFieldsFn);

const getFiltersForCategoryPathFn = async (
  catalogueKeys: string[],
  activeFilters: string[] = []
): Promise<FilterResult> => {
  const EMPTY_RESULT: FilterResult = {
    filters: [],
    priceRange: { minPrice: null, maxPrice: null },
    maxStock: null
  };

  if (!catalogueKeys.length) {
    return EMPTY_RESULT;
  }

  const params = { keys: catalogueKeys };
  // Restrict the facet-count query to the currently active filters (adaptive refinement).
  const filterClause = FilterBuilder.buildClause(activeFilters);

  try {
    // Run every independent query concurrently (A5). Brand options and per-option
    // counts are derived from a single compact facet-data fetch (only brand and
    // specification fields are projected, bounded by product count).
    const [cmsFilters, minPriceQuery, maxPriceQuery, maxStockQuery, productCount, facetData] =
      await Promise.all([
        sanityFetch<{
          filterItems: Array<{
            name: string;
            type: string;
            field: string;
            options: string[];
            defaultValue: string | null;
            min: number | null;
            max: number | null;
            isMinOnly: boolean;
            step: number;
          }>;
        } | null>({
          query: groq`*[_type == "categoryFilters" && categoryKey in $keys][0] {
            "filterItems": filters.filterItems[] {
              name,
              type,
              field,
              options,
              defaultValue,
              min,
              max,
              isMinOnly,
              step
            }
          }`,
          params
        }),
        sanityFetch<{ price_data: { unit_amount: number } | null }>({
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data) ${filterClause}] | order(price_data.unit_amount asc)[0] {
            price_data
          }`,
          params
        }),
        sanityFetch<{ price_data: { unit_amount: number } | null }>({
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data) ${filterClause}] | order(price_data.unit_amount desc)[0] {
            price_data
          }`,
          params
        }),
        sanityFetch<{ stock: number | null }>({
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(stock) ${filterClause}] | order(stock desc)[0] {
            stock
          }`,
          params
        }),
        sanityFetch<number>({
          query: groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])`,
          params
        }),
        sanityFetch<FacetDataProduct[]>({
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 ${filterClause}] {
            "brandName": brand->name,
            overviewFields[] { title, value },
            specifications[] { title, value }
          }`,
          params
        })
      ]);

    const priceRange = {
      minPrice: minPriceQuery?.price_data?.unit_amount ?? null,
      maxPrice: maxPriceQuery?.price_data?.unit_amount ?? null
    };
    const maxStock = maxStockQuery?.stock ?? null;

    if (!productCount) {
      return { filters: [], priceRange, maxStock };
    }

    // Adaptive per-option counts (and distinct brands) derived from the filtered set.
    const counts = computeFilterCounts(facetData);

    const brandSet = new Set<string>();
    for (const product of facetData ?? []) {
      if (product.brandName) brandSet.add(product.brandName);
    }
    const brandSetLower = new Set<string>(
      Array.from(brandSet).map(name => name.toLowerCase())
    );

    // Attach counts to options. Brand keys are lowercased to match the
    // case-insensitive brand clause in FilterBuilder.
    const withCounts = (field: string, options: FilterOption[]): FilterOption[] =>
      options.map(opt => ({
        ...opt,
        count:
          field === 'brand'
            ? counts.get(`brand:${opt.value.toLowerCase()}`) ?? 0
            : counts.get(`${field}:${opt.value}`) ?? 0,
      }));

    // Brand facets are ordered by result count (desc), ties alphabetical (G14).
    const byCountDescThenAlpha = (a: FilterOption, b: FilterOption): number =>
      (b.count ?? 0) - (a.count ?? 0) || a.value.localeCompare(b.value);

    // Build filter groups
    const filters: FilterGroup[] = [];

    // Convert CMS filter items to FilterGroups (checkbox, radio, multiselect, boolean)
    if (cmsFilters?.filterItems?.length) {
      for (const item of cmsFilters.filterItems) {
        if (item.type === 'checkbox' || item.type === 'radio' || item.type === 'multiselect') {
          const options = (item.options || [])
            .filter(opt => opt && opt.length > 0)
            .map(opt => ({ value: opt, label: opt }));
          if (options.length > 0) {
            const field = item.field || item.name;
            filters.push({
              field,
              label: item.name,
              options: withCounts(field, options)
            });
          }
        } else if (item.type === 'boolean') {
          const field = item.field || item.name;
          filters.push({
            field,
            label: item.name,
            options: withCounts(field, [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ])
          });
        }
        // Range filters are handled by PriceRangeSlider / StockMinimumSlider UI
      }
    }

    // Brand filter: if CMS has a brand filter, intersect with actual product brands
    // Otherwise, add brand filter from extracted brands
    const hasCmsBrandFilter = cmsFilters?.filterItems?.some(
      item => (item.field || item.name).toLowerCase() === 'brand'
    );

    if (hasCmsBrandFilter) {
      // Find the CMS brand filter and intersect options with actual brands
      const cmsBrandItem = cmsFilters!.filterItems.find(
        item => (item.field || item.name).toLowerCase() === 'brand'
      );
      const validBrands = (cmsBrandItem?.options || [])
        .filter(brand => brandSetLower.has(brand.toLowerCase()))
        .map(brand => ({ value: brand, label: brand }));

      if (validBrands.length > 0) {
        // Replace any existing brand filter from CMS with intersected version
        const brandIndex = filters.findIndex(f => f.field.toLowerCase() === 'brand');
        if (brandIndex >= 0) {
          filters[brandIndex] = { field: 'brand', label: cmsBrandItem!.name, options: withCounts('brand', validBrands).sort(byCountDescThenAlpha) };
        } else {
          filters.push({ field: 'brand', label: cmsBrandItem!.name, options: withCounts('brand', validBrands).sort(byCountDescThenAlpha) });
        }
      }
    } else if (brandSet.size > 0) {
      // No CMS brand filter — add from extracted products
      filters.push({
        field: 'brand',
        label: 'Brand',
        options: withCounts('brand', Array.from(brandSet).map(brand => ({ value: brand, label: brand }))).sort(byCountDescThenAlpha)
      });
    }

    return { filters, priceRange, maxStock };
  } catch (error) {
    console.error(`[getFiltersForCategoryPath] Failed for ${catalogueKeys.length} keys:`, error);
    return EMPTY_RESULT;
  }
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
