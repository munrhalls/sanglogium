import { defineQuery } from "next-sanity";
import { client } from "../../client";
import {
  FilterOptions,
  FilterOptionObject,
} from "@/app/components/ui/filters/FilterTypes";

export const getFiltersForCategoryPath = async (
  catalogueKeys: string[]
): Promise<FilterOptions> => {
  if (catalogueKeys.length === 0) {
    // For empty keys (all products), get all categories and their filters
    const ALL_CATEGORIES_QUERY = defineQuery(`
      *[_type == "product"] {
        category
      } | order(category asc)
    `);

    try {
      const products = await client.fetch(ALL_CATEGORIES_QUERY);
      const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];

      if (categories.length === 0) {
        return [];
      }

      // Get filters for all categories
      const ALL_FILTERS_QUERY = defineQuery(`
        *[_type == "categoryFilters"] {
          title,
          "filters": filters.filterItems[]{
            name,
            type,
            options,
            defaultValue,
            min,
            max,
            isMinOnly,
            step
          }
        }
      `);

      const allFiltersData = await client.fetch(ALL_FILTERS_QUERY);

      if (!allFiltersData || allFiltersData.length === 0) {
        return [];
      }

      // Combine all filters from all categories
      const allFilters = allFiltersData.flatMap((categoryData: any) => categoryData.filters || []);

      // Deduplicate filters by name
      const uniqueFilters = allFilters.reduce((acc: any[], filter: any) => {
        if (!filter.name) return acc;
        const existing = acc.find(f => f.name === filter.name);
        if (!existing) {
          acc.push({
            name: filter.name,
            type: filter.type || null,
            options: filter.options || null,
            defaultValue: filter.defaultValue || null,
            min: filter.min !== undefined ? filter.min : null,
            max: filter.max !== undefined ? filter.max : null,
            isMinOnly: filter.isMinOnly || null,
            step: filter.step !== undefined ? filter.step : null,
          });
        }
        return acc;
      }, []);

      return uniqueFilters;
    } catch (err) {
      console.error("Error fetching all filters:", err);
      return [];
    }
  }

  const FILTERS_BY_VFS_KEYS_QUERY = defineQuery(`
    *[_type == "product" && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0] {
      category
    } | order(category asc)
  `);

  try {
    const products = await client.fetch(FILTERS_BY_VFS_KEYS_QUERY, { catalogueKeys });

    if (!products || products.length === 0) {
      return [];
    }

    const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
    const topLevelCategory = categories[0];

    const FILTERS_BY_CATEGORY_QUERY = defineQuery(`
      *[_type == "categoryFilters" && title == $topLevelCategory][0] {
        title,
        "filters": filters.filterItems[]{
          name,
          type,
          options,
          defaultValue,
          min,
          max,
          isMinOnly,
          step
        }
      }
    `);

    const filtersData = await client.fetch(FILTERS_BY_CATEGORY_QUERY, {
      topLevelCategory,
    });

    if (!filtersData) {
      console.warn(`No filter document found for category: ${topLevelCategory}`);
      return [];
    }

    const allFilters = filtersData.filters || [];

    return allFilters
      .filter((filter: any) => filter.name)
      .map((filter: any) => ({
        name: filter.name || "Unknown",
        type: filter.type || null,
        options: filter.options || null,
        defaultValue: filter.defaultValue || null,
        min: filter.min !== undefined ? filter.min : null,
        max: filter.max !== undefined ? filter.max : null,
        isMinOnly: filter.isMinOnly || null,
        step: filter.step !== undefined ? filter.step : null,
      }));
  } catch (err) {
    console.error("Error fetching filters for VFS keys:", err);
    return [];
  }
};
