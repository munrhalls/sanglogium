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
  if (!catalogueKeys.length) {
    return {
      filters: [],
      priceRange: { minPrice: null, maxPrice: null },
      maxStock: null
    };
  }

  // Fetch CMS categoryFilters config for this category (if any)
  const cmsFilters = await sanityFetch<{
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
    params: { keys: catalogueKeys }
  });

  // Query price range using GROQ order and slicing (efficient alternative to aggregation)
  const minPriceQuery = await sanityFetch<{
    price_data: { unit_amount: number } | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount asc)[0] {
      price_data
    }`,
    params: { keys: catalogueKeys }
  });

  const maxPriceQuery = await sanityFetch<{
    price_data: { unit_amount: number } | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(price_data)] | order(price_data.unit_amount desc)[0] {
      price_data
    }`,
    params: { keys: catalogueKeys }
  });

  const priceRange = {
    minPrice: minPriceQuery?.price_data?.unit_amount ?? null,
    maxPrice: maxPriceQuery?.price_data?.unit_amount ?? null
  };

  // Query maximum stock for slider upper bound
  const maxStockQuery = await sanityFetch<{
    stock: number | null;
  }>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0 && defined(stock)] | order(stock desc)[0] {
      stock
    }`,
    params: { keys: catalogueKeys }
  });

  // Query products to extract unique filter values
  const products = await sanityFetch<any[]>({
    query: groq`*[_type == "product" && count(catalogueLocationKeys[@ in $keys]) > 0] {
      price_data,
      brand->{name},
      stock
    }`,
    params: { keys: catalogueKeys }
  });


  if (!products.length) {
    return {
      filters: [],
      priceRange,
      maxStock: maxStockQuery?.stock ?? null
    };
  }

  // Extract unique brands from actual products
  const brandSet = new Set<string>();
  for (const product of products) {
    if (product.brand?.name) {
      brandSet.add(product.brand.name);
    }
  }

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
      .filter(brand => brandSet.has(brand))
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

  return {
    filters,
    priceRange,
    maxStock: maxStockQuery?.stock ?? null
  };
};

export const getFiltersForCategoryPath = withCache(getFiltersForCategoryPathFn);
