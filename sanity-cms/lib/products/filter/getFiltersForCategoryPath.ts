import { sanityFetch } from '@/sanity-cms/lib/client';
import groq from 'groq';
import { cache } from 'react';

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

const getFiltersForCategoryPathFn = async (catalogueKeys: string[]): Promise<FilterResult> => {
  const EMPTY_RESULT: FilterResult = {
    filters: [],
    priceRange: { minPrice: null, maxPrice: null },
    maxStock: null
  };

  if (!catalogueKeys.length) {
    return EMPTY_RESULT;
  }

  const params = { keys: catalogueKeys };

  try {
    // Run every independent query concurrently (A5). Brand options are derived
    // from a server-side distinct query and a cheap count, so we never fetch
    // every product document just to extract unique brands.
    const [cmsFilters, minPriceQuery, maxPriceQuery, maxStockQuery, productCount, brandNames] =
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
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount asc)[0] {
            price_data
          }`,
          params
        }),
        sanityFetch<{ price_data: { unit_amount: number } | null }>({
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount desc)[0] {
            price_data
          }`,
          params
        }),
        sanityFetch<{ stock: number | null }>({
          query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(stock)] | order(stock desc)[0] {
            stock
          }`,
          params
        }),
        sanityFetch<number>({
          query: groq`count(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0])`,
          params
        }),
        sanityFetch<string[]>({
          query: groq`array::unique(*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(brand)].brand->name)`,
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

    // Distinct brands derived server-side (bounded by brand count, not products)
    const brandSet = new Set<string>(
      (brandNames || []).filter((name): name is string => Boolean(name))
    );
    const brandSetLower = new Set<string>(
      Array.from(brandSet).map(name => name.toLowerCase())
    );

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
            filters.push({
              field: item.field || item.name,
              label: item.name,
              options
            });
          }
        } else if (item.type === 'boolean') {
          filters.push({
            field: item.field || item.name,
            label: item.name,
            options: [
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' }
            ]
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
        .sort()
        .map(brand => ({ value: brand, label: brand }));

      if (validBrands.length > 0) {
        // Replace any existing brand filter from CMS with intersected version
        const brandIndex = filters.findIndex(f => f.field.toLowerCase() === 'brand');
        if (brandIndex >= 0) {
          filters[brandIndex] = { field: 'brand', label: cmsBrandItem!.name, options: validBrands };
        } else {
          filters.push({ field: 'brand', label: cmsBrandItem!.name, options: validBrands });
        }
      }
    } else if (brandSet.size > 0) {
      // No CMS brand filter — add from extracted products
      filters.push({
        field: 'brand',
        label: 'Brand',
        options: Array.from(brandSet).sort().map(brand => ({ value: brand, label: brand }))
      });
    }

    return { filters, priceRange, maxStock };
  } catch (error) {
    console.error(`[getFiltersForCategoryPath] Failed for ${catalogueKeys.length} keys:`, error);
    return EMPTY_RESULT;
  }
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
